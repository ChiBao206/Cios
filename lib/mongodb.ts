import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Vui lòng định nghĩa MONGODB_URI trong file .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Nếu đã có kết nối cũ đang chạy thì dùng lại ngay lập tức (Rất nhanh)
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // BỔ SUNG: Cấu hình ép xung cho môi trường Serverless (Vercel)
    const opts = {
      bufferCommands: false, // Tránh treo ứng dụng nếu mất kết nối
      maxPoolSize: 10,       // Giới hạn 10 luồng kết nối để không làm nghẽn MongoDB miễn phí
      serverSelectionTimeoutMS: 5000, // Chỉ đợi tối đa 5 giây, nếu mạng lag thì báo lỗi ngay thay vì bắt web tải vô tận
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Đã kết nối MongoDB (Đã tối ưu Serverless)');
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Nếu kết nối xịt, reset lại để lần sau khách vào thì thử lại
    throw e;
  }

  return cached.conn;
}

export default connectDB;