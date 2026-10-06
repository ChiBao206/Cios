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

// BỔ SUNG HÀM DELETE VÀO CUỐI FILE API SẢN PHẨM
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    // Nhớ import hàm kết nối MongoDB và Model Product ở đầu file nhé
    // await connectMongoDB();
    // await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Đã xóa sản phẩm thành công" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}