import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

// LẤY DANH SÁCH SẢN PHẨM TỪ MONGODB
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }); // Lấy tất cả, sắp xếp mới nhất lên đầu
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi kết nối database" }, { status: 500 });
  }
}

// THÊM SẢN PHẨM MỚI VÀO MONGODB
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json(); 
    const newProduct = await Product.create(body);
    return NextResponse.json({ message: "Thêm thành công!", product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Thêm thất bại", error }, { status: 500 });
  }
}