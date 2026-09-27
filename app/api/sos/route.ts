import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SosEventModel } from '@/lib/models/SosEvent'
export async function POST(req:Request){try{const b=await req.json();if(!Number.isFinite(Number(b.lat))||!Number.isFinite(Number(b.lng)))return NextResponse.json({error:'Valid location required'},{status:400});await connectDB();const event=await SosEventModel.create({lat:Number(b.lat),lng:Number(b.lng),accuracy:b.accuracy,message:b.message||'Emergency SOS'});return NextResponse.json({sos:event},{status:201})}catch{return NextResponse.json({error:'Unable to log SOS'},{status:500})}}
