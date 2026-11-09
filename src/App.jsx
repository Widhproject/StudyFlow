// Autentikasi, data real-time, dan kerangka navigasi
import {useEffect,useRef,useState} from 'react'
import {sb,Ctx,save,iso,dow,hm} from './lib'
import * as P from './pages'

const TABLES=['courses','assignments','todos','exams','habits','habit_logs','notes']
const NAV=[['beranda','Beranda','🏠',P.Dashboard],['jadwal','Jadwal','🗓️',P.Jadwal],['tugas','Tugas','📚',P.Tugas],['kalender','Kalender','📅',P.Kalender],
  ['todo','To-Do','✅',P.Todos],['ujian','Ujian','⏳',P.Ujian],['habit','Habit','🔥',P.Habit],['catatan','Catatan','📝',P.Catatan],['statistik','Statistik','📈',P.Statistik],['pengaturan','Pengaturan','⚙️',P.Pengaturan]]
const ERR={'Invalid login credentials':'Email atau password salah.','User already registered':'Email sudah terdaftar. Silakan masuk.','Email not confirmed':'Email belum dikonfirmasi. Cek kotak masukmu.'}

function Auth(){
  const [mode,setMode]=useState('masuk'),[f,setF]=useState({nama:'',email:'',pw:''}),[msg,setMsg]=useState(''),[ok,setOk]=useState(false),[busy,setB]=useState(false)
  const S=k=>e=>setF({...f,[k]:e.target.value})
  const submit=async e=>{
    e.preventDefault(); setMsg(''); setOk(false)
    if(!/^\S+@\S+\.\S+$/.test(f.email))return setMsg('Format email tidak valid.')
    if(mode==='daftar'&&!f.nama.trim())return setMsg('Nama wajib diisi.')
    if(mode!=='lupa'&&f.pw.length<6)return setMsg('Password minimal 6 karakter.')
    setB(true); let r
    if(mode==='masuk')r=await sb.auth.signInWithPassword({email:f.email,password:f.pw})
    else if(mode==='daftar'){r=await sb.auth.signUp({email:f.email,password:f.pw,options:{data:{nama:f.nama.trim()},emailRedirectTo:location.origin}});if(!r.error&&!r.data.session){setOk(true);setMsg('Pendaftaran berhasil. Cek email untuk konfirmasi.')}}
    else{r=await sb.auth.resetPasswordForEmail(f.email,{redirectTo:location.origin});if(!r.error){setOk(true);setMsg('Tautan reset password dikirim ke emailmu.')}}
    setB(false); if(r.error)setMsg(ERR[r.error.message]||r.error.message)
  }
  return <div className="auth"><form className="authbox" onSubmit={submit} noValidate>
    <div className="logo">🎓</div><h1>StudyFlow</h1><p className="mu">Atur jadwal, selesaikan tugas, capai tujuanmu!</p>
    {mode==='daftar'&&<label>Nama<input value={f.nama} onChange={S('nama')} autoComplete="name"/></label>}
    <label>Email<input type="email" value={f.email} onChange={S('email')} autoComplete="email"/></label>
    {mode!=='lupa'&&<label>Password<input type="password" value={f.pw} onChange={S('pw')} autoComplete={mode==='masuk'?'current-password':'new-password'}/></label>}
    {msg&&<p className={ok?'okm':'err'} role="alert">{msg}</p>}
    <button className="btn" disabled={busy}>{busy?'Memproses…':mode==='masuk'?'Masuk':mode==='daftar'?'Daftar':'Kirim tautan reset'}</button>
    {mode!=='lupa'&&<button type="button" className="btn ghost" onClick={()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin}})}>Lanjut dengan Google</button>}
    <div className="links">{mode==='masuk'?<><a onClick={()=>setMode('daftar')}>Buat akun</a><a onClick={()=>setMode('lupa')}>Lupa password?</a></>:<a onClick={()=>setMode('masuk')}>Kembali ke masuk</a>}</div>
  </form></div>
}

function Shell({user,rec}){
  const [page,setPage]=useState(rec?'pengaturan':'beranda'),[more,setMore]=useState(false)
  const [d,setD]=useState(Object.fromEntries(TABLES.map(t=>[t,[]]))),[load,setLoad]=useState(true),[err,setErr]=useState('')
  const [profile,setProfile]=useState(null),[st,setSt]=useState({tema:localStorage.tema||'terang',waktu_pengingat:60}),[tm,setTm]=useState('')
  const seen=useRef(new Set())
  const toast=m=>{setTm(m);setTimeout(()=>setTm(''),2500)}
  const reload=async t=>{const {data,error}=await sb.from(t).select('*').order('created_at');error?setErr(error.message):(setErr(''),setD(p=>({...p,[t]:data})))}
  useEffect(()=>{
    Promise.all(TABLES.map(reload)).then(()=>setLoad(false))
    sb.from('profiles').select('*').eq('id',user.id).maybeSingle().then(({data})=>setProfile(data))
    sb.from('settings').select('*').eq('user_id',user.id).maybeSingle().then(({data})=>data&&setSt(data))
    const ch=sb.channel('sync'); TABLES.forEach(t=>ch.on('postgres_changes',{event:'*',schema:'public',table:t},()=>reload(t))); ch.subscribe()
    return()=>sb.removeChannel(ch)
  },[user.id])
  useEffect(()=>{document.documentElement.dataset.theme=st.tema==='gelap'?'dark':'light';localStorage.tema=st.tema},[st.tema])
  useEffect(()=>{ // pengingat lokal (aktif selama aplikasi terbuka)
    const tick=()=>{ if(!('Notification' in window)||Notification.permission!=='granted')return
      const now=Date.now(),w=(st.waktu_pengingat||60)*6e4,td=iso(new Date()),fire=(k,t,b)=>{if(!seen.current.has(k)){seen.current.add(k);new Notification(t,{body:b})}}
      d.courses.filter(c=>+c.hari===dow(new Date())).forEach(c=>{const x=new Date(td+'T'+c.jam_mulai)-now;if(x>0&&x<=w)fire('c'+c.id+td,'Kelas segera mulai',`${c.nama} • ${hm(c.jam_mulai)} • ${c.ruang||''}`)})
      d.assignments.filter(a=>a.status!=='selesai').forEach(a=>{const x=new Date(a.deadline)-now;if(x>0&&x<=w)fire('a'+a.id+a.deadline,'Deadline tugas',a.judul)})}
    tick(); const i=setInterval(tick,6e4); return()=>clearInterval(i)
  },[d,st.waktu_pengingat])
  const toggle=async(t,r)=>{
    const done=r.status!=='selesai'; await save(t,{...r,status:done?'selesai':'belum'})
    if(done&&t==='todos'&&r.pengulangan!=='tidak'&&r.deadline){ // buat to-do berikutnya
      const n=new Date(r.deadline);n.setDate(n.getDate()+(r.pengulangan==='harian'?1:7))
      const {id,created_at,selesai_at,...rest}=r; await save('todos',{...rest,status:'belum',deadline:n.toISOString()})}
    reload(t)
  }
  const toggleHabit=async(h,s)=>{
    const cur=d.habit_logs.some(l=>l.habit_id===h.id&&l.tanggal===s&&l.selesai)
    const {error}=await sb.from('habit_logs').upsert({habit_id:h.id,tanggal:s,selesai:!cur},{onConflict:'habit_id,tanggal'}); error?toast(error.message):reload('habit_logs')
  }
  const cname=id=>d.courses.find(c=>c.id===id)?.nama||'—'
  const go=p=>{setPage(p);setMore(false);scrollTo(0,0)}
  const Page=NAV.find(n=>n[0]===page)[3], bottom=NAV.slice(0,4), rest=NAV.slice(4)
  return <Ctx.Provider value={{d,user,profile,st,setSt,reload,toast,toggle,toggleHabit,cname,go}}>
    <aside className="side"><div className="brand">🎓 StudyFlow</div>{NAV.map(n=><button key={n[0]} className={page===n[0]?'on':''} onClick={()=>go(n[0])}>{n[2]} {n[1]}</button>)}
      <button onClick={()=>sb.auth.signOut()}>🚪 Keluar</button></aside>
    <main>{err&&<div className="banner" role="alert">Koneksi bermasalah: {err}</div>}{load?<div className="load">Memuat data…</div>:<Page/>}</main>
    <nav className="bot">{bottom.map(n=><button key={n[0]} className={page===n[0]?'on':''} onClick={()=>go(n[0])}><span>{n[2]}</span>{n[1]}</button>)}
      <button className={more?'on':''} onClick={()=>setMore(!more)}><span>⋯</span>Lainnya</button></nav>
    {more&&<div className="more">{rest.map(n=><button key={n[0]} onClick={()=>go(n[0])}>{n[2]} {n[1]}</button>)}<button onClick={()=>sb.auth.signOut()}>🚪 Keluar</button></div>}
    {tm&&<div className="toast" role="status">{tm}</div>}
  </Ctx.Provider>
}

export default function App(){
  const [s,setS]=useState(undefined),[rec,setRec]=useState(false)
  useEffect(()=>{ // sesi tersimpan otomatis oleh Supabase
    sb.auth.getSession().then(({data})=>setS(data.session))
    const {data}=sb.auth.onAuthStateChange((e,x)=>{setS(x);if(e==='PASSWORD_RECOVERY')setRec(true)})
    return()=>data.subscription.unsubscribe()
  },[])
  if(!import.meta.env.VITE_SUPABASE_URL)return <div className="load">Isi file .env dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.</div>
  if(s===undefined)return <div className="load">Memuat…</div>
  return s?<Shell user={s.user} rec={rec}/>:<Auth/>
}
