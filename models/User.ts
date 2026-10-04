import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({ 
  id: Number, 
  username: String, 
  email: String, 
  phone: String, 
  password: String, 
  role: String,
  cart: { type: Array, default: [] } // Thêm mảng này để lưu giỏ hàng
});

export default models.User || model('User', UserSchema);