import { database } from '@/db/raw';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function GET() {
  try {
    const result = await database().prepare('SELECT id,name,category,price,icon,tone FROM products WHERE active=1 ORDER BY id').all();
    return NextResponse.json(result.results);
  } catch (e) { console.error(e); return NextResponse.json({error:'Produk belum dapat dimuat.'},{status:503}); }
}
export async function POST(req: Request) {
  try {
    const b = await req.json() as Record<string, unknown>; const name=String(b.name||'').trim().slice(0,100),category=String(b.category||'').trim().slice(0,50), price=Number(b.price);
    if(!name||!category||!Number.isSafeInteger(price)||price<=0||price>1000000000) return NextResponse.json({error:'Nama, kategori, dan harga yang valid diperlukan.'},{status:400});
    const icon=String(b.icon||'📦').slice(0,8);
    const result=await database().prepare('INSERT INTO products (name,category,price,icon,tone,active) VALUES (?,?,?,?,?,1)').bind(name,category,price,icon,'#e7f0ea').run();
    return NextResponse.json({id:result.meta.last_row_id,name,category,price,icon,tone:'#e7f0ea'},{status:201});
  } catch(e){console.error(e);return NextResponse.json({error:'Produk gagal disimpan.'},{status:503})}
}
export async function DELETE(req: Request) {
  try {const id=Number(new URL(req.url).searchParams.get('id'));if(!Number.isSafeInteger(id)||id<=0)return NextResponse.json({error:'ID produk tidak valid.'},{status:400});await database().prepare('UPDATE products SET active=0 WHERE id=?').bind(id).run();return NextResponse.json({ok:true})}catch(e){console.error(e);return NextResponse.json({error:'Produk gagal dihapus.'},{status:503})}
}
