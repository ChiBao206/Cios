export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../lib/mongodb';

const SupportSchema = new mongoose.Schema({
  customer: String,
  phone: String,
  issue: String,
  status: { type: String, default: 'Chưa trả lời' },
  admin_reply: String
}, { timestamps: true, strict: false });

const Support = mongoose.models.Support || mongoose.model('Support', SupportSchema);

export async function GET() {
  await connectDB();
  const data = await Support.find({}).sort({ createdAt: 1 }); // Sắp xếp theo thứ tự thời gian cũ -> mới
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newData = await Support.create(body);
  return NextResponse.json(newData, { status: 201 });
}

export async function PUT(req: Request) {
  await connectDB();
  const { id, admin_reply } = await req.json();
  
  // Dùng findByIdAndUpdate với _id chính xác
  const updated = await Support.findByIdAndUpdate(
    id, 
    { status: 'Đã trả lời', admin_reply: admin_reply }, 
    { new: true }
  );
  return NextResponse.json(updated, { status: 200 });
}