// Semua halaman fitur
import {useState} from 'react'
import {sb,useApp,Crud,Row,Badge,Sel,Empty,DAYS,PRI,STA,ORD,opt,dow,iso,hm,dayDiff,fmt,rel,save} from './lib'

const late=a=>a.status!=='selesai'&&new Date(a.deadline)<new Date()

export function Dashboard(){
  const {d,profile,cname,toggle,toggleHabit,go}=useApp(), now=new Date(), h=now.getHours(), today=iso(now)
  const g=h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam'
  const classes=d.courses.filter(c=>+c.hari===dow(now)).sort((a,b)=>a.jam_mulai.localeCompare(b.jam_mulai))
  const as=d.assignments.filter(a=>a.status!=='selesai').sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,3)
  const td=d.todos.filter(x=>x.status!=='selesai').slice(0,5)
  const ex=d.exams.filter(e=>dayDiff(e.tanggal)>=0).sort((a,b)=>a.tanggal.localeCompare(b.tanggal))[0]
  const all=[...d.todos,...d.assignments], done=all.filter(x=>x.status==='selesai').length, pct=all.length?Math.round(done/all.length*100):0
  const hb=d.habits.map(x=>({x,ok:d.habit_logs.some(l=>l.habit_id===x.id&&l.tanggal===today&&l.selesai)}))
  return <>
    <div className="head"><div><h1>{g}, {profile?.nama||'kamu'} 👋</h1><p className="mu">{now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div></div>
    <div className="hero">
      <div className="ring" style={{'--p':pct}}><span>{pct}%</span></div>
      <div><small>Progres tugas & to-do</small><h2>{done} dari {all.length} selesai</h2>
        <small>{ex?`${ex.jenis} ${cname(ex.course_id)} ${dayDiff(ex.tanggal)===0?'hari ini':dayDiff(ex.tanggal)+' hari lagi'}`:'Belum ada ujian mendatang'}</small></div>
    </div>
    <div className="grid">
      <section className="card"><h3>Kelas hari ini <a onClick={()=>go('jadwal')}>Lihat semua</a></h3>
        {classes.length?classes.map(c=><div key={c.id} className="cls" style={{borderColor:c.warna}}><b>{c.nama}</b><small>{hm(c.jam_mulai)}–{hm(c.jam_selesai)} • {c.ruang||'-'} • {c.dosen||'-'}</small></div>):<Empty text="Tidak ada kelas hari ini."/>}</section>
      <section className="card"><h3>Tugas deadline dekat <a onClick={()=>go('tugas')}>Lihat semua</a></h3>
        {as.length?as.map(a=><Row key={a.id} done={false} onTick={()=>toggle('assignments',a)} title={a.judul} sub={`${cname(a.course_id)} • ${rel(a.deadline)}`} late={late(a)} right={<Badge p={a.prioritas}/>}/>):<Empty text="Semua tugas beres."/>}</section>
      <section className="card"><h3>To-do belum selesai <a onClick={()=>go('todo')}>Lihat semua</a></h3>
        {td.length?td.map(a=><Row key={a.id} done={false} onTick={()=>toggle('todos',a)} title={a.judul} sub={a.deadline?fmt(a.deadline):'Tanpa deadline'} right={<Badge p={a.prioritas}/>}/>):<Empty text="Belum ada to-do."/>}</section>
      <section className="card"><h3>Habit hari ini <a onClick={()=>go('habit')}>Kelola</a></h3>
        {hb.length?hb.map(({x,ok})=><Row key={x.id} done={ok} onTick={()=>toggleHabit(x,today)} title={x.nama} sub={`Target ${x.target_harian}x/hari`}/>):<Empty text="Tambah kebiasaan pertamamu."/>}</section>
    </div></>
}

export function Todos(){
  const {d,toggle}=useApp(), [fs,setFs]=useState(''),[fp,setFp]=useState(''),[so,setSo]=useState('deadline')
  const rows=d.todos.filter(x=>(!fs||x.status===fs)&&(!fp||x.prioritas===fp)).sort((a,b)=>so==='prioritas'?ORD[a.prioritas]-ORD[b.prioritas]:(a.deadline||'9').localeCompare(b.deadline||'9'))
  const fields=[{k:'judul',l:'Judul',req:1},{k:'catatan',l:'Catatan',type:'textarea'},{k:'prioritas',l:'Prioritas',type:'select',req:1,opts:opt(PRI)},
    {k:'deadline',l:'Deadline / target',type:'datetime'},{k:'status',l:'Status',type:'select',req:1,opts:opt(STA)},{k:'kategori',l:'Kategori'},
    {k:'pengulangan',l:'Pengulangan',type:'select',req:1,opts:[['tidak','Tidak'],['harian','Harian'],['mingguan','Mingguan']]}]
  return <Crud t="todos" title="To-Do" fields={fields} rows={rows} defaults={{prioritas:'sedang',status:'belum',pengulangan:'tidak'}}
    toolbar={<><Sel v={fs} set={setFs} o={opt(STA)} ph="Semua status"/><Sel v={fp} set={setFp} o={opt(PRI)} ph="Semua prioritas"/><Sel v={so} set={setSo} o={[['deadline','Urut deadline'],['prioritas','Urut prioritas']]} ph=""/></>}>
    {({rows,edit,remove})=>rows.length?rows.map(r=><Row key={r.id} done={r.status==='selesai'} onTick={()=>toggle('todos',r)} title={r.judul}
      sub={[STA[r.status],r.deadline&&fmt(r.deadline),r.kategori,r.pengulangan!=='tidak'&&'🔁 '+r.pengulangan].filter(Boolean).join(' • ')} late={r.deadline&&late(r)}
      right={<Badge p={r.prioritas}/>} edit={()=>edit(r)} remove={()=>remove(r)}/>):<Empty text="Belum ada to-do. Tekan Tambah untuk mulai."/>}
  </Crud>
}

export function Jadwal(){
  const {d}=useApp(), [v,setV]=useState('minggu'),[dd,setDd]=useState(dow(new Date()))
  const fields=[{k:'nama',l:'Mata kuliah',req:1},{k:'hari',l:'Hari',type:'select',req:1,opts:DAYS.map((x,i)=>[i+1,x])},
    {k:'jam_mulai',l:'Jam mulai',type:'time',req:1},{k:'jam_selesai',l:'Jam selesai',type:'time',req:1},{k:'ruang',l:'Ruang'},{k:'dosen',l:'Dosen'},{k:'warna',l:'Warna label',type:'color'}]
  const before=f=>{ // validasi jam + deteksi bentrok
    if(hm(f.jam_selesai)<=hm(f.jam_mulai))return 'Jam selesai harus setelah jam mulai.'
    const b=d.courses.find(c=>c.id!==f.id&&+c.hari===+f.hari&&hm(c.jam_mulai)<hm(f.jam_selesai)&&hm(f.jam_mulai)<hm(c.jam_selesai))
    return b&&!confirm(`⚠️ Bentrok dengan ${b.nama} (${hm(b.jam_mulai)}–${hm(b.jam_selesai)}). Tetap simpan?`)?'cancel':null}
  const Card=({c,edit,remove})=><div className="cls" style={{borderColor:c.warna}}><b>{c.nama}</b><small>{hm(c.jam_mulai)}–{hm(c.jam_selesai)} • {c.ruang||'-'}</small><small>{c.dosen}</small>
    <span><button className="ic" onClick={()=>edit(c)} aria-label="Ubah">✏️</button><button className="ic" onClick={()=>remove(c)} aria-label="Hapus">🗑️</button></span></div>
  const by=n=>d.courses.filter(c=>+c.hari===n).sort((a,b)=>a.jam_mulai.localeCompare(b.jam_mulai))
  return <Crud t="courses" title="Jadwal Kuliah" fields={fields} rows={d.courses} defaults={{hari:dd,warna:'#5b4bd5'}} beforeSave={before}
    toolbar={<div className="seg"><button className={v==='minggu'?'on':''} onClick={()=>setV('minggu')}>Mingguan</button><button className={v==='hari'?'on':''} onClick={()=>setV('hari')}>Harian</button></div>}>
    {({edit,remove})=>!d.courses.length?<Empty text="Belum ada jadwal. Tambahkan mata kuliah pertamamu."/>:v==='minggu'
      ?<div className="week">{DAYS.map((n,i)=><div key={n} className="col"><h4>{n}</h4>{by(i+1).map(c=><Card key={c.id} c={c} edit={edit} remove={remove}/>)}</div>)}</div>
      :<><div className="pills">{DAYS.map((n,i)=><button key={n} className={dd===i+1?'on':''} onClick={()=>setDd(i+1)}>{n.slice(0,3)}</button>)}</div>
        {by(dd).length?by(dd).map(c=><Card key={c.id} c={c} edit={edit} remove={remove}/>):<Empty text="Tidak ada kelas di hari ini."/>}</>}
  </Crud>
}

export function Tugas(){
  const {d,cname,toggle}=useApp(), [fc,setFc]=useState(''),[fs,setFs]=useState('')
  const co=d.courses.map(c=>[c.id,c.nama])
  const rows=d.assignments.filter(a=>(!fc||a.course_id===fc)&&(!fs||a.status===fs)).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))
  const fields=[{k:'judul',l:'Judul tugas',req:1},{k:'course_id',l:'Mata kuliah',type:'select',req:1,opts:co},{k:'deadline',l:'Deadline',type:'datetime',req:1},
    {k:'deskripsi',l:'Deskripsi',type:'textarea'},{k:'prioritas',l:'Prioritas',type:'select',req:1,opts:opt(PRI)},{k:'status',l:'Status',type:'select',req:1,opts:opt(STA)}]
  return <Crud t="assignments" title="Tugas Kuliah" fields={fields} rows={rows} defaults={{prioritas:'sedang',status:'belum'}}
    toolbar={<><Sel v={fc} set={setFc} o={co} ph="Semua mata kuliah"/><Sel v={fs} set={setFs} o={opt(STA)} ph="Semua status"/></>}>
    {({rows,edit,remove})=>rows.length?rows.map(a=><Row key={a.id} done={a.status==='selesai'} onTick={()=>toggle('assignments',a)} title={a.judul} late={late(a)}
      sub={`${cname(a.course_id)} • ${fmt(a.deadline)} • ${a.status==='selesai'?'Selesai':rel(a.deadline)}`} right={<Badge p={a.prioritas}/>} edit={()=>edit(a)} remove={()=>remove(a)}/>)
      :<Empty text={d.courses.length?'Belum ada tugas.':'Tambahkan mata kuliah di Jadwal dulu, lalu buat tugas.'}/>}
  </Crud>
}

export function Kalender(){
  const {d,cname}=useApp(), [m,setM]=useState(()=>{const x=new Date();x.setDate(1);return x}), [sel,setSel]=useState(iso(new Date()))
  const ev=s=>{const x=new Date(s+'T00:00');return [
    ...d.courses.filter(c=>+c.hari===dow(x)).map(c=>({k:'kelas',t:c.nama,s:hm(c.jam_mulai)+'–'+hm(c.jam_selesai)})),
    ...d.assignments.filter(a=>iso(new Date(a.deadline))===s).map(a=>({k:'tugas',t:a.judul,s:'Deadline '+fmt(a.deadline)})),
    ...d.exams.filter(e=>e.tanggal===s).map(e=>({k:'ujian',t:`${e.jenis} ${cname(e.course_id)}`,s:hm(e.jam)}))]}
  const first=(m.getDay()+6)%7, n=new Date(m.getFullYear(),m.getMonth()+1,0).getDate()
  const cells=[...Array(first).fill(null),...Array.from({length:n},(_,i)=>iso(new Date(m.getFullYear(),m.getMonth(),i+1)))]
  const mv=k=>setM(new Date(m.getFullYear(),m.getMonth()+k,1))
  return <><div className="head"><h1>Kalender</h1></div>
    <div className="card"><div className="mh"><button className="ic" onClick={()=>mv(-1)} aria-label="Bulan sebelumnya">‹</button><b>{m.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</b><button className="ic" onClick={()=>mv(1)} aria-label="Bulan berikutnya">›</button></div>
      <div className="cal">{DAYS.map(x=><small key={x}>{x.slice(0,3)}</small>)}
        {cells.map((s,i)=>s?<button key={s} className={(s===sel?'on ':'')+(s===iso(new Date())?'td':'')} onClick={()=>setSel(s)}>{+s.slice(8)}
          <i>{[...new Set(ev(s).map(e=>e.k))].map(k=><u key={k} className={k}/>)}</i></button>:<span key={i}/>)}</div>
      <div className="lg"><span><u className="kelas"/>Kelas</span><span><u className="tugas"/>Deadline</span><span><u className="ujian"/>Ujian</span></div></div>
    <div className="card"><h3>{new Date(sel+'T00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</h3>
      {ev(sel).length?ev(sel).map((e,i)=><div key={i} className="row"><u className={'dot '+e.k}/><div className="g"><b>{e.t}</b><small>{e.s}</small></div></div>):<Empty text="Tidak ada agenda."/>}</div></>
}

export function Ujian(){
  const {d,cname}=useApp()
  const rows=[...d.exams].sort((a,b)=>a.tanggal.localeCompare(b.tanggal))
  const fields=[{k:'course_id',l:'Mata kuliah',type:'select',req:1,opts:d.courses.map(c=>[c.id,c.nama])},{k:'jenis',l:'Jenis',type:'select',req:1,opts:[['UTS','UTS'],['UAS','UAS'],['Kuis','Kuis']]},
    {k:'tanggal',l:'Tanggal',type:'date',req:1},{k:'jam',l:'Jam',type:'time'},{k:'ruang',l:'Ruang'}]
  return <Crud t="exams" title="Jadwal Ujian" fields={fields} rows={rows} defaults={{jenis:'UTS'}}>
    {({rows,edit,remove})=>rows.length?rows.map(e=>{const n=dayDiff(e.tanggal);return <Row key={e.id} title={`${e.jenis} ${cname(e.course_id)}`} late={n<0}
      sub={`${new Date(e.tanggal+'T00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} • ${hm(e.jam)||'-'} • ${e.ruang||'-'}`}
      right={<span className={'bd '+(n<0?'tinggi':n<=7?'sedang':'rendah')}>{n<0?'Selesai':n===0?'Hari ini':n+' hari lagi'}</span>} edit={()=>edit(e)} remove={()=>remove(e)}/>})
      :<Empty text="Belum ada ujian terjadwal."/>}
  </Crud>
}

const weekDays=()=>{const t=new Date(),s=new Date(t);s.setDate(t.getDate()-(dow(t)-1));return Array.from({length:7},(_,i)=>{const x=new Date(s);x.setDate(s.getDate()+i);return iso(x)})}
export function Habit(){
  const {d,toggleHabit}=useApp(), wk=weekDays(), today=iso(new Date())
  const ok=(h,s)=>d.habit_logs.some(l=>l.habit_id===h.id&&l.tanggal===s&&l.selesai)
  const streak=h=>{let n=0,x=new Date();if(!ok(h,iso(x)))x.setDate(x.getDate()-1);while(ok(h,iso(x))){n++;x.setDate(x.getDate()-1)}return n}
  return <Crud t="habits" title="Habit Tracker" fields={[{k:'nama',l:'Nama kebiasaan',req:1},{k:'target_harian',l:'Target per hari',type:'number',req:1}]} rows={d.habits} defaults={{target_harian:1}}>
    {({rows,edit,remove})=>rows.length?rows.map(h=><div key={h.id} className="card"><div className="row"><div className="g"><b>{h.nama}</b><small>Target {h.target_harian}x/hari</small></div>
      <span className="bd sedang">🔥 {streak(h)} hari</span><button className="ic" onClick={()=>edit(h)} aria-label="Ubah">✏️</button><button className="ic" onClick={()=>remove(h)} aria-label="Hapus">🗑️</button></div>
      <div className="wk">{wk.map((s,i)=><button key={s} disabled={s>today} className={ok(h,s)?'on':''} onClick={()=>toggleHabit(h,s)} aria-label={`${DAYS[i]} ${ok(h,s)?'selesai':'belum'}`}><small>{DAYS[i].slice(0,3)}</small>{ok(h,s)?'✓':''}</button>)}</div></div>)
      :<Empty text="Tambahkan kebiasaan seperti belajar, olahraga, atau minum air."/>}
  </Crud>
}

export function Catatan(){
  const {d}=useApp(), [c,setC]=useState(''),[q,setQ]=useState('')
  const rows=d.notes.filter(n=>(!c||n.course_id===c)&&n.isi.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.created_at.localeCompare(a.created_at))
  return <Crud t="notes" title="Catatan Cepat" rows={rows} defaults={{course_id:c}} fields={[{k:'course_id',l:'Mata kuliah',type:'select',req:1,opts:d.courses.map(x=>[x.id,x.nama])},{k:'isi',l:'Catatan',type:'textarea',req:1}]}
    toolbar={<><Sel v={c} set={setC} o={d.courses.map(x=>[x.id,x.nama])} ph="Semua mata kuliah"/><input className="flt" placeholder="Cari catatan…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Cari catatan"/></>}>
    {({rows,edit,remove})=>rows.length?rows.map(n=><div key={n.id} className="card"><small className="mu">{d.courses.find(x=>x.id===n.course_id)?.nama} • {fmt(n.created_at)}</small>
      <p className="pre">{n.isi}</p><div className="acts"><button className="ic" onClick={()=>edit(n)} aria-label="Ubah">✏️</button><button className="ic" onClick={()=>remove(n)} aria-label="Hapus">🗑️</button></div></div>)
      :<Empty text={q?'Tidak ada catatan yang cocok.':'Belum ada catatan.'}/>}
  </Crud>
}

export function Statistik(){
  const {d}=useApp(), all=[...d.todos,...d.assignments]
  const mon=x=>{const t=new Date(x);t.setHours(0,0,0,0);t.setDate(t.getDate()-(dow(t)-1));return iso(t)}
  const cur=mon(new Date()), inWk=all.filter(x=>x.deadline&&mon(x.deadline)===cur)
  const pct=inWk.length?Math.round(inWk.filter(x=>x.status==='selesai').length/inWk.length*100):0
  const weeks=Array.from({length:6},(_,i)=>{const t=new Date();t.setDate(t.getDate()-7*(5-i));const k=mon(t);return {k,n:all.filter(x=>x.selesai_at&&mon(x.selesai_at)===k).length}})
  const mx=Math.max(1,...weeks.map(w=>w.n))
  const days=new Set([...all.filter(x=>x.selesai_at).map(x=>iso(new Date(x.selesai_at))),...d.habit_logs.filter(l=>l.selesai).map(l=>l.tanggal)])
  let st=0,x=new Date(); if(!days.has(iso(x)))x.setDate(x.getDate()-1); while(days.has(iso(x))){st++;x.setDate(x.getDate()-1)}
  const wk=weekDays(), cap=d.habits.length*wk.length, hd=d.habit_logs.filter(l=>l.selesai&&wk.includes(l.tanggal)).length
  return <><div className="head"><h1>Statistik</h1></div>
    <div className="grid"><div className="card big"><small>Tugas & to-do selesai minggu ini</small><h2>{pct}%</h2><small>{inWk.filter(x=>x.status==='selesai').length} dari {inWk.length}</small></div>
      <div className="card big"><small>Streak harian</small><h2>🔥 {st} hari</h2><small>Hari berturut-turut ada yang selesai</small></div>
      <div className="card big"><small>Konsistensi habit minggu ini</small><h2>{cap?Math.round(hd/cap*100):0}%</h2><small>{hd} dari {cap} centang</small></div></div>
    <div className="card"><h3>Tugas selesai per minggu</h3><div className="bars">{weeks.map(w=><div key={w.k}><i style={{height:8+w.n/mx*100}}><b>{w.n}</b></i><small>{w.k.slice(8)}/{w.k.slice(5,7)}</small></div>)}</div></div></>
}

export function Pengaturan(){
  const {d,user,profile,st,setSt,toast,reload}=useApp(), [nama,setNama]=useState(profile?.nama||''),[pw,setPw]=useState('')
  const upd=async p=>{const n={...st,...p};setSt(n);const {error}=await sb.from('settings').upsert({user_id:user.id,tema:n.tema,waktu_pengingat:n.waktu_pengingat});toast(error?error.message:'Pengaturan disimpan')}
  const exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='studyflow-data.json';a.click()}
  const hapus=async()=>{if(prompt('Ketik HAPUS untuk menghapus akun dan semua datamu secara permanen.')!=='HAPUS')return;const {error}=await sb.rpc('delete_account');if(error)return toast(error.message);await sb.auth.signOut()}
  return <><div className="head"><h1>Pengaturan</h1></div>
    <div className="card form"><h3>Akun</h3><label>Nama<input value={nama} onChange={e=>setNama(e.target.value)}/></label>
      <button className="btn" onClick={async()=>{if(!nama.trim())return toast('Nama tidak boleh kosong');const {error}=await sb.from('profiles').update({nama:nama.trim()}).eq('id',user.id);toast(error?error.message:'Nama diperbarui');reload&&location.reload()}}>Simpan nama</button>
      <label>Password baru<input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Minimal 6 karakter"/></label>
      <button className="btn" onClick={async()=>{if(pw.length<6)return toast('Password minimal 6 karakter');const {error}=await sb.auth.updateUser({password:pw});toast(error?error.message:'Password diganti');setPw('')}}>Ganti password</button></div>
    <div className="card form"><h3>Aplikasi</h3>
      <label>Tema<select value={st.tema} onChange={e=>upd({tema:e.target.value})}><option value="terang">Terang</option><option value="gelap">Gelap</option></select></label>
      <label>Pengingat sebelum kelas/deadline<select value={st.waktu_pengingat} onChange={e=>upd({waktu_pengingat:+e.target.value})}>{[[15,'15 menit'],[30,'30 menit'],[60,'1 jam'],[1440,'1 hari']].map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label>
      <button className="btn ghost" onClick={async()=>toast(('Notification' in window)?(await Notification.requestPermission())==='granted'?'Notifikasi aktif (saat aplikasi terbuka)':'Izin notifikasi ditolak':'Browser tidak mendukung notifikasi')}>Aktifkan notifikasi</button>
      <button className="btn ghost" onClick={exp}>Ekspor data (JSON)</button></div>
    <div className="card form"><h3>Zona bahaya</h3><button className="btn danger" onClick={hapus}>Hapus akun & semua data</button>
      <button className="btn ghost" onClick={()=>sb.auth.signOut()}>Keluar</button></div></>
}
