import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Order from '../../../models/Order';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const data = await Order.find({}).sort({ createdAt: -1 }); // Lấy đơn mới nhất lên đầu
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi kết nối DB" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    console.log("👉 DỮ LIỆU ĐANG GỬI LÊN MONGODB:", body); // In ra terminal để theo dõi
    
    // Ép kiểu chắc chắn user_id là chuỗi (đề phòng lỗi vặt)
    if (body.user_id) {
      body.user_id = String(body.user_id);
    }

    const newData = await Order.create(body);
    return NextResponse.json(newData, { status: 201 });
    
  } catch (error: any) {
    // Nếu có lỗi, nó sẽ in đỏ chót nguyên nhân chính xác ra terminal VS Code
    console.error("❌ LỖI LƯU ĐƠN HÀNG MONGODB:", error.message); 
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ======================================================================
// THÊM HÀM PUT VÀO ĐÂY ĐỂ XỬ LÝ LỆNH CẬP NHẬT TRẠNG THÁI (HỦY ĐƠN HÀNG)
// ======================================================================
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { orderId, newStatus } = await req.json();
    
    // Tìm đơn hàng theo ID và cập nhật trạng thái mới
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { status: newStatus }, 
      { new: true }
    );
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("❌ LỖI CẬP NHẬT TRẠNG THÁI MONGODB:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}