// Helper, konteks, dan komponen UI bersama
import {createContext,useContext,useState} from 'react'
import {createClient} from '@supabase/supabase-js'
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL||'https://placeholder.supabase.co',import.meta.env.VITE_SUPABASE_ANON_KEY||'placeholder')
export const Ctx=createContext(); export const useApp=()=>useContext(Ctx)
export const DAYS=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
export const PRI={tinggi:'Tinggi',sedang:'Sedang',rendah:'Rendah'}
export const STA={belum:'Belum mulai',dikerjakan:'Dikerjakan',selesai:'Selesai'}
export const ORD={tinggi:0,sedang:1,rendah:2}
export const opt=o=>Object.entries(o)
export const dow=d=>(d.getDay()+6)%7+1                       // 1=Senin..7=Minggu
export const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)
export const loc=s=>s?new Date(new Date(s)-new Date(s).getTimezoneOffset()*6e4).toISOString().slice(0,16):''
export const hm=s=>s?String(s).slice(0,5):''
export const dayDiff=s=>Math.round((new Date(s+'T00:00')-new Date(iso(new Date())+'T00:00'))/864e5)
export const fmt=s=>new Date(s).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
export function rel(ts){ // sisa waktu / keterlambatan
  const m=Math.round((new Date(ts)-Date.now())/6e4),a=Math.abs(m)
  const u=a<60?a+' mnt':a<1440?Math.round(a/60)+' jam':Math.round(a/1440)+' hari'
  return m<0?'Terlambat '+u:u+' lagi'
}
export async function save(t,r){
  r={...r}; delete r.created_at
  if(t==='todos'||t==='assignments') r.selesai_at=r.status==='selesai'?(r.selesai_at||new Date().toISOString()):null
  const {error}=await (r.id?sb.from(t).update(r).eq('id',r.id):sb.from(t).insert(r)); return error
}
export const Empty=({text})=><div className="empty"><div>✨</div><p>{text}</p></div>
export const Badge=({p})=><span className={'bd '+p}>{PRI[p]}</span>
export const Sel=({v,set,o,ph})=><select className="flt" value={v} onChange={e=>set(e.target.value)} aria-label={ph}><option value="">{ph}</option>{o.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
export const Row=({done,onTick,title,sub,right,edit,remove,late})=>
  <div className={'row'+(done?' done':'')}>
    {onTick&&<input type="checkbox" checked={done} onChange={onTick} aria-label="Tandai selesai"/>}
    <div className="g"><b>{title}</b><small className={late?'late':''}>{sub}</small></div>{right}
    {edit&&<button className="ic" onClick={edit} aria-label="Ubah">✏️</button>}
    {remove&&<button className="ic" onClick={remove} aria-label="Hapus">🗑️</button>}
  </div>

// CRUD generik: tombol tambah + form modal dengan validasi
export function Crud({t,title,fields,defaults={},rows,toolbar,beforeSave,children}){
  const {reload,toast}=useApp()
  const [f,setF]=useState(null),[err,setErr]=useState({}),[msg,setMsg]=useState(''),[busy,setB]=useState(false)
  const open=r=>{const o={...defaults,...r};fields.forEach(x=>{if(x.type==='datetime')o[x.k]=loc(o[x.k])});setErr({});setMsg('');setF(o)}
  const submit=async e=>{
    e.preventDefault(); const er={}
    fields.forEach(x=>{if(x.req&&!f[x.k])er[x.k]='Wajib diisi'}); setErr(er); if(Object.keys(er).length)return
    const m=beforeSave?.(f); if(m){if(m!=='cancel')setMsg(m);return}
    const row={...f}
    fields.forEach(x=>{if(x.type==='datetime'&&row[x.k])row[x.k]=new Date(row[x.k]).toISOString(); if(row[x.k]==='')row[x.k]=null})
    setB(true); const er2=await save(t,row); setB(false)
    if(er2)return setMsg('Gagal menyimpan: '+er2.message)
    setF(null); reload(t); toast('Tersimpan')
  }
  const remove=async r=>{if(!confirm('Hapus data ini?'))return; const {error}=await sb.from(t).delete().eq('id',r.id); error?toast(error.message):(reload(t),toast('Dihapus'))}
  const S=k=>e=>setF({...f,[k]:e.target.value})
  return <>
    <div className="head"><h1>{title}</h1><button className="btn" onClick={()=>open()}>＋ Tambah</button></div>
    {toolbar&&<div className="bar">{toolbar}</div>}
    {children({rows,edit:open,remove})}
    {f&&<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&setF(null)}>
      <form className="sheet" onSubmit={submit} noValidate>
        <h2>{f.id?'Ubah':'Tambah'} {title.toLowerCase()}</h2>
        {fields.map(x=><label key={x.k}>{x.l}{x.req&&' *'}
          {x.type==='textarea'?<textarea rows="3" value={f[x.k]??''} onChange={S(x.k)}/>
          :x.type==='select'?<select value={f[x.k]??''} onChange={S(x.k)}><option value="">Pilih…</option>{x.opts.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
          :<input type={x.type==='datetime'?'datetime-local':x.type||'text'} value={f[x.k]??''} onChange={S(x.k)} min={x.type==='number'?1:undefined}/>}
          {err[x.k]&&<small className="err">{err[x.k]}</small>}</label>)}
        {msg&&<p className="err" role="alert">{msg}</p>}
        <div className="acts"><button type="button" className="btn ghost" onClick={()=>setF(null)}>Batal</button><button className="btn" disabled={busy}>{busy?'Menyimpan…':'Simpan'}</button></div>
      </form></div>}
  </>
}
