import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: '0' },
  // BẮT BUỘC PHẢI THÊM 2 DÒNG NÀY ĐỂ MONGODB NHẬN ẢNH BẠN NHÉ:
  avatar: { type: String, default: '' },
  image: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;