import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';

export async function GET() {
  try {
    await connectDB();
    const data = await Category.find({});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi kết nối DB" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newData = await Category.create(body);
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi thêm danh mục" }, { status: 500 });
  }
}

// BỔ SUNG: HÀM SỬA TÊN DANH MỤC (PUT)
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ message: "Thiếu ID danh mục" }, { status: 400 });

    await connectDB();
    const updatedCategory = await Category.findByIdAndUpdate(id, { name: body.name }, { new: true });
    
    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi cập nhật danh mục" }, { status: 500 });
  }
}

// BỔ SUNG: HÀM XÓA DANH MỤC (DELETE)
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Thiếu ID danh mục" }, { status: 400 });

    await connectDB();
    await Category.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Đã xóa danh mục" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi xóa danh mục" }, { status: 500 });
  }
}