import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET() {
  await connectDB();
  const data = await User.find({});
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newData = await User.create(body);
  return NextResponse.json(newData);
}