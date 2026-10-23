import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb'; 
import User from '../../../models/User'; 

export const dynamic = 'force-dynamic';

// HÀM LẤY DANH SÁCH YÊU THÍCH TỪ MONGODB
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ favorites: [] }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
      });
    }

    const user = await User.findOne({ username }).lean();
    return NextResponse.json({ favorites: user?.favorites || [] }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách yêu thích:", error);
    return NextResponse.json({ favorites: [] });
  }
}

// HÀM LƯU DANH SÁCH YÊU THÍCH LÊN MONGODB
export async function POST(request: Request) {
  try {
    await connectDB();
    const { username, favorites } = await request.json();
    
    if (!username) {
      return NextResponse.json({ success: false, message: 'Thiếu username' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { username: username }, 
      { $set: { favorites: favorites || [] } },
      { returnDocument: 'after', upsert: false }
    );

    if (user) {
      return NextResponse.json({ success: true, message: 'Đã đồng bộ yêu thích thành công!' });
    }

    return NextResponse.json({ success: false, message: 'Không tìm thấy user' });
  } catch (error) {
    console.error("Lỗi lưu danh sách yêu thích:", error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

