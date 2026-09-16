import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';

export async function GET() {
  await connectDB();
  const data = await Category.find({});
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newData = await Category.create(body);
  return NextResponse.json(newData);
}