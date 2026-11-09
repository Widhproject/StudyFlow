// Autentikasi, data real-time / mode lokal, dan kerangka navigasi StudyFlow
import {useEffect,useRef,useState} from 'react'
import {sb,hasSupabase,Ctx,save,iso,dow,hm,PRI,STA,opt,createSeedData,FormSheet} from './lib'
import * as P from './pages'

const TABLES=['courses','assignments','todos','exams','habits','habit_logs','notes']
const NAV=[
  ['beranda','Beranda','🏠',P.Dashboard],
  ['jadwal','Jadwal','🗓️',P.Jadwal],
  ['kalender','Kalender','📅',P.Kalender],
  ['tugas','Tugas','📚',P.Tugas],
  ['todo','To-Do','✅',P.Todos],
  ['ujian','Jadwal Ujian','⏳',P.Ujian],
  ['habit','Habit Tracker','🔥',P.Habit],
  ['catatan','Catatan Cepat','📝',P.Catatan],
  ['statistik','Statistik','📈',P.Statistik],
  ['notifikasi','Notifikasi','🔔',P.Notifikasi],
  ['pengaturan','Pengaturan','⚙️',P.Pengaturan]
]
const ERR={
  'Invalid login credentials':'Email atau password salah.',
  'User already registered':'Email sudah terdaftar. Silakan masuk.',
  'Email not confirmed':'Email belum dikonfirmasi. Cek kotak masukmu.'
}

function StudentIllustration(){
  return <svg className="hero-illus" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Sparkles & background glow */}
    <circle cx="155" cy="118" r="78" fill="url(#glow)" opacity="0.35"/>
    <path d="M52 58L55 66L63 69L55 72L52 80L49 72L41 69L49 66L52 58Z" fill="#FBBF24"/>
    <circle cx="78" cy="40" r="3" fill="#FDE68A" opacity="0.8"/>
    <circle cx="255" cy="36" r="3.5" fill="#FDE68A" opacity="0.8"/>
    <path d="M276 112L278 117L283 119L278 121L276 126L274 121L269 119L274 117L276 112Z" fill="#FBBF24"/>

    {/* Floating checklist card on right */}
    <g transform="translate(206, 48)">
      <rect x="0" y="0" width="76" height="54" rx="10" fill="#F8FAFC" fillOpacity="0.95" stroke="#DDD6FE" strokeWidth="1.5"/>
      <circle cx="15" cy="16" r="5.5" fill="#34D399"/>
      <path d="M12.5 16L14.3 17.8L17.8 14.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="26" y="13" width="38" height="5" rx="2.5" fill="#94A3B8"/>
      <circle cx="15" cy="31" r="5.5" fill="#34D399"/>
      <path d="M12.5 31L14.3 32.8L17.8 29.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="26" y="28" width="32" height="5" rx="2.5" fill="#94A3B8"/>
      <rect x="26" y="40" width="24" height="4" rx="2" fill="#CBD5E1"/>
    </g>

    {/* Student character */}
    <g>
      {/* Shoulders / Lavender Hoodie */}
      <path d="M72 192C72 152 96 130 132 130H168C200 130 218 152 218 192H72Z" fill="url(#hoodie)"/>
      {/* Hoodie collar & strings */}
      <path d="M118 130C125 144 165 144 172 130" stroke="#7C6CF0" strokeWidth="4" strokeLinecap="round"/>
      {/* Neck & Head */}
      <rect x="136" y="112" width="20" height="22" rx="8" fill="#FDBA8C"/>
      <path d="M122 86C122 68 134 58 149 58C164 58 175 68 175 86V102C175 116 164 125 149 125C134 125 122 116 122 102V86Z" fill="#FDBA8C"/>
      {/* Hair */}
      <path d="M119 85C117 65 131 50 152 52C171 53 182 66 178 84C174 75 166 72 156 72C143 72 134 77 126 88C123 91 120 89 119 85Z" fill="#1E1B3A"/>
      <circle cx="122" cy="94" r="6" fill="#FDBA8C"/>
      {/* Eyes & Smile */}
      <path d="M139 95C141 97 144 97 146 95" stroke="#1E1B3A" strokeWidth="2.3" strokeLinecap="round"/>
      <path d="M157 95C159 97 162 97 164 95" stroke="#1E1B3A" strokeWidth="2.3" strokeLinecap="round"/>
      <path d="M146 108C149 111 154 111 157 108" stroke="#C26D53" strokeWidth="2.2" strokeLinecap="round"/>
      {/* Hands at desk */}
      <ellipse cx="132" cy="186" rx="12" ry="7" fill="#FDBA8C"/>
      <ellipse cx="164" cy="186" rx="12" ry="7" fill="#FDBA8C"/>
    </g>

    {/* Stack of books on left */}
    <g transform="translate(30, 160)">
      <rect x="0" y="18" width="62" height="13" rx="4" fill="#EF4444"/>
      <rect x="4" y="21" width="54" height="7" rx="2" fill="#FEF2F2"/>
      <rect x="5" y="5" width="54" height="13" rx="4" fill="#F59E0B"/>
      <rect x="9" y="8" width="46" height="7" rx="2" fill="#FFFBEB"/>
    </g>

    {/* Laptop on right */}
    <g transform="translate(154, 138)">
      <path d="M14 0H102C106 0 109 3 108 7L98 52H4L10 5C10.5 2 12 0 14 0Z" fill="#1E1B3A" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="56" cy="26" r="6" fill="#6366F1" opacity="0.7"/>
      <rect x="0" y="50" width="106" height="6" rx="3" fill="#94A3B8"/>
    </g>

    {/* Desk surface line */}
    <rect x="20" y="192" width="280" height="5" rx="2.5" fill="#A5B4FC" fillOpacity="0.45"/>

    <defs>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(155 118) scale(78)">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#5B4BD5" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="hoodie" x1="72" y1="130" x2="218" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4B5FD"/>
        <stop offset="1" stopColor="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>
}

function Auth({onEnterDemo}){
  const [showEmail,setShowEmail]=useState(false)
  const [mode,setMode]=useState('masuk')
  const [f,setF]=useState({nama:'',email:'',pw:''})
  const [msg,setMsg]=useState('')
  const [ok,setOk]=useState(false)
  const [busy,setB]=useState(false)
  const S=k=>e=>setF({...f,[k]:e.target.value})

  const submit=async e=>{
    e.preventDefault(); setMsg(''); setOk(false)
    if(!/^\S+@\S+\.\S+$/.test(f.email))return setMsg('Format email tidak valid.')
    if(mode==='daftar'&&!f.nama.trim())return setMsg('Nama wajib diisi.')
    if(mode!=='lupa'&&f.pw.length<6)return setMsg('Password minimal 6 karakter.')
    if(!hasSupabase){
      localStorage.studyflow_demo_name=f.nama.trim()||f.email.split('@')[0]||'Andi'
      onEnterDemo()
      return
    }
    setB(true); let r
    if(mode==='masuk')r=await sb.auth.signInWithPassword({email:f.email,password:f.pw})
    else if(mode==='daftar'){
      r=await sb.auth.signUp({email:f.email,password:f.pw,options:{data:{nama:f.nama.trim()},emailRedirectTo:location.origin}})
      if(!r.error&&!r.data.session){setOk(true);setMsg('Pendaftaran berhasil. Cek email untuk konfirmasi.')}
    }else{
      r=await sb.auth.resetPasswordForEmail(f.email,{redirectTo:location.origin})
      if(!r.error){setOk(true);setMsg('Tautan reset password dikirim ke emailmu.')}
    }
    setB(false)
    if(r?.error)setMsg(ERR[r.error.message]||r.error.message)
  }

  const handleGoogle=()=>{
    if(!hasSupabase){onEnterDemo();return}
    sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin}})
  }

  return <div className="auth-screen">
    <div className="auth-card">
      <div className="auth-brand">
        <div className="auth-logo-box">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" opacity="0.85"/>
          </svg>
        </div>
        <h1>StudyFlow</h1>
        <p className="auth-tag-pill">Plan · Track · Achieve</p>
        <p className="auth-desc">Atur jadwal, selesaikan tugas,<br/>capai tujuanmu!</p>
      </div>

      {!showEmail?(
        <>
          <StudentIllustration/>
          <div className="auth-actions">
            <button type="button" className="auth-btn-google" onClick={handleGoogle}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/>
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"/>
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"/>
              </svg>
              Lanjut dengan Google
            </button>

            <button type="button" className="auth-btn-email" onClick={()=>setShowEmail(true)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M22 7l-10 7L2 7"/>
              </svg>
              Lanjut dengan Email
            </button>

            <button type="button" className="auth-skip" onClick={onEnterDemo}>
              Masuk nanti →
            </button>
          </div>
        </>
      ):(
        <form className="auth-form-panel" onSubmit={submit} noValidate>
          <div className="auth-form-head">
            <button type="button" className="auth-back" onClick={()=>{setShowEmail(false);setMsg('')}}>← Kembali</button>
            <b>{mode==='masuk'?'Masuk dengan Email':mode==='daftar'?'Daftar Akun':'Reset Password'}</b>
          </div>
          {mode==='daftar'&&<label>Nama Panggilan<input value={f.nama} onChange={S('nama')} placeholder="Contoh: Andi" autoComplete="name"/></label>}
          <label>Email<input type="email" value={f.email} onChange={S('email')} placeholder="andi@kampus.ac.id" autoComplete="email"/></label>
          {mode!=='lupa'&&<label>Password<input type="password" value={f.pw} onChange={S('pw')} placeholder="Minimal 6 karakter" autoComplete={mode==='masuk'?'current-password':'new-password'}/></label>}
          {msg&&<p className={ok?'okm':'err'} role="alert">{msg}</p>}
          <button className="auth-submit-btn" disabled={busy}>{busy?'Memproses…':mode==='masuk'?'Masuk Sekarang':mode==='daftar'?'Buat Akun':'Kirim Tautan Reset'}</button>
          <div className="auth-switch-links">
            {mode==='masuk'?(
              <>
                <a onClick={()=>{setMode('daftar');setMsg('')}}>Belum punya akun? Daftar</a>
                <a onClick={()=>{setMode('lupa');setMsg('')}}>Lupa password?</a>
              </>
            ):(
              <a onClick={()=>{setMode('masuk');setMsg('')}}>Sudah punya akun? Masuk</a>
            )}
          </div>
        </form>
      )}
    </div>
  </div>
}

function Shell({user,rec,isDemo,exitDemo}){
  const [page,setPage]=useState(rec?'pengaturan':'beranda')
  const [more,setMore]=useState(false)
  const [quickTodo,setQuickTodo]=useState(false)
  const [d,setD]=useState(()=>{
    if(isDemo){
      try{
        const saved=localStorage.getItem('studyflow_demo_data')
        if(saved)return JSON.parse(saved)
      }catch(e){}
      const seed=createSeedData()
      localStorage.setItem('studyflow_demo_data',JSON.stringify(seed))
      return seed
    }
    return Object.fromEntries(TABLES.map(t=>[t,[]]))
  })
  const [load,setLoad]=useState(!isDemo)
  const [err,setErr]=useState('')
  const [profile,setProfile]=useState(()=>isDemo?{nama:localStorage.studyflow_demo_name||'Andi'}:null)
  const [st,setSt]=useState({tema:localStorage.tema||'terang',waktu_pengingat:60})
  const [tm,setTm]=useState('')
  const seen=useRef(new Set())

  const toast=m=>{setTm(m);setTimeout(()=>setTm(''),2500)}

  const persistDemo=next=>{
    setD(next)
    try{localStorage.setItem('studyflow_demo_data',JSON.stringify(next))}catch(e){}
  }

  const demoSave=(t,row)=>{
    setD(prev=>{
      const list=[...(prev[t]||[])]
      if(row.id){
        const idx=list.findIndex(x=>x.id===row.id)
        if(idx>=0)list[idx]={...list[idx],...row}
        else list.unshift({...row,created_at:new Date().toISOString()})
      }else{
        list.unshift({...row,id:`${t}-${Date.now()}`,created_at:new Date().toISOString()})
      }
      const next={...prev,[t]:list}
      try{localStorage.setItem('studyflow_demo_data',JSON.stringify(next))}catch(e){}
      return next
    })
  }

  const demoDelete=(t,id)=>{
    setD(prev=>{
      const next={...prev,[t]:(prev[t]||[]).filter(x=>x.id!==id)}
      try{localStorage.setItem('studyflow_demo_data',JSON.stringify(next))}catch(e){}
      return next
    })
  }

  const resetDemoData=()=>{
    const seed=createSeedData()
    persistDemo(seed)
  }

  const reload=async t=>{
    if(isDemo){
      if(t==='profile')setProfile({nama:localStorage.studyflow_demo_name||'Andi'})
      return
    }
    const {data,error}=await sb.from(t).select('*').order('created_at')
    error?setErr(error.message):(setErr(''),setD(p=>({...p,[t]:data})))
  }

  useEffect(()=>{
    if(isDemo)return
    Promise.all(TABLES.map(reload)).then(()=>setLoad(false))
    sb.from('profiles').select('*').eq('id',user.id).maybeSingle().then(({data})=>setProfile(data))
    sb.from('settings').select('*').eq('user_id',user.id).maybeSingle().then(({data})=>data&&setSt(data))
    const ch=sb.channel('sync')
    TABLES.forEach(t=>ch.on('postgres_changes',{event:'*',schema:'public',table:t},()=>reload(t)))
    ch.subscribe()
    return()=>sb.removeChannel(ch)
  },[user?.id,isDemo])

  useEffect(()=>{
    document.documentElement.dataset.theme=st.tema==='gelap'?'dark':'light'
    localStorage.tema=st.tema
  },[st.tema])

  useEffect(()=>{
    const tick=()=>{
      if(!('Notification' in window)||Notification.permission!=='granted')return
      const now=Date.now(),w=(st.waktu_pengingat||60)*6e4,td=iso(new Date())
      const fire=(k,t,b)=>{if(!seen.current.has(k)){seen.current.add(k);new Notification(t,{body:b})}}
      d.courses.filter(c=>+c.hari===dow(new Date())).forEach(c=>{const x=new Date(td+'T'+c.jam_mulai)-now;if(x>0&&x<=w)fire('c'+c.id+td,'Kelas segera mulai',`${c.nama} • ${hm(c.jam_mulai)} • ${c.ruang||''}`)})
      d.assignments.filter(a=>a.status!=='selesai').forEach(a=>{const x=new Date(a.deadline)-now;if(x>0&&x<=w)fire('a'+a.id+a.deadline,'Deadline tugas',a.judul)})
    }
    tick(); const i=setInterval(tick,6e4); return()=>clearInterval(i)
  },[d,st.waktu_pengingat])

  const toggle=async(t,r)=>{
    const done=r.status!=='selesai'
    await save(t,{...r,status:done?'selesai':'belum'},isDemo?demoSave:null)
    if(done&&t==='todos'&&r.pengulangan&&r.pengulangan!=='tidak'&&r.deadline){
      const n=new Date(r.deadline);n.setDate(n.getDate()+(r.pengulangan==='harian'?1:7))
      const {id,created_at,selesai_at,...rest}=r
      await save('todos',{...rest,status:'belum',deadline:n.toISOString()},isDemo?demoSave:null)
    }
    reload(t)
  }

  const toggleHabit=async(h,s)=>{
    const cur=d.habit_logs.some(l=>l.habit_id===h.id&&l.tanggal===s&&l.selesai)
    if(isDemo){
      setD(prev=>{
        const filtered=prev.habit_logs.filter(l=>!(l.habit_id===h.id&&l.tanggal===s))
        const nextLogs=cur?filtered:[...filtered,{id:`hl-${Date.now()}`,habit_id:h.id,tanggal:s,selesai:true}]
        const next={...prev,habit_logs:nextLogs}
        try{localStorage.setItem('studyflow_demo_data',JSON.stringify(next))}catch(e){}
        return next
      })
      return
    }
    const {error}=await sb.from('habit_logs').upsert({habit_id:h.id,tanggal:s,selesai:!cur},{onConflict:'habit_id,tanggal'})
    error?toast(error.message):reload('habit_logs')
  }

  const cname=id=>d.courses.find(c=>c.id===id)?.nama||'Pemrograman Web'
  const go=p=>{setPage(p);setMore(false);scrollTo(0,0)}
  const Page=(NAV.find(n=>n[0]===page)||NAV[0])[3]
  const moreItems=NAV.filter(n=>!['beranda','jadwal','statistik'].includes(n[0]))

  const quickTodoFields=[
    {k:'judul',l:'Judul To-Do',req:1,ph:'Belajar React'},
    {k:'kategori',l:'Mata Kuliah',type:'select',noEmpty:true,opts:d.courses.length?d.courses.map(c=>[c.nama,c.nama]):[['Pemrograman Web','Pemrograman Web']]},
    {k:'prioritas',l:'Prioritas',req:1,opts:opt(PRI)},
    {k:'deadline',l:'Deadline',type:'datetime'},
    {k:'status',l:'Status Awal',type:'select',req:1,noEmpty:true,opts:opt(STA)},
    {k:'catatan',l:'Catatan (Opsional)',type:'textarea',ph:'Tambah catatan...'}
  ]

  const saveQuickTodo=async row=>{
    const clean={...row,pengulangan:'tidak'}
    if(clean.deadline)clean.deadline=new Date(clean.deadline).toISOString()
    else clean.deadline=null
    const er2=await save('todos',clean,isDemo?demoSave:null)
    if(er2)return toast(er2.message)
    setQuickTodo(false); reload('todos'); toast('To-Do ditambahkan')
  }

  return <Ctx.Provider value={{
    d,user,profile,st,setSt,reload,toast,toggle,toggleHabit,cname,go,
    isDemo,exitDemo,resetDemoData,
    demoSave:isDemo?demoSave:null,
    demoDelete:isDemo?demoDelete:null,
    openQuickTodo:()=>setQuickTodo(true)
  }}>
    <div className="app-layout">
      <aside className="side">
        <div className="brand">
          <span className="brand-badge">🎓</span>
          <div>
            <b>StudyFlow</b>
            <small>Plan · Track · Achieve</small>
          </div>
        </div>
        <button type="button" className="side-quick-add" onClick={()=>setQuickTodo(true)}>＋ Tambah To-Do</button>
        <div className="side-nav-list">
          {NAV.map(n=>(
            <button type="button" key={n[0]} className={page===n[0]?'on':''} onClick={()=>go(n[0])}>
              <span className="side-ic">{n[2]}</span> {n[1]}
            </button>
          ))}
        </div>
        <button type="button" className="side-logout" onClick={()=>isDemo?exitDemo():sb.auth.signOut()}>🚪 Keluar</button>
      </aside>

      <main className="main-view">
        {err&&<div className="banner" role="alert">Koneksi bermasalah: {err}</div>}
        {load?<div className="load">Memuat data…</div>:<Page/>}
      </main>

      <nav className="bot" aria-label="Navigasi utama">
        <button type="button" className={page==='beranda'?'on':''} onClick={()=>go('beranda')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={page==='beranda'?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z"/>
          </svg>
          <span>Beranda</span>
        </button>

        <button type="button" className={page==='jadwal'||page==='kalender'?'on':''} onClick={()=>go('jadwal')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Jadwal</span>
        </button>

        <div className="bot-fab-slot">
          <button type="button" className="bot-fab" onClick={()=>setQuickTodo(true)} aria-label="Tambah To-Do">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <button type="button" className={page==='statistik'?'on':''} onClick={()=>go('statistik')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
          <span>Statistik</span>
        </button>

        <button type="button" className={more||!['beranda','jadwal','statistik'].includes(page)?'on':''} onClick={()=>setMore(!more)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <polyline points="12 7 12 12 15 15"/>
          </svg>
          <span>Lainnya</span>
        </button>
      </nav>

      {more&&(
        <div className="more-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setMore(false)}>
          <div className="more-sheet">
            <div className="more-head">
              <b>Menu Lainnya</b>
              <button type="button" className="ic" onClick={()=>setMore(false)}>✕</button>
            </div>
            <div className="more-grid">
              {moreItems.map(n=>(
                <button type="button" key={n[0]} className={'more-item'+(page===n[0]?' on':'')} onClick={()=>go(n[0])}>
                  <span className="more-ic">{n[2]}</span>
                  <span>{n[1]}</span>
                </button>
              ))}
            </div>
            <button type="button" className="more-logout" onClick={()=>isDemo?exitDemo():sb.auth.signOut()}>🚪 Keluar</button>
          </div>
        </div>
      )}

      {quickTodo&&(
        <FormSheet
          title="Tambah To-Do"
          fields={quickTodoFields}
          initial={{judul:'',prioritas:'tinggi',status:'belum',kategori:d.courses[0]?.nama||'Pemrograman Web',deadline:new Date().toISOString()}}
          onClose={()=>setQuickTodo(false)}
          onSave={saveQuickTodo}
        />
      )}

      {tm&&<div className="toast" role="status">{tm}</div>}
    </div>
  </Ctx.Provider>
}

export default function App(){
  const [s,setS]=useState(undefined)
  const [rec,setRec]=useState(false)
  const [demo,setDemo]=useState(()=>localStorage.getItem('studyflow_demo_active')!=='false')

  useEffect(()=>{
    if(!hasSupabase){
      setS(null)
      return
    }
    sb.auth.getSession().then(({data})=>setS(data.session))
    const {data}=sb.auth.onAuthStateChange((e,x)=>{
      setS(x)
      if(e==='PASSWORD_RECOVERY')setRec(true)
    })
    return()=>data.subscription.unsubscribe()
  },[])

  const enterDemo=()=>{
    localStorage.setItem('studyflow_demo_active','true')
    setDemo(true)
  }

  const exitDemo=()=>{
    localStorage.setItem('studyflow_demo_active','false')
    setDemo(false)
  }

  if(s===undefined)return <div className="load">Memuat…</div>
  if(s)return <Shell user={s.user} rec={rec} isDemo={false} exitDemo={exitDemo}/>
  if(demo)return <Shell user={{id:'demo'}} rec={false} isDemo={true} exitDemo={exitDemo}/>
  return <Auth onEnterDemo={enterDemo}/>
}
