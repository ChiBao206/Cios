import mongoose, { Schema, model, models } from 'mongoose';

const SupportSchema = new Schema({
  customer: String,
  phone: String,
  issue: String,
  status: { type: String, default: 'Chưa trả lời' },
  admin_reply: String // BẮT BUỘC PHẢI CÓ DÒNG NÀY THÌ TIN NHẮN MỚI LƯU ĐƯỢC
}, { timestamps: true, strict: false });

export default models.Support || model('Support', SupportSchema);