import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/camera_bn_db';
const FALLBACK_LOCAL_URI = 'mongodb://127.0.0.1:27017/camera_bn_db';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('✅ Đã kết nối MongoDB thành công');
        return m;
      })
      .catch(async (err) => {
        console.warn('⚠️ Lỗi kết nối MongoDB chính (' + err.message + '). Đang kết nối Local MongoDB...');
        return mongoose.connect(FALLBACK_LOCAL_URI, opts).then((m) => {
          console.log('✅ Đã kết nối Local MongoDB (camera_bn_db)');
          return m;
        });
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
