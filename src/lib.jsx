// Helper, konteks, data awal/demo, dan komponen UI bersama
import {createContext,useContext,useState} from 'react'
import {createClient} from '@supabase/supabase-js'

export const hasSupabase=Boolean(import.meta.env.VITE_SUPABASE_URL&&import.meta.env.VITE_SUPABASE_ANON_KEY)
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL||'https://placeholder.supabase.co',import.meta.env.VITE_SUPABASE_ANON_KEY||'placeholder')
export const Ctx=createContext()
export const useApp=()=>useContext(Ctx)

export const DAYS=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
export const DAYS_SHORT=['Sen','Sel','Rab','Kam','Jum','Sab','Min']
export const PRI={tinggi:'Tinggi',sedang:'Sedang',rendah:'Rendah'}
export const STA={belum:'Belum Mulai',dikerjakan:'Dikerjakan',selesai:'Selesai'}
export const ORD={tinggi:0,sedang:1,rendah:2}
export const opt=o=>Object.entries(o)
export const dow=d=>(d.getDay()+6)%7+1 // 1=Senin..7=Minggu
export const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)
export const loc=s=>s?new Date(new Date(s)-new Date(s).getTimezoneOffset()*6e4).toISOString().slice(0,16):''
export const hm=s=>s?String(s).slice(0,5).replace(':', '.'):''
export const hmColon=s=>s?String(s).slice(0,5).replace('.', ':'):''
export const dayDiff=s=>Math.round((new Date(s+'T00:00')-new Date(iso(new Date())+'T00:00'))/864e5)
export const fmt=s=>new Date(s).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
export const fmtDate=s=>s?new Date(s+(s.length===10?'T00:00':'')).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):''

export function rel(ts){
  const target=new Date(ts), now=new Date()
  if(iso(target)===iso(now)){
    const t=target.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace(':','.')
    return `Hari ini · ${t}`
  }
  const m=Math.round((target-now)/6e4),a=Math.abs(m)
  const u=a<60?a+' mnt':a<1440?Math.round(a/60)+' jam':Math.round(a/1440)+' hari'
  return m<0?'Terlambat '+u:u+' lagi'
}

export function getWeekDates(ref=new Date()){
  const start=new Date(ref)
  start.setDate(ref.getDate()-(dow(ref)-1))
  return Array.from({length:7},(_,i)=>{
    const dt=new Date(start)
    dt.setDate(start.getDate()+i)
    return {
      idx:i+1,
      short:DAYS_SHORT[i],
      full:DAYS[i],
      dayNum:dt.getDate(),
      iso:iso(dt),
      date:dt
    }
  })
}

export function courseVisual(nama='', warna='#5b4bd5', idx=0){
  const n=(nama||'').toLowerCase()
  if(n.includes('pemrograman')||n.includes('web')||n.includes('algoritma')||n.includes('kode'))
    return {icon:'</>',bg:'#e0ecff',fg:'#2563eb',cardBg:'#f4f8ff',border:'#cfe2ff'}
  if(n.includes('matematika')||n.includes('diskrit')||n.includes('kalkulus')||n.includes('statistik'))
    return {icon:'∑',bg:'#ede9fe',fg:'#6d28d9',cardBg:'#f7f5ff',border:'#ddd6fe'}
  if(n.includes('basis data')||n.includes('database')||n.includes('data')||n.includes('sistem'))
    return {icon:'🗄️',bg:'#dcfce7',fg:'#15803d',cardBg:'#f2fcf6',border:'#bbf7d0'}
  if(n.includes('desain')||n.includes('ui')||n.includes('ux')||n.includes('grafis'))
    return {icon:'🎨',bg:'#ffedd5',fg:'#d97706',cardBg:'#fffaf2',border:'#fed7aa'}
  const palettes=[
    {icon:'</>',bg:'#e0ecff',fg:'#2563eb',cardBg:'#f4f8ff',border:'#cfe2ff'},
    {icon:'📘',bg:'#ede9fe',fg:'#6d28d9',cardBg:'#f7f5ff',border:'#ddd6fe'},
    {icon:'🗂️',bg:'#dcfce7',fg:'#15803d',cardBg:'#f2fcf6',border:'#bbf7d0'},
    {icon:'✨',bg:'#ffedd5',fg:'#d97706',cardBg:'#fffaf2',border:'#fed7aa'}
  ]
  return palettes[idx%palettes.length]
}

export function habitVisual(nama='', idx=0){
  const n=(nama||'').toLowerCase()
  if(n.includes('belajar')||n.includes('baca')||n.includes('buku'))
    return {icon:'📖',bg:'#e0ecff',fg:'#2563eb',sub:'(min. 1 jam)'}
  if(n.includes('olahraga')||n.includes('lari')||n.includes('gym')||n.includes('workout'))
    return {icon:'🏋️',bg:'#ede9fe',fg:'#5b4bd5',sub:'(min. 30 menit)'}
  if(n.includes('minum')||n.includes('air')||n.includes('hidrasi'))
    return {icon:'💧',bg:'#dff4ff',fg:'#0284c7',sub:'(8 gelas)'}
  const icons=['🎯','⚡','🌱','🧠']
  return {icon:icons[idx%icons.length],bg:'#ede9fe',fg:'#5b4bd5',sub:null}
}

// Data contoh sesuai tampilan desain referensi untuk mode pratinjau / demo lokal
export function createSeedData(){
  const now=new Date()
  const todayIso=iso(now)
  const todayDow=dow(now)
  const wk=getWeekDates(now)
  const dPlus=(days)=>{const x=new Date(now);x.setDate(x.getDate()+days);return iso(x)}
  const todayLate=new Date(now); todayLate.setHours(23,59,0,0)
  const tmrwLate=new Date(now); tmrwLate.setDate(tmrwLate.getDate()+1); tmrwLate.setHours(23,59,0,0)

  const courses=[
    {id:'c-web',nama:'Pemrograman Web',hari:todayDow,jam_mulai:'08:00',jam_selesai:'10:00',ruang:'R.302',dosen:'Dr. Budi Santoso',warna:'#3b82f6',created_at:'2025-06-01T08:00:00Z'},
    {id:'c-mat',nama:'Matematika Diskrit',hari:todayDow,jam_mulai:'10:30',jam_selesai:'12:00',ruang:'R.201',dosen:'Dr. Sari Dewi',warna:'#7c3aed',created_at:'2025-06-01T08:01:00Z'},
    {id:'c-db',nama:'Basis Data',hari:todayDow,jam_mulai:'13:00',jam_selesai:'15:00',ruang:'R.304',dosen:'Prof. Ahmad',warna:'#16a34a',created_at:'2025-06-01T08:02:00Z'},
    {id:'c-ui',nama:'Desain UI/UX',hari:todayDow,jam_mulai:'15:30',jam_selesai:'17:00',ruang:'R.305',dosen:'Ibu Rina',warna:'#ea580c',created_at:'2025-06-01T08:03:00Z'},
    {id:'c-web-2',nama:'Praktikum Pemrograman Web',hari:(todayDow%7)+1,jam_mulai:'09:00',jam_selesai:'11:00',ruang:'Lab 2',dosen:'Dr. Budi Santoso',warna:'#3b82f6',created_at:'2025-06-01T08:04:00Z'},
    {id:'c-db-2',nama:'Praktikum Basis Data',hari:((todayDow+1)%7)+1,jam_mulai:'13:00',jam_selesai:'15:00',ruang:'Lab 1',dosen:'Prof. Ahmad',warna:'#16a34a',created_at:'2025-06-01T08:05:00Z'}
  ]

  const assignments=[
    {id:'a-1',course_id:'c-ui',judul:'Laporan UI/UX',deskripsi:'Wireframe, high-fidelity prototype, dan laporan usability testing.',deadline:todayLate.toISOString(),prioritas:'tinggi',status:'belum',selesai_at:null,created_at:'2025-06-02T09:00:00Z'},
    {id:'a-2',course_id:'c-web',judul:'Integrasi REST API React',deskripsi:'Implementasi autentikasi dan CRUD menggunakan hooks.',deadline:tmrwLate.toISOString(),prioritas:'sedang',status:'belum',selesai_at:null,created_at:'2025-06-02T10:00:00Z'},
    {id:'a-3',course_id:'c-db',judul:'Normalisasi Skema ERD',deskripsi:'Normalisasi 1NF hingga 3NF untuk studi kasus akademik.',deadline:todayLate.toISOString(),prioritas:'tinggi',status:'selesai',selesai_at:new Date(now-3600e3*5).toISOString(),created_at:'2025-06-01T10:00:00Z'},
    {id:'a-4',course_id:'c-mat',judul:'Latihan Graf & Pohon',deskripsi:'Bab 5 soal nomor 1 sampai 10.',deadline:todayLate.toISOString(),prioritas:'sedang',status:'selesai',selesai_at:new Date(now-864e5*1).toISOString(),created_at:'2025-06-01T11:00:00Z'},
    {id:'a-5',course_id:'c-web',judul:'Styling Layout Responsif',deskripsi:'Flexbox dan CSS Grid.',deadline:todayLate.toISOString(),prioritas:'rendah',status:'selesai',selesai_at:new Date(now-864e5*2).toISOString(),created_at:'2025-06-01T12:00:00Z'},
    {id:'a-6',course_id:'c-ui',judul:'User Persona & Empathy Map',deskripsi:'Riset 5 responden mahasiswa.',deadline:todayLate.toISOString(),prioritas:'sedang',status:'selesai',selesai_at:new Date(now-864e5*3).toISOString(),created_at:'2025-06-01T13:00:00Z'}
  ]

  const todos=[
    {id:'t-1',judul:'Belajar React',catatan:'Pelajari useEffect, custom hooks, dan state management.',prioritas:'sedang',deadline:tmrwLate.toISOString(),status:'belum',kategori:'Pemrograman Web',pengulangan:'tidak',selesai_at:null,created_at:'2025-06-03T08:00:00Z'},
    {id:'t-2',judul:'Olahraga ringan',catatan:'Stretching dan jogging pagi 30 menit.',prioritas:'rendah',deadline:todayLate.toISOString(),status:'belum',kategori:'Kesehatan',pengulangan:'harian',selesai_at:null,created_at:'2025-06-03T08:30:00Z'},
    {id:'t-3',judul:'Review materi SQL Join',catatan:'Inner join, left join, dan agregasi.',prioritas:'sedang',deadline:todayLate.toISOString(),status:'selesai',kategori:'Basis Data',pengulangan:'tidak',selesai_at:new Date(now-3600e3*2).toISOString(),created_at:'2025-06-02T08:00:00Z'},
    {id:'t-4',judul:'Rapikan catatan kuliah',catatan:'Ringkasan minggu ini.',prioritas:'rendah',deadline:todayLate.toISOString(),status:'selesai',kategori:'Akademik',pengulangan:'mingguan',selesai_at:new Date(now-3600e3*6).toISOString(),created_at:'2025-06-02T09:00:00Z'},
    {id:'t-5',judul:'Latihan soal logika proposisi',catatan:'Persiapan kuis.',prioritas:'tinggi',deadline:todayLate.toISOString(),status:'selesai',kategori:'Matematika Diskrit',pengulangan:'tidak',selesai_at:new Date(now-864e5*1).toISOString(),created_at:'2025-06-02T10:00:00Z'},
    {id:'t-6',judul:'Baca dokumentasi Vite',catatan:'Optimasi build.',prioritas:'rendah',deadline:todayLate.toISOString(),status:'selesai',kategori:'Pemrograman Web',pengulangan:'tidak',selesai_at:new Date(now-864e5*2).toISOString(),created_at:'2025-06-02T11:00:00Z'},
    {id:'t-7',judul:'Setup repositori GitHub',catatan:'Inisialisasi project kelompok.',prioritas:'sedang',deadline:todayLate.toISOString(),status:'selesai',kategori:'Pemrograman Web',pengulangan:'tidak',selesai_at:new Date(now-864e5*2).toISOString(),created_at:'2025-06-02T12:00:00Z'},
    {id:'t-8',judul:'Diskusi kelompok UI/UX',catatan:'Pembagian tugas wireframe.',prioritas:'tinggi',deadline:todayLate.toISOString(),status:'selesai',kategori:'Desain UI/UX',pengulangan:'tidak',selesai_at:new Date(now-864e5*3).toISOString(),created_at:'2025-06-02T13:00:00Z'},
    {id:'t-9',judul:'Install PostgreSQL lokal',catatan:'Cek koneksi pgAdmin.',prioritas:'sedang',deadline:todayLate.toISOString(),status:'selesai',kategori:'Basis Data',pengulangan:'tidak',selesai_at:new Date(now-864e5*4).toISOString(),created_at:'2025-06-02T14:00:00Z'},
    {id:'t-10',judul:'Buat jadwal belajar mingguan',catatan:'Target IPK semester ini.',prioritas:'rendah',deadline:todayLate.toISOString(),status:'selesai',kategori:'Akademik',pengulangan:'tidak',selesai_at:new Date(now-864e5*5).toISOString(),created_at:'2025-06-02T15:00:00Z'}
  ]

  const exams=[
    {id:'e-1',course_id:'c-web',jenis:'UTS',tanggal:dPlus(9),jam:'08:00',ruang:'R.302',created_at:'2025-06-01T09:00:00Z'},
    {id:'e-2',course_id:'c-db',jenis:'UAS',tanggal:dPlus(51),jam:'10:00',ruang:'R.304',created_at:'2025-06-01T09:05:00Z'},
    {id:'e-3',course_id:'c-mat',jenis:'Kuis',tanggal:dPlus(-5),jam:'10:30',ruang:'R.201',created_at:'2025-05-20T09:00:00Z'}
  ]

  const habits=[
    {id:'h-1',nama:'Belajar (min. 1 jam)',target_harian:1,created_at:'2025-06-01T07:00:00Z'},
    {id:'h-2',nama:'Olahraga (min. 30 menit)',target_harian:1,created_at:'2025-06-01T07:05:00Z'},
    {id:'h-3',nama:'Minum Air (8 gelas)',target_harian:8,created_at:'2025-06-01T07:10:00Z'}
  ]

  const habit_logs=[
    {id:'hl-1',habit_id:'h-1',tanggal:todayIso,selesai:true},
    {id:'hl-2',habit_id:'h-3',tanggal:todayIso,selesai:true},
    ...Array.from({length:11},(_,i)=>{
      const dt=dPlus(-(i+1))
      return [
        {id:`hl-a-${i}`,habit_id:'h-1',tanggal:dt,selesai:true},
        {id:`hl-b-${i}`,habit_id:'h-2',tanggal:dt,selesai:i%2===0},
        {id:`hl-c-${i}`,habit_id:'h-3',tanggal:dt,selesai:true}
      ]
    }).flat(),
    ...wk.map((w,i)=>({id:`hl-w-${i}`,habit_id:'h-1',tanggal:w.iso,selesai:w.iso<=todayIso}))
  ]

  const notes=[
    {id:'n-1',course_id:'c-web',isi:'Komponen React bersifat deklaratif.\n• Gunakan useState untuk state lokal\n• Gunakan useEffect untuk sinkronisasi efek samping\n• Pisahkan logika ke dalam custom hook agar mudah diuji',created_at:new Date(now-3600e3*3).toISOString()},
    {id:'n-2',course_id:'c-ui',isi:'Prinsip Visual Hierarchy:\n1. Ukuran dan bobot tipografi yang jelas\n2. Kontras warna terkurasi\n3. Whitespace yang seimbang antar kartu',created_at:new Date(now-864e5).toISOString()}
  ]

  return {courses,assignments,todos,exams,habits,habit_logs,notes}
}

export async function save(t,r,demoUpdater){
  r={...r}; delete r.created_at
  if(t==='todos'||t==='assignments') r.selesai_at=r.status==='selesai'?(r.selesai_at||new Date().toISOString()):null
  if(demoUpdater){
    demoUpdater(t,r)
    return null
  }
  const {error}=await (r.id?sb.from(t).update(r).eq('id',r.id):sb.from(t).insert(r))
  return error
}

export const Empty=({text,icon='✨'})=><div className="empty"><div className="empty-ic">{icon}</div><p>{text}</p></div>

export const Badge=({p})=><span className={'bd '+(p||'sedang')}>{PRI[p]||p}</span>

export const Sel=({v,set,o,ph})=><select className="flt" value={v} onChange={e=>set(e.target.value)} aria-label={ph}>
  {ph!==''&&<option value="">{ph}</option>}
  {o.map(([k,l])=><option key={k} value={k}>{l}</option>)}
</select>

export const PageHeader=({title,sub,onBack,right})=><header className="page-head">
  <div className="page-head-left">
    {onBack&&<button type="button" className="back-btn" onClick={onBack} aria-label="Kembali">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>}
    <div>
      <h1>{title}</h1>
      {sub&&<p className="mu">{sub}</p>}
    </div>
  </div>
  {right&&<div className="page-head-right">{right}</div>}
</header>

export const Row=({done,onTick,title,sub,right,edit,remove,late,icon,circleCheck})=>
  <div className={'row-card'+(done?' done':'')}>
    {onTick&&(
      <button type="button" className={'chk'+(circleCheck?' circle':'')+(done?' checked':'')} onClick={onTick} aria-label="Tandai selesai">
        {done&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>
    )}
    {icon&&<div className="row-icon" style={{background:icon.bg,color:icon.fg}}>{icon.el}</div>}
    <div className="g">
      <b>{title}</b>
      {sub&&<small className={late?'late':''}>{sub}</small>}
    </div>
    {right}
    {(edit||remove)&&<div className="row-actions">
      {edit&&<button type="button" className="ic" onClick={edit} aria-label="Ubah" title="Ubah">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>}
      {remove&&<button type="button" className="ic danger-ic" onClick={remove} aria-label="Hapus" title="Hapus">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>}
    </div>}
  </div>

// Komponen Form Modal / Sheet dengan desain pil Prioritas & pemilih Tanggal/Jam seperti di foto referensi
export function FormSheet({title,fields,initial,onClose,onSave,busy,msg}){
  const [f,setF]=useState(()=>{
    const o={...initial}
    fields.forEach(x=>{
      if(x.type==='datetime'){
        const l=loc(o[x.k])
        o[x.k]=l
        o[x.k+'_date']=l?l.slice(0,10):iso(new Date())
        o[x.k+'_time']=l?l.slice(11,16):'23:59'
      }
    })
    return o
  })
  const [err,setErr]=useState({})
  const S=(k,v)=>setF(p=>({...p,[k]:v}))

  const submit=e=>{
    e.preventDefault()
    const er={}
    const out={...f}
    fields.forEach(x=>{
      if(x.type==='datetime'){
        const dt=out[x.k+'_date']
        const tm=out[x.k+'_time']||'23:59'
        out[x.k]=dt?`${dt}T${tm}`:''
        delete out[x.k+'_date']
        delete out[x.k+'_time']
      }
      if(x.req&&!out[x.k])er[x.k]='Wajib diisi'
    })
    setErr(er)
    if(Object.keys(er).length)return
    onSave(out)
  }

  return <div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <form className="sheet" onSubmit={submit} noValidate>
      <div className="sheet-head">
        <button type="button" className="back-btn" onClick={onClose} aria-label="Tutup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <h2>{title}</h2>
      </div>
      <div className="sheet-body">
        {fields.map(x=>{
          if(x.k==='prioritas'){
            return <div key={x.k} className="field-group">
              <span className="field-label">{x.l}</span>
              <div className="pri-pills">
                {[['tinggi','Tinggi','◆'],['sedang','Sedang','●'],['rendah','Rendah','●']].map(([k,l,ic])=>
                  <button type="button" key={k} className={`pri-pill ${k} ${f[x.k]===k?'active':''}`} onClick={()=>S(x.k,k)}>
                    <span className="pri-dot">{ic}</span> {l}
                  </button>
                )}
              </div>
            </div>
          }
          if(x.type==='datetime'){
            return <div key={x.k} className="field-group">
              <span className="field-label">{x.l}{x.req&&' *'}</span>
              <div className="split-dt">
                <label className="dt-box">
                  <span className="dt-ic">📅</span>
                  <input type="date" value={f[x.k+'_date']??''} onChange={e=>S(x.k+'_date',e.target.value)}/>
                </label>
                <label className="dt-box time-box">
                  <span className="dt-ic">🕒</span>
                  <input type="time" value={f[x.k+'_time']??'23:59'} onChange={e=>S(x.k+'_time',e.target.value)}/>
                </label>
              </div>
              {err[x.k]&&<small className="err">{err[x.k]}</small>}
            </div>
          }
          return <label key={x.k} className="field-group">
            <span className="field-label">{x.l}{x.req&&' *'}</span>
            {x.type==='textarea'?<textarea rows="3" placeholder={x.ph||`Tambah ${x.l.toLowerCase()}...`} value={f[x.k]??''} onChange={e=>S(x.k,e.target.value)}/>
            :x.type==='select'?<div className="select-wrap">
              {(x.k==='course_id'||x.k==='kategori')&&<span className="select-prefix">&lt;/&gt;</span>}
              <select className={(x.k==='course_id'||x.k==='kategori')?'with-prefix':''} value={f[x.k]??''} onChange={e=>S(x.k,e.target.value)}>
                {!x.noEmpty&&<option value="">{x.ph||'Pilih…'}</option>}
                {x.opts.map(([k,l])=><option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            :<input type={x.type||'text'} placeholder={x.ph||''} value={f[x.k]??''} onChange={e=>S(x.k,e.target.value)} min={x.type==='number'?1:undefined}/>}
            {err[x.k]&&<small className="err">{err[x.k]}</small>}
          </label>
        })}
        {msg&&<p className="err" role="alert">{msg}</p>}
      </div>
      <div className="sheet-foot">
        <button className="btn full-btn" disabled={busy}>{busy?'Menyimpan…':'Simpan'}</button>
      </div>
    </form>
  </div>
}

// CRUD generik: header halaman + tombol tambah + form modal
export function Crud({t,title,onBack,fields,defaults={},rows,toolbar,beforeSave,children}){
  const {reload,toast,demoSave,demoDelete}=useApp()
  const [f,setF]=useState(null),[msg,setMsg]=useState(''),[busy,setB]=useState(false)
  const open=r=>{setMsg('');setF({...defaults,...r})}
  const submit=async row=>{
    const m=beforeSave?.(row); if(m){if(m!=='cancel')setMsg(m);return}
    const clean={...row}
    fields.forEach(x=>{if(x.type==='datetime'&&clean[x.k])clean[x.k]=new Date(clean[x.k]).toISOString(); if(clean[x.k]==='')clean[x.k]=null})
    setB(true); const er2=await save(t,clean,demoSave); setB(false)
    if(er2)return setMsg('Gagal menyimpan: '+er2.message)
    setF(null); reload(t); toast('Tersimpan')
  }
  const remove=async r=>{
    if(!confirm('Hapus data ini?'))return
    if(demoDelete){demoDelete(t,r.id);toast('Dihapus');return}
    const {error}=await sb.from(t).delete().eq('id',r.id)
    error?toast(error.message):(reload(t),toast('Dihapus'))
  }
  return <>
    <PageHeader title={title} onBack={onBack} right={<button className="btn add-pill" onClick={()=>open()}>＋ Tambah</button>}/>
    {toolbar&&<div className="bar">{toolbar}</div>}
    {children({rows,edit:open,remove,open})}
    {f&&<FormSheet title={`${f.id?'Ubah':'Tambah'} ${title}`} fields={fields} initial={f} onClose={()=>setF(null)} onSave={submit} busy={busy} msg={msg}/>}
  </>
}
