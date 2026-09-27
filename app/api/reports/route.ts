import { database } from '@/db/raw';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function GET(req:Request){try{
  const url=new URL(req.url),period=url.searchParams.get('period');if(!['day','week','month'].includes(period||''))return NextResponse.json({error:'Periode tidak valid.'},{status:400});
  const now=new Date(),offset=7*3600000,local=new Date(now.getTime()+offset);let start:Date,end:Date;
  const y=local.getUTCFullYear(),m=local.getUTCMonth(),d=local.getUTCDate();
  if(period==='day'){start=new Date(Date.UTC(y,m,d)-offset);end=new Date(Date.UTC(y,m,d+1)-offset)}
  else if(period==='week'){const monday=d-((local.getUTCDay()+6)%7);start=new Date(Date.UTC(y,m,monday)-offset);end=new Date(Date.UTC(y,m,monday+7)-offset)}
  else {start=new Date(Date.UTC(y,m,1)-offset);end=new Date(Date.UTC(y,m+1,1)-offset)}
  const result=await database().prepare('SELECT id,created_at,total,method FROM sales WHERE created_at>=? AND created_at<? ORDER BY created_at DESC').bind(start.toISOString(),end.toISOString()).all();
  const rows=result.results as {id:number;created_at:string;total:number;method:string}[];
  return NextResponse.json({start:start.toISOString(),end:end.toISOString(),count:rows.length,revenue:rows.reduce((s,r)=>s+r.total,0),sales:rows});
}catch(e){console.error(e);return NextResponse.json({error:'Laporan belum dapat dimuat.'},{status:503})}}
