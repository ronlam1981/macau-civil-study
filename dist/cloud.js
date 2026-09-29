'use strict';
window.CivilCloud=(()=>{
 let active=false;
 let client=null,adapter=null,user=null,mode='setup',message='Google 登入及同步尚待連接帳戶。',revision=0,generation=0,pending=null,timer=null,flight=null;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const draftKey=()=>`civil-cloud-draft:${user.id}`;
 function announce(m,t){mode=m;message=t;const el=document.getElementById('cloud-status');if(el)el.textContent=t;window.dispatchEvent(new Event('civil-cloud-status'));}
 function keepDraft(){if(!user||!pending)return;try{localStorage.setItem(draftKey(),JSON.stringify({revision,state:pending}));}catch{announce('offline','瀏覽器亦無法保存草稿，請立即匯出備份。');}}
 async function initialise(a){adapter=a;const c=window.CIVIL_CLOUD_CONFIG;if(!c?.url||!c?.publishableKey)return;try{
  const u=new URL(c.url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.pathname!=='/')throw Error('設定格式不正確');
  if(c.publishableKey.startsWith('sb_secret_')||(c.publishableKey.startsWith('eyJ')&&JSON.parse(atob(c.publishableKey.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role!=='anon'))throw Error('不可使用私人密鑰');
  client=window.supabase.createClient(u.origin,c.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
  client.auth.onAuthStateChange((event,session)=>{if(user&&(!session||session.user.id!==user.id)){keepDraft();active=false;user=null;pending=null;adapter.restoreGuest();announce('signedout','帳戶已變更，請重新載入以確認登入。');}});
  announce('loading','正在確認登入及同步狀態…');
  const code=new URLSearchParams(location.search).get('code');if(code){const {error}=await client.auth.exchangeCodeForSession(code);if(error)throw error;history.replaceState({},'',location.pathname+location.hash);}
  const {data:{session},error}=await client.auth.getSession();if(error)throw error;
  if(!session){announce(window.CIVIL_CLOUD_CONFIG.googleReady===false?'provider-setup':'signedout',window.CIVIL_CLOUD_CONFIG.googleReady===false?'已配置 Supabase 連接；Google 登入尚未啟用，進度暫存本機。':'未登入 Google；目前使用本機紀錄。');return;}
  const {data,error:ue}=await client.auth.getUser();if(ue||!data.user)throw ue||Error();user=data.user;
  const member=await client.from('civil_members').select('email').eq('email',user.email.toLowerCase()).maybeSingle();if(member.error)throw member.error;
  if(!member.data){announce('blocked','此 Google 帳戶尚未獲邀請，無法讀寫雲端學習紀錄。');return;}
  await loadRemote(false);
 }catch(err){announce('offline','未能連接雲端。紀錄未上傳；請检查設定或連線後重新載入。');}}
 async function loadRemote(discard){if(!client||!user)return;const member=await client.from('civil_members').select('email').eq('email',user.email.toLowerCase()).maybeSingle();if(member.error)throw member.error;if(!member.data){keepDraft();active=false;pending=null;adapter.restoreGuest();announce('blocked','此帳戶未獲邀請或權限已撤銷，不能使用雲端紀錄。');return;}const {data,error}=await client.from('civil_learning_state').select('revision,state').eq('user_id',user.id).maybeSingle();if(error)throw error;
  if(data&&!adapter.valid(data.state))throw Error('雲端紀錄格式不相容');revision=data?.revision||0;
  let draft=null;try{draft=JSON.parse(localStorage.getItem(draftKey())||'null');}catch{}
  if(!discard&&draft&&adapter.valid(draft.state)){active=true;pending=draft.state;adapter.setState(clone(pending));if(draft.revision!==revision){announce('conflict','另一裝置已更新紀錄；本機草稿保留，請先匯出，再載入雲端版本。');return;}announce('ready','已恢復未同步草稿，正在重試。');await flush();return;}
  active=true;pending=null;adapter.setState(data?clone(data.state):adapter.empty());announce('ready',data?'已載入雲端紀錄。':'已登入；雲端尚無紀錄，可匯入先前備份。');
  if(discard)localStorage.removeItem(draftKey());
 }
 function changed(state){if(!active||!user||!['ready','saving','offline','conflict'].includes(mode))return;pending=clone(state);generation++;keepDraft();if(mode==='conflict'||mode==='offline')return;clearTimeout(timer);timer=setTimeout(()=>flush(),800);}
 async function flush(){clearTimeout(timer);if(flight)return flight;if(!active||!pending||!client||!user||mode==='conflict')return;
  flight=(async()=>{while(pending){let body=clone(pending),sent=generation;announce('saving','正在同步…');const {data,error}=await client.rpc('civil_save_state',{expected_revision:revision,new_state:body});
   if(error){announce('offline','同步失敗，草稿已保留；請重試或匯出備份。');return;}
   if(!Array.isArray(data)||!data.length){announce('conflict','另一裝置已更新紀錄，已停止覆寫；請匯出草稿並載入雲端版本。');return;}
   revision=Number(data[0].revision);if(sent===generation){pending=null;try{localStorage.removeItem(draftKey());}catch{}}else keepDraft();
  }announce('ready','已同步 · '+new Date().toLocaleTimeString('zh-Hant',{hour:'2-digit',minute:'2-digit'}));})().catch(()=>announce('offline','同步失敗，草稿保留於此裝置。')).finally(()=>flight=null);return flight;
 }
 async function login(){if(window.CIVIL_CLOUD_CONFIG?.googleReady===false){adapter?.notice('Google 登入尚待完成設定。');return;}if(!client){adapter?.notice('請先完成 Supabase 與 Google 設定。');return;}const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});if(error)adapter.notice('未能開始 Google 登入。');}
 async function logout(){if(pending){await flush();if(pending){adapter.notice('仍有未同步草稿，請先處理同步或匯出備份。');return;}}if(!client)return;const {error}=await client.auth.signOut();if(error){adapter.notice('登出失敗，請重試。');return;}active=false;user=null;revision=0;adapter.restoreGuest();announce('signedout','已登出；顯示原有本機紀錄。');}
 async function reload(){if(!user){location.reload();return;}if(pending&&!confirm('載入雲端版本會放棄目前草稿。請先匯出備份；確定繼續？'))return;try{await loadRemote(true);}catch{announce('offline','雲端讀取失敗，未替換本機紀錄。');}}
 return {initialise,changed,flush,login,logout,reload,info:()=>({mode,message,email:user?.email||'',configured:!!client,googleReady:!!client&&window.CIVIL_CLOUD_CONFIG?.googleReady!==false}),storageKey:()=>active&&user&&['ready','saving','offline','conflict'].includes(mode)?'macau-civil-study-v1:user:'+user.id:'macau-civil-study-v1'};
})();
