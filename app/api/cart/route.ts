import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb'; 
import User from '../../../models/User'; 

export const dynamic = 'force-dynamic';

// HÀM LẤY GIỎ HÀNG TỪ MONGODB
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ cart: [] }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
      });
    }

    const user = await User.findOne({ username }).lean();
    return NextResponse.json({ cart: user?.cart || [] }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
    });
  } catch (error) {
    console.error("Lỗi lấy giỏ hàng:", error);
    return NextResponse.json({ cart: [] });
  }
}

// HÀM LƯU GIỎ HÀNG LÊN MONGODB
export async function POST(request: Request) {
  try {
    await connectDB();
    const { username, cart } = await request.json();
    
    if (!username) {
      return NextResponse.json({ success: false, message: 'Thiếu username' }, { status: 400 });
    }

    // Tìm user và cập nhật mảng cart mới nhất
    const user = await User.findOneAndUpdate(
      { username: username }, 
      { $set: { cart: cart || [] } },
      { returnDocument: 'after', upsert: false }
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
