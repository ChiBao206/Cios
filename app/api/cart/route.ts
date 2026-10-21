import { NextResponse } from 'next/server';
// Dùng ../../../ để lùi ra ngoài 3 thư mục, tìm đến lib và models
import connectDB from '../../../lib/mongodb'; 
import User from '../../../models/User'; 

// HÀM LẤY GIỎ HÀNG TỪ MONGODB
export async function GET(request: Request) {
  try {
    await connectDB(); // Kết nối đến MongoDB Cloud
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Tìm user trong database
    const user = await User.findOne({ username });
    
    return NextResponse.json({ cart: user?.cart || [] });
  } catch (error) {
    console.error("Lỗi lấy giỏ hàng:", error);
    return NextResponse.json({ cart: [] });
  }
}

// HÀM LƯU GIỎ HÀNG LÊN MONGODB
export async function POST(request: Request) {
  try {
    await connectDB(); // Kết nối đến MongoDB Cloud
    const { username, cart } = await request.json();
    
    // Tìm user và cập nhật mảng cart mới nhất
    const user = await User.findOneAndUpdate(
      { username: username }, 
      { cart: cart },
      { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (user) {
      return NextResponse.json({ success: true, message: 'Đã đồng bộ giỏ hàng!' });
    }

    return NextResponse.json({ success: false, message: 'Không tìm thấy user' });
  } catch (error) {
    console.error("Lỗi lưu giỏ hàng:", error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}