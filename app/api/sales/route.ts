import { database } from '@/db/raw';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST(req: Request) {
  try {
    const b=await req.json() as Record<string, unknown>; const items=b.items;
    if(!Array.isArray(items)||!items.length||items.length>100||!['Tunai','Non-tunai'].includes(String(b.method))) return NextResponse.json({error:'Data transaksi tidak valid.'},{status:400});
    const quantities=new Map<number,number>();
    for(const item of items){const id=Number(item.id),qty=Number(item.quantity);if(!Number.isSafeInteger(id)||id<=0||!Number.isSafeInteger(qty)||qty<1||qty>999)return NextResponse.json({error:'Jumlah barang tidak valid.'},{status:400});quantities.set(id,(quantities.get(id)||0)+qty)}
    const rows=[] as {id:number;name:string;price:number;quantity:number}[];
    for(const [id,quantity] of quantities){const p=await database().prepare('SELECT id,name,price FROM products WHERE id=? AND active=1').bind(id).first<{id:number;name:string;price:number}>();if(!p)return NextResponse.json({error:'Produk tidak tersedia. Muat ulang katalog.'},{status:400});rows.push({...p,quantity})}
    const total=rows.reduce((s,r)=>s+r.price*r.quantity,0),paid=Number(b.paid);
    if(!Number.isSafeInteger(paid)||paid<total||total>10000000000)return NextResponse.json({error:'Jumlah pembayaran tidak valid.'},{status:400});
    const createdAt=new Date().toISOString(); const saleId=Math.floor(Math.random()*900000000000000)+100000000000000;
    const statements=[database().prepare('INSERT INTO sales (id,created_at,total,method,paid) VALUES (?,?,?,?,?)').bind(saleId,createdAt,total,String(b.method),paid),...rows.map(r=>database().prepare('INSERT INTO sale_items (sale_id,product_id,name,quantity,unit_price) VALUES (?,?,?,?,?)').bind(saleId,r.id,r.name,r.quantity,r.price))];
    const result=await database().batch(statements);
    return NextResponse.json({id:saleId,total,paid,createdAt});
  }catch(e){console.error(e);return NextResponse.json({error:'Transaksi gagal disimpan. Coba lagi.'},{status:503})}
}
