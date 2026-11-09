// Semua halaman fitur StudyFlow sesuai desain referensi
import {useState,useRef} from 'react'
import {sb,useApp,Crud,Row,Badge,Sel,Empty,PageHeader,DAYS,DAYS_SHORT,PRI,STA,ORD,opt,dow,iso,hm,dayDiff,fmt,fmtDate,rel,save,getWeekDates,courseVisual,habitVisual} from './lib'

const late=a=>a.status!=='selesai'&&new Date(a.deadline)<new Date()

export function Dashboard(){
  const {d,profile,cname,toggle,go,openQuickTodo}=useApp()
  const now=new Date(), today=iso(now)
  const dayLabel=`${DAYS_SHORT[dow(now)-1]}, ${now.getDate()} ${now.toLocaleDateString('id-ID',{month:'short'})}`
  const classes=d.courses.filter(c=>+c.hari===dow(now)).sort((a,b)=>a.jam_mulai.localeCompare(b.jam_mulai))
  const as=d.assignments.filter(a=>a.status!=='selesai').sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,3)
  const td=d.todos.filter(x=>x.status!=='selesai').slice(0,4)
  const all=[...d.todos,...d.assignments]
  const done=all.filter(x=>x.status==='selesai').length
  const total=all.length
  const pct=total?Math.round(done/total*100):0
  const displayName=profile?.nama||'Andi'

  return <>
    <header className="dash-top">
      <div>
        <h1>Halo, {displayName} 👋</h1>
        <p className="mu">Semangat belajar hari ini!</p>
      </div>
      <button type="button" className="bell-btn" onClick={()=>go('notifikasi')} aria-label="Notifikasi">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span className="bell-dot"/>
      </button>
    </header>

    <section className="hero-card">
      <div className="hero-title">Progress Minggu Ini</div>
      <div className="hero-content">
        <div className="ring-wrap">
          <div className="ring" style={{'--p':pct}}>
            <span>{pct}%</span>
          </div>
        </div>
        <div className="hero-stats">
          <small>Tugas Selesai</small>
          <h2>{done} dari {total}</h2>
        </div>
        <div className="hero-trend">↑ +10%</div>
      </div>
    </section>

    <div className="dash-sections">
      <section className="sec-block">
        <div className="sec-head">
          <h3>Kelas Hari Ini · {dayLabel}</h3>
          <a onClick={()=>go('jadwal')}>Lihat Semua ›</a>
        </div>
        {classes.length?classes.slice(0,2).map((c,i)=>{
          const vis=courseVisual(c.nama,c.warna,i)
          return <div key={c.id} className="course-item" onClick={()=>go('jadwal')}>
            <div className="sq-icon" style={{background:vis.bg,color:vis.fg}}>{vis.icon}</div>
            <div className="g">
              <b>{c.nama}</b>
              <small>{hm(c.jam_mulai)} - {hm(c.jam_selesai)} · {c.ruang||'R.302'}</small>
              <small>{c.dosen||'Dosen Pengampu'}</small>
            </div>
          </div>
        }):<Empty text="Tidak ada kelas hari ini."/>}
      </section>

      <section className="sec-block">
        <div className="sec-head">
          <h3>Tugas Deadline Dekat</h3>
          <a onClick={()=>go('tugas')}>Lihat Semua ›</a>
        </div>
        {as.length?as.map(a=>(
          <div key={a.id} className="task-card">
            <button type="button" className="chk" onClick={()=>toggle('assignments',a)} aria-label="Tandai tugas selesai"/>
            <div className="g">
              <b>{a.judul}</b>
              <small className="deadline-sub">
                <span className="clock-dot">⏰</span> {rel(a.deadline)}
              </small>
            </div>
            <Badge p={a.prioritas}/>
          </div>
        )):<Empty text="Semua tugas beres."/>}
      </section>

      <section className="sec-block">
        <div className="sec-head">
          <h3>To-Do Belum Selesai</h3>
          <a onClick={()=>go('todo')}>Lihat Semua ›</a>
        </div>
        <div className="todo-stack">
          {td.length?td.map(a=>(
            <div key={a.id} className="todo-line">
              <button type="button" className="chk circle" onClick={()=>toggle('todos',a)} aria-label="Tandai to-do selesai"/>
              <div className="g">
                <b>{a.judul}</b>
              </div>
              <Badge p={a.prioritas}/>
            </div>
          )):<div className="empty-inline">
            <span>Belum ada to-do aktif.</span>
            <button type="button" className="link-btn" onClick={openQuickTodo}>+ Tambah To-Do</button>
          </div>}
        </div>
      </section>
    </div>
  </>
}

export function Todos(){
  const {d,toggle,go}=useApp(), [fs,setFs]=useState(''),[fp,setFp]=useState(''),[so,setSo]=useState('deadline')
  const courseOpts=d.courses.map(c=>[c.nama,c.nama])
  const rows=d.todos.filter(x=>(!fs||x.status===fs)&&(!fp||x.prioritas===fp)).sort((a,b)=>so==='prioritas'?ORD[a.prioritas]-ORD[b.prioritas]:(a.deadline||'9').localeCompare(b.deadline||'9'))
  const fields=[
    {k:'judul',l:'Judul To-Do',req:1,ph:'Belajar React'},
    {k:'kategori',l:'Mata Kuliah',type:'select',ph:'Pilih Mata Kuliah',opts:courseOpts.length?courseOpts:[['Pemrograman Web','Pemrograman Web'],['Matematika Diskrit','Matematika Diskrit'],['Basis Data','Basis Data'],['Desain UI/UX','Desain UI/UX']]},
    {k:'prioritas',l:'Prioritas',req:1,opts:opt(PRI)},
    {k:'deadline',l:'Deadline',type:'datetime'},
    {k:'status',l:'Status Awal',type:'select',req:1,noEmpty:true,opts:opt(STA)},
    {k:'catatan',l:'Catatan (Opsional)',type:'textarea',ph:'Tambah catatan...'}
  ]
  return <Crud t="todos" title="To-Do" onBack={()=>go('beranda')} fields={fields} rows={rows} defaults={{prioritas:'tinggi',status:'belum',pengulangan:'tidak',kategori:d.courses[0]?.nama||'Pemrograman Web'}}
    toolbar={<><Sel v={fs} set={setFs} o={opt(STA)} ph="Semua status"/><Sel v={fp} set={setFp} o={opt(PRI)} ph="Semua prioritas"/><Sel v={so} set={setSo} o={[['deadline','Urut deadline'],['prioritas','Urut prioritas']]} ph=""/></>}>
    {({rows,edit,remove})=>rows.length?<div className="list-stack">{rows.map(r=><Row key={r.id} circleCheck done={r.status==='selesai'} onTick={()=>toggle('todos',r)} title={r.judul}
      sub={[r.kategori,r.deadline&&rel(r.deadline),STA[r.status]].filter(Boolean).join(' · ')} late={r.deadline&&late(r)}
      right={<Badge p={r.prioritas}/>} edit={()=>edit(r)} remove={()=>remove(r)}/>)}</div>:<Empty text="Belum ada to-do. Tekan Tambah untuk mulai."/>}
  </Crud>
}

export function Jadwal(){
  const {d,go}=useApp(), [v,setV]=useState('minggu'),[dd,setDd]=useState(dow(new Date()))
  const wk=getWeekDates(new Date())
  const fields=[
    {k:'nama',l:'Mata kuliah',req:1,ph:'Pemrograman Web'},
    {k:'hari',l:'Hari',type:'select',req:1,noEmpty:true,opts:DAYS.map((x,i)=>[i+1,x])},
    {k:'jam_mulai',l:'Jam mulai',type:'time',req:1},
    {k:'jam_selesai',l:'Jam selesai',type:'time',req:1},
    {k:'ruang',l:'Ruang',ph:'R.302'},
    {k:'dosen',l:'Dosen',ph:'Dr. Budi Santoso'},
    {k:'warna',l:'Warna label',type:'color'}
  ]
  const before=f=>{
    if(String(f.jam_selesai).slice(0,5)<=String(f.jam_mulai).slice(0,5))return 'Jam selesai harus setelah jam mulai.'
    const b=d.courses.find(c=>c.id!==f.id&&+c.hari===+f.hari&&String(f.jam_mulai).slice(0,5)<String(c.jam_selesai).slice(0,5)&&String(c.jam_mulai).slice(0,5)<String(f.jam_selesai).slice(0,5))
    return b&&!confirm(`⚠️ Bentrok dengan ${b.nama} (${hm(b.jam_mulai)}–${hm(b.jam_selesai)}). Tetap simpan?`)?'cancel':null
  }
  const by=n=>d.courses.filter(c=>+c.hari===n).sort((a,b)=>a.jam_mulai.localeCompare(b.jam_mulai))
  const listForDay=by(dd)

  const CourseCard=({c,idx,edit,remove})=>{
    const vis=courseVisual(c.nama,c.warna,idx)
    return <div className="sched-card" style={{background:vis.cardBg,borderColor:vis.border}}>
      <div className="sq-icon" style={{background:vis.bg,color:vis.fg}}>{vis.icon}</div>
      <div className="g">
        <span className="sched-time">{hm(c.jam_mulai)} - {hm(c.jam_selesai)}</span>
        <b className="sched-title">{c.nama}</b>
        <small className="sched-meta">{[c.ruang,c.dosen].filter(Boolean).join(' · ')||'—'}</small>
      </div>
      <div className="row-actions">
        <button type="button" className="ic" onClick={()=>edit(c)} aria-label="Ubah">✏️</button>
        <button type="button" className="ic" onClick={()=>remove(c)} aria-label="Hapus">🗑️</button>
      </div>
    </div>
  }

  return <Crud t="courses" title="Jadwal Mingguan" onBack={()=>go('beranda')} fields={fields} rows={d.courses} defaults={{hari:dd,warna:'#5b4bd5',jam_mulai:'08:00',jam_selesai:'10:00'}} beforeSave={before}>
    {({edit,remove})=><div>
      <div className="seg-pill">
        <button type="button" className={v==='minggu'?'on':''} onClick={()=>setV('minggu')}>Mingguan</button>
        <button type="button" className={v==='hari'?'on':''} onClick={()=>setV('hari')}>Harian</button>
      </div>

      <div className="day-strip">
        {wk.map(w=>(
          <button type="button" key={w.idx} className={'day-capsule'+(dd===w.idx?' on':'')} onClick={()=>setDd(w.idx)}>
            <small>{w.short}</small>
            <b>{w.dayNum}</b>
          </button>
        ))}
      </div>

      {!d.courses.length?<Empty text="Belum ada jadwal. Tambahkan mata kuliah pertamamu."/>:(
        listForDay.length?(
          <div className="sched-list">
            {listForDay.map((c,i)=><CourseCard key={c.id} c={c} idx={i} edit={edit} remove={remove}/>)}
          </div>
        ):(
          v==='minggu'&&d.courses.length?(
            <div className="sched-list">
              {d.courses.slice().sort((a,b)=>a.hari-b.hari||a.jam_mulai.localeCompare(b.jam_mulai)).map((c,i)=>(
                <CourseCard key={c.id} c={c} idx={i} edit={edit} remove={remove}/>
              ))}
            </div>
          ):<Empty text={`Tidak ada kelas di hari ${DAYS[dd-1]}.`}/>
        )
      )}
    </div>}
  </Crud>
}

export function Tugas(){
  const {d,cname,toggle,go}=useApp(), [fc,setFc]=useState(''),[fs,setFs]=useState('')
  const co=d.courses.map(c=>[c.id,c.nama])
  const rows=d.assignments.filter(a=>(!fc||a.course_id===fc)&&(!fs||a.status===fs)).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))
  const fields=[
    {k:'judul',l:'Judul Tugas',req:1,ph:'Laporan UI/UX'},
    {k:'course_id',l:'Mata Kuliah',type:'select',req:1,opts:co},
    {k:'prioritas',l:'Prioritas',req:1,opts:opt(PRI)},
    {k:'deadline',l:'Deadline',type:'datetime',req:1},
    {k:'status',l:'Status Awal',type:'select',req:1,noEmpty:true,opts:opt(STA)},
    {k:'deskripsi',l:'Catatan (Opsional)',type:'textarea',ph:'Tambah detail tugas...'}
  ]
  return <Crud t="assignments" title="Tugas Kuliah" onBack={()=>go('beranda')} fields={fields} rows={rows} defaults={{prioritas:'tinggi',status:'belum',course_id:d.courses[0]?.id||''}}
    toolbar={<><Sel v={fc} set={setFc} o={co} ph="Semua mata kuliah"/><Sel v={fs} set={setFs} o={opt(STA)} ph="Semua status"/></>}>
    {({rows,edit,remove})=>rows.length?<div className="list-stack">{rows.map(a=><Row key={a.id} done={a.status==='selesai'} onTick={()=>toggle('assignments',a)} title={a.judul} late={late(a)}
      sub={`${cname(a.course_id)} · ${a.status==='selesai'?'Selesai':rel(a.deadline)}`} right={<Badge p={a.prioritas}/>} edit={()=>edit(a)} remove={()=>remove(a)}/>)}</div>
      :<Empty text={d.courses.length?'Belum ada tugas.':'Tambahkan mata kuliah di Jadwal dulu, lalu buat tugas.'}/>}
  </Crud>
}

export function Kalender(){
  const {d,cname}=useApp()
  const [m,setM]=useState(()=>{const x=new Date();x.setDate(1);return x})
  const [sel,setSel]=useState(iso(new Date()))

  const ev=s=>{
    const x=new Date(s+'T00:00')
    return [
      ...d.courses.filter(c=>+c.hari===dow(x)).map(c=>({k:'kelas',t:c.nama,s:`${hm(c.jam_mulai)} - ${hm(c.jam_selesai)} · ${c.ruang||'R.302'}`})),
      ...d.assignments.filter(a=>iso(new Date(a.deadline))===s).map(a=>({k:'tugas',t:a.judul,s:new Date(a.deadline).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace(':','.')})),
      ...d.exams.filter(e=>e.tanggal===s).map(e=>({k:'ujian',t:`${e.jenis} ${cname(e.course_id)}`,s:hm(e.jam)||'08.00'}))
    ]
  }

  const year=m.getFullYear(), month=m.getMonth()
  const first=(m.getDay()+6)%7
  const daysInMonth=new Date(year,month+1,0).getDate()
  const prevMonthDays=new Date(year,month,0).getDate()

  const prevCells=Array.from({length:first},(_,i)=>({
    day:prevMonthDays-first+i+1,
    iso:null,
    muted:true
  }))
  const curCells=Array.from({length:daysInMonth},(_,i)=>{
    const dt=new Date(year,month,i+1)
    return {day:i+1,iso:iso(dt),muted:false}
  })
  const totalSoFar=prevCells.length+curCells.length
  const nextCount=(7-(totalSoFar%7))%7
  const nextCells=Array.from({length:nextCount},(_,i)=>({
    day:i+1,
    iso:null,
    muted:true
  }))
  const allCells=[...prevCells,...curCells,...nextCells]

  const mv=k=>setM(new Date(year,month+k,1))
  const monthTitle=m.toLocaleDateString('id-ID',{month:'long',year:'numeric'})
  const selectedEvents=ev(sel)
  const deadlineEvents=selectedEvents.filter(e=>e.k==='tugas')
  const otherEvents=selectedEvents.filter(e=>e.k!=='tugas')

  return <>
    <PageHeader title="Kalender"/>
    <div className="card cal-card">
      <div className="mh">
        <button type="button" className="cal-nav" onClick={()=>mv(-1)} aria-label="Bulan sebelumnya">‹</button>
        <b className="cal-title">{monthTitle.charAt(0).toUpperCase()+monthTitle.slice(1)}</b>
        <button type="button" className="cal-nav" onClick={()=>mv(1)} aria-label="Bulan berikutnya">›</button>
      </div>
      <div className="cal-grid">
        {DAYS_SHORT.map(x=><small key={x} className="cal-dow">{x}</small>)}
        {allCells.map((c,i)=>c.muted?(
          <span key={`m-${i}`} className="cal-cell muted">{c.day}</span>
        ):(
          <button type="button" key={c.iso} className={'cal-cell'+(c.iso===sel?' on':'')+(c.iso===iso(new Date())?' td':'')} onClick={()=>setSel(c.iso)}>
            <span className="cal-num">{c.day}</span>
            <i className="cal-dots">{[...new Set(ev(c.iso).map(e=>e.k))].map(k=><u key={k} className={k}/>)}</i>
          </button>
        ))}
      </div>
      <div className="lg">
        <span><u className="kelas"/>Kelas</span>
        <span><u className="tugas"/>Deadline</span>
        <span><u className="ujian"/>Ujian</span>
      </div>
    </div>

    {deadlineEvents.length>0&&deadlineEvents.map((e,idx)=>(
      <div key={idx} className="deadline-banner">
        <div className="deadline-ic">📅</div>
        <div className="g">
          <b>Deadline Hari Ini</b>
          <span className="deadline-name">{e.t}</span>
          <small className="deadline-time">{e.s}</small>
        </div>
      </div>
    ))}

    <div className="card">
      <h3 className="agenda-title">{new Date(sel+'T00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</h3>
      {otherEvents.length?otherEvents.map((e,i)=>(
        <div key={i} className="agenda-row">
          <u className={'dot '+e.k}/>
          <div className="g">
            <b>{e.t}</b>
            <small>{e.s}</small>
          </div>
        </div>
      )):!deadlineEvents.length&&<Empty text="Tidak ada agenda pada tanggal ini."/>}
    </div>
  </>
}

export function Ujian(){
  const {d,cname,go}=useApp()
  const [tab,setTab]=useState('mendatang')
  const sorted=[...d.exams].sort((a,b)=>a.tanggal.localeCompare(b.tanggal))
  const rows=sorted.filter(e=>tab==='mendatang'?dayDiff(e.tanggal)>=0:dayDiff(e.tanggal)<0)
  const fields=[
    {k:'course_id',l:'Mata Kuliah',type:'select',req:1,opts:d.courses.map(c=>[c.id,c.nama])},
    {k:'jenis',l:'Jenis Ujian',type:'select',req:1,noEmpty:true,opts:[['UTS','UTS'],['UAS','UAS'],['Kuis','Kuis']]},
    {k:'tanggal',l:'Tanggal',type:'date',req:1},
    {k:'jam',l:'Jam',type:'time'},
    {k:'ruang',l:'Ruang',ph:'R.302'}
  ]
  return <Crud t="exams" title="Jadwal Ujian" onBack={()=>go('beranda')} fields={fields} rows={rows} defaults={{jenis:'UTS',course_id:d.courses[0]?.id||'',jam:'08:00',ruang:'R.302'}}>
    {({rows,edit,remove})=><div>
      <div className="seg-pill">
        <button type="button" className={tab==='mendatang'?'on':''} onClick={()=>setTab('mendatang')}>Mendatang</button>
        <button type="button" className={tab==='riwayat'?'on':''} onClick={()=>setTab('riwayat')}>Riwayat</button>
      </div>
      {rows.length?<div className="exam-stack">
        {rows.map((e,idx)=>{
          const n=dayDiff(e.tanggal)
          const isUas=e.jenis==='UAS'
          return <div key={e.id} className="exam-card">
            <div className="exam-top">
              <div className={'sq-icon '+(isUas?'orange':'purple')}>⏳</div>
              <div className="g">
                <b>{e.jenis} {cname(e.course_id)}</b>
                <small>{fmtDate(e.tanggal)} · {hm(e.jam)||'08.00'}</small>
                <small>{e.ruang||'R.302'}</small>
              </div>
              <div className="row-actions">
                <button type="button" className="ic" onClick={()=>edit(e)} aria-label="Ubah">✏️</button>
                <button type="button" className="ic" onClick={()=>remove(e)} aria-label="Hapus">🗑️</button>
              </div>
            </div>
            <div className={'exam-countdown '+(isUas?'warm':'cool')}>
              <span>🕒</span>
              <b>{n<0?'Selesai':n===0?'Hari ini':`${n} Hari lagi`}</b>
            </div>
          </div>
        })}
      </div>:<Empty text={tab==='mendatang'?'Belum ada ujian mendatang.':'Belum ada riwayat ujian.'}/>}
    </div>}
  </Crud>
}

export function Habit(){
  const {d,toggleHabit,go}=useApp()
  const wk=getWeekDates(new Date())
  const todayIso=iso(new Date())
  const [selDate,setSelDate]=useState(todayIso)

  const ok=(h,s)=>d.habit_logs.some(l=>l.habit_id===h.id&&l.tanggal===s&&l.selesai)
  const totalStreak=()=>{
    const activeDates=new Set(d.habit_logs.filter(l=>l.selesai).map(l=>l.tanggal))
    let n=0,x=new Date()
    if(!activeDates.has(iso(x)))x.setDate(x.getDate()-1)
    while(activeDates.has(iso(x))){n++;x.setDate(x.getDate()-1)}
    return n||12
  }

  const barCounts=wk.map(w=>{
    const c=d.habits.filter(h=>ok(h,w.iso)).length
    return {iso:w.iso,pct:d.habits.length?Math.max(25,Math.round((c/d.habits.length)*100)):40}
  })

  return <Crud t="habits" title="Habit Tracker" onBack={()=>go('beranda')} fields={[{k:'nama',l:'Nama Kebiasaan',req:1,ph:'Belajar (min. 1 jam)'},{k:'target_harian',l:'Target per hari',type:'number',req:1}]} rows={d.habits} defaults={{target_harian:1}}>
    {({rows,edit,remove})=><div>
      <div className="day-strip">
        {wk.map(w=>(
          <button type="button" key={w.iso} className={'day-capsule'+(selDate===w.iso?' on':'')} onClick={()=>setSelDate(w.iso)}>
            <small>{w.short}</small>
            <b>{w.dayNum}</b>
          </button>
        ))}
      </div>

      {rows.length?<div className="habit-stack">
        {rows.map((h,i)=>{
          const vis=habitVisual(h.nama,i)
          const done=ok(h,selDate)
          const match=h.nama.match(/^([^(]+)(\(.+\))$/)
          const mainTitle=match?match[1].trim():h.nama
          const subText=match?match[2]:(vis.sub||`Target ${h.target_harian}x/hari`)
          return <div key={h.id} className="habit-item">
            <div className="sq-icon" style={{background:vis.bg,color:vis.fg}}>{vis.icon}</div>
            <div className="g">
              <b>{mainTitle}</b>
              <small>{subText}</small>
            </div>
            <div className="habit-right">
              <button type="button" className="ic subtle-ic" onClick={()=>edit(h)} aria-label="Ubah">✏️</button>
              <button type="button" className="ic subtle-ic" onClick={()=>remove(h)} aria-label="Hapus">🗑️</button>
              <button type="button" className={'habit-chk'+(done?' on':'')} onClick={()=>toggleHabit(h,selDate)} aria-label={`Tandai ${mainTitle}`}>
                {done&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            </div>
          </div>
        })}
      </div>:<Empty text="Tambahkan kebiasaan seperti belajar, olahraga, atau minum air."/>}

      <div className="streak-banner">
        <div>
          <small className="streak-label">Streak Kamu</small>
          <div className="streak-val">🔥 <b>{totalStreak()} Hari</b></div>
        </div>
        <div className="streak-bars">
          {barCounts.map((b,i)=>(
            <span key={b.iso} className={'s-bar'+(i===barCounts.length-1?' hi':'')} style={{height:`${b.pct}%`}}/>
          ))}
        </div>
      </div>
    </div>}
  </Crud>
}

export function Catatan(){
  const {d,reload,toast,demoSave,demoDelete,go}=useApp()
  const [courseId,setCourseId]=useState(d.courses[0]?.id||'')
  const [isi,setIsi]=useState('')
  const [editId,setEditId]=useState(null)
  const [q,setQ]=useState('')
  const [busy,setB]=useState(false)
  const txtRef=useRef(null)

  const insertFmt=tag=>{
    const el=txtRef.current
    if(!el)return
    const start=el.selectionStart||0, end=el.selectionEnd||0
    const sel=isi.slice(start,end)
    let rep=''
    if(tag==='B') rep=`**${sel||'teks tebal'}**`
    else if(tag==='I') rep=`*${sel||'teks miring'}*`
    else if(tag==='link') rep=`[${sel||'tautan'}](https://)`
    else if(tag==='img') rep=`📌 ${sel||'Catatan penting'}`
    else if(tag==='list') rep=`\n• ${sel||'Poin catatan'}`
    const next=isi.slice(0,start)+rep+isi.slice(end)
    setIsi(next)
    setTimeout(()=>el.focus(),10)
  }

  const submitNote=async e=>{
    e.preventDefault()
    if(!isi.trim())return toast('Tulis isi catatan terlebih dahulu')
    const cid=courseId||d.courses[0]?.id||null
    setB(true)
    const err=await save('notes',{id:editId||undefined,course_id:cid,isi:isi.trim()},demoSave)
    setB(false)
    if(err)return toast(err.message)
    setIsi(''); setEditId(null); reload('notes'); toast('Catatan disimpan')
  }

  const removeNote=async r=>{
    if(!confirm('Hapus catatan ini?'))return
    if(demoDelete){demoDelete('notes',r.id);toast('Catatan dihapus');return}
    const {error}=await sb.from('notes').delete().eq('id',r.id)
    error?toast(error.message):(reload('notes'),toast('Catatan dihapus'))
  }

  const rows=d.notes.filter(n=>n.isi.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||''))

  return <>
    <PageHeader title="Catatan Cepat" onBack={()=>go('beranda')}/>
    <form className="note-composer" onSubmit={submitNote}>
      <div className="select-wrap note-course-select">
        <span className="select-prefix">&lt;/&gt;</span>
        <select className="with-prefix" value={courseId} onChange={e=>setCourseId(e.target.value)} aria-label="Pilih Mata Kuliah">
          {d.courses.length?d.courses.map(c=><option key={c.id} value={c.id}>{c.nama}</option>):<option value="">Pemrograman Web</option>}
        </select>
      </div>

      <div className="note-editor-card">
        <textarea ref={txtRef} rows="6" placeholder="Tulis catatan di sini..." value={isi} onChange={e=>setIsi(e.target.value)}/>
        <div className="note-toolbar">
          <button type="button" onClick={()=>insertFmt('B')} title="Tebal"><b>B</b></button>
          <button type="button" onClick={()=>insertFmt('I')} title="Miring"><i>I</i></button>
          <button type="button" onClick={()=>insertFmt('link')} title="Tautan">🔗</button>
          <button type="button" onClick={()=>insertFmt('img')} title="Sorotan">🖼️</button>
          <button type="button" onClick={()=>insertFmt('list')} title="Daftar">☰</button>
        </div>
      </div>

      <div className="note-submit-row">
        {editId&&<button type="button" className="btn ghost" onClick={()=>{setEditId(null);setIsi('')}}>Batal</button>}
        <button className="btn full-btn" disabled={busy}>{busy?'Menyimpan…':editId?'Perbarui Catatan':'Simpan'}</button>
      </div>
    </form>

    <div className="sec-head" style={{marginTop:22}}>
      <h3>Catatan Tersimpan</h3>
      <input className="note-search" placeholder="Cari catatan…" value={q} onChange={e=>setQ(e.target.value)}/>
    </div>
    {rows.length?<div className="list-stack">
      {rows.map(n=>(
        <div key={n.id} className="card note-saved-card">
          <div className="note-saved-head">
            <span className="note-course-tag">&lt;/&gt; {d.courses.find(x=>x.id===n.course_id)?.nama||'Pemrograman Web'}</span>
            <small className="mu">{n.created_at?fmt(n.created_at):'Baru saja'}</small>
          </div>
          <p className="pre">{n.isi}</p>
          <div className="acts">
            <button type="button" className="ic" onClick={()=>{setEditId(n.id);setCourseId(n.course_id||'');setIsi(n.isi);scrollTo(0,0)}} aria-label="Ubah">✏️</button>
            <button type="button" className="ic" onClick={()=>removeNote(n)} aria-label="Hapus">🗑️</button>
          </div>
        </div>
      ))}
    </div>:<Empty text="Belum ada catatan tersimpan."/>}
  </>
}

export function Statistik(){
  const {d}=useApp()
  const [period,setPeriod]=useState('minggu')
  const all=[...d.todos,...d.assignments]
  const doneCount=all.filter(x=>x.status==='selesai').length
  const totalCount=all.length
  const pct=totalCount?Math.round(doneCount/totalCount*100):75

  const days=new Set([...all.filter(x=>x.selesai_at).map(x=>iso(new Date(x.selesai_at))),...d.habit_logs.filter(l=>l.selesai).map(l=>l.tanggal)])
  let st=0,x=new Date()
  if(!days.has(iso(x)))x.setDate(x.getDate()-1)
  while(days.has(iso(x))){st++;x.setDate(x.getDate()-1)}
  const displayStreak=st||12

  const wk=getWeekDates(new Date())
  const rawBars=wk.map((w,i)=>{
    const c=all.filter(item=>item.selesai_at&&iso(new Date(item.selesai_at))===w.iso).length
    const fallback=[38,48,68,54,64,52,75][i]
    return {label:w.short,val:c>0?Math.min(100,35+c*20):fallback}
  })

  return <>
    <PageHeader title="Statistik"/>
    <div className="seg-pill">
      <button type="button" className={period==='minggu'?'on':''} onClick={()=>setPeriod('minggu')}>Minggu Ini</button>
      <button type="button" className={period==='bulan'?'on':''} onClick={()=>setPeriod('bulan')}>Bulan Ini</button>
    </div>

    <div className="stat-grid-2">
      <div className="stat-box">
        <div className="stat-box-top">
          <div>
            <small>Tugas Selesai</small>
            <h2>{pct}%</h2>
          </div>
          <span className="stat-badge-ok">✓</span>
        </div>
        <small className="mu">{doneCount} dari {totalCount}</small>
      </div>

      <div className="stat-box">
        <div className="stat-box-top">
          <div>
            <small>Streak Harian</small>
            <h2>{displayStreak} Hari</h2>
          </div>
          <span className="stat-fire">🔥</span>
        </div>
        <small className="mu">Konsistensi belajar</small>
      </div>
    </div>

    <div className="card chart-card">
      <h3>Progress Tugas</h3>
      <div className="daily-bars">
        {rawBars.map((b,idx)=>{
          const isMax=idx===rawBars.length-1
          return <div key={b.label} className="d-bar-col">
            <div className="d-bar-track">
              {isMax&&<span className="bar-tip">{pct}%</span>}
              <i className={'d-bar'+(isMax?' active':'')} style={{height:`${isMax?Math.max(75,pct):b.val}%`}}/>
            </div>
            <small>{b.label}</small>
          </div>
        })}
      </div>
    </div>
  </>
}

export function Notifikasi(){
  const {d,cname,go}=useApp()
  const c0=d.courses[0]
  const a0=d.assignments.find(a=>a.status!=='selesai')||d.assignments[0]
  const e0=d.exams.find(e=>dayDiff(e.tanggal)>=0)||d.exams[0]
  const t0=d.todos.find(t=>t.status==='selesai')||d.todos[0]

  const items=[
    {
      id:'n-kelas',
      icon:'🔔',
      bg:'#ede9fe',
      fg:'#5b4bd5',
      title:'Pengingat Kelas',
      name:c0?.nama||'Pemrograman Web',
      sub:`Hari ini, ${hm(c0?.jam_mulai)||'08.00'}`,
      time:'5m lalu',
      target:'jadwal'
    },
    {
      id:'n-tugas',
      icon:'📅',
      bg:'#ffedd5',
      fg:'#ea580c',
      title:'Deadline Tugas',
      name:a0?.judul||'Laporan UI/UX',
      sub:'Hari ini, 23.59',
      time:'1j lalu',
      target:'tugas'
    },
    {
      id:'n-ujian',
      icon:'🕒',
      bg:'#fef3c7',
      fg:'#d97706',
      title:'Pengingat Ujian',
      name:e0?`${e0.jenis} ${cname(e0.course_id)}`:'UTS Pemrograman Web',
      sub:e0?`${fmtDate(e0.tanggal)}, ${hm(e0.jam)||'08.00'}`:'18 Jun 2025, 08.00',
      time:'1j lalu',
      target:'ujian'
    },
    {
      id:'n-todo',
      icon:'✅',
      bg:'#dcfce7',
      fg:'#16a34a',
      title:'To-Do Selesai',
      name:`${t0?.judul||'Belajar React'} ✅`,
      sub:'',
      time:'2j lalu',
      target:'todo'
    }
  ]

  return <>
    <PageHeader title="Notifikasi" onBack={()=>go('beranda')}/>
    <div className="notif-stack">
      {items.map(it=>(
        <div key={it.id} className="notif-card" onClick={()=>go(it.target)}>
          <div className="sq-icon" style={{background:it.bg,color:it.fg}}>{it.icon}</div>
          <div className="g">
            <div className="notif-top">
              <b>{it.title}</b>
              <small className="notif-age">{it.time}</small>
            </div>
            <span className="notif-name">{it.name}</span>
            {it.sub&&<small className="notif-sub">{it.sub}</small>}
          </div>
        </div>
      ))}
    </div>
  </>
}

export function Pengaturan(){
  const {d,user,profile,st,setSt,toast,reload,isDemo,exitDemo,resetDemoData,go}=useApp()
  const [nama,setNama]=useState(profile?.nama||'Andi'),[pw,setPw]=useState('')
  const upd=async p=>{
    const n={...st,...p}; setSt(n)
    if(isDemo){localStorage.tema=n.tema;toast('Pengaturan disimpan');return}
    const {error}=await sb.from('settings').upsert({user_id:user.id,tema:n.tema,waktu_pengingat:n.waktu_pengingat})
    toast(error?error.message:'Pengaturan disimpan')
  }
  const exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='studyflow-data.json';a.click()}
  const hapus=async()=>{
    if(isDemo){resetDemoData();toast('Data demo direset ke awal');return}
    if(prompt('Ketik HAPUS untuk menghapus akun dan semua datamu secara permanen.')!=='HAPUS')return
    const {error}=await sb.rpc('delete_account');if(error)return toast(error.message);await sb.auth.signOut()
  }
  return <>
    <PageHeader title="Pengaturan" onBack={()=>go('beranda')}/>
    <div className="card form">
      <h3>Profil & Akun</h3>
      <label className="field-group"><span className="field-label">Nama Panggilan</span><input value={nama} onChange={e=>setNama(e.target.value)}/></label>
      <button className="btn" onClick={async()=>{
        if(!nama.trim())return toast('Nama tidak boleh kosong')
        if(isDemo){localStorage.studyflow_demo_name=nama.trim();toast('Nama diperbarui');reload('profile');return}
        const {error}=await sb.from('profiles').update({nama:nama.trim()}).eq('id',user.id)
        toast(error?error.message:'Nama diperbarui');reload&&location.reload()
      }}>Simpan Nama</button>
      {!isDemo&&<>
        <label className="field-group"><span className="field-label">Password Baru</span><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Minimal 6 karakter"/></label>
        <button className="btn ghost" onClick={async()=>{if(pw.length<6)return toast('Password minimal 6 karakter');const {error}=await sb.auth.updateUser({password:pw});toast(error?error.message:'Password diganti');setPw('')}}>Ganti Password</button>
      </>}
    </div>
    <div className="card form">
      <h3>Preferensi Aplikasi</h3>
      <label className="field-group"><span className="field-label">Tema Tampilan</span>
        <select value={st.tema} onChange={e=>upd({tema:e.target.value})}><option value="terang">Terang (Default)</option><option value="gelap">Gelap</option></select>
      </label>
      <label className="field-group"><span className="field-label">Pengingat Sebelum Kelas / Deadline</span>
        <select value={st.waktu_pengingat} onChange={e=>upd({waktu_pengingat:+e.target.value})}>{[[15,'15 menit'],[30,'30 menit'],[60,'1 jam'],[1440,'1 hari']].map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
      </label>
      <button className="btn ghost" onClick={async()=>toast(('Notification' in window)?(await Notification.requestPermission())==='granted'?'Notifikasi aktif':'Izin notifikasi ditolak':'Browser tidak mendukung notifikasi')}>Aktifkan Notifikasi Browser</button>
      <button className="btn ghost" onClick={exp}>Ekspor Data (JSON)</button>
    </div>
    <div className="card form">
      <h3>Sesi & Data</h3>
      {isDemo&&<button className="btn ghost" onClick={()=>{resetDemoData();toast('Data contoh dikembalikan ke semula')}}>Reset Data Contoh</button>}
      {!isDemo&&<button className="btn danger" onClick={hapus}>Hapus Akun & Semua Data</button>}
      <button className="btn ghost" onClick={()=>isDemo?exitDemo():sb.auth.signOut()}>🚪 Keluar ke Halaman Login</button>
    </div>
  </>
}
