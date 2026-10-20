import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Setting from '../../../models/Setting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    // Hệ thống chỉ cần duy nhất 1 dòng cấu hình, nên ta dùng findOne()
<<<<<<< HEAD
    let settings = await Setting.findOne({}).lean();
=======
    let settings = await Setting.findOne({});
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
    
    // Nếu lần đầu tiên chạy web chưa có data, tự động tạo mặc định
    if (!settings) {
      settings = await Setting.create({
        saleDays: '1, 11, 15', // Bạn có thể để 11 để test
        saleDiscount: 5,
        feeHCM: 30000,
        feeSouth: 50000,
        feeOther: 80000
      });
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
<<<<<<< HEAD
    console.warn("Lỗi kết nối CSDL cấu hình, sử dụng dữ liệu dự phòng:", error.message);
    return NextResponse.json({
      saleDays: '1, 11, 15',
      saleDiscount: 5,
      feeHCM: 30000,
      feeSouth: 50000,
      feeOther: 80000
    });
=======
    console.error("❌ LỖI LẤY CẤU HÌNH:", error.message);
    return NextResponse.json({ message: "Lỗi kết nối CSDL" }, { status: 500 });
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Lệnh này cực hay: Tìm cấu hình đầu tiên để cập nhật. Nếu chưa có thì tự động tạo mới (upsert: true)
    const updatedSettings = await Setting.findOneAndUpdate(
      {}, 
      body, 
      { new: true, upsert: true }
    );
    
    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error: any) {
    console.error("❌ LỖI LƯU CẤU HÌNH:", error.message);
    return NextResponse.json({ message: "Lỗi kết nối CSDL" }, { status: 500 });
  }
}