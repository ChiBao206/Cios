import mongoose, { Schema, model, models } from 'mongoose';

const VoucherSchema = new Schema({
  code: { type: String, required: true, unique: true }, // Tên mã (VD: FREESHIP, SALE50)
  discountPercent: { type: Number, required: true }, // Giảm bao nhiêu %
  minOrderValue: { type: Number, default: 0 }, // Đơn tối thiểu để được áp mã
  maxUsage: { type: Number, default: 100 }, // Tổng số lần được nhập mã này
  usedCount: { type: Number, default: 0 }, // Số người đã xài
  isActive: { type: Boolean, default: true }, // Trạng thái Bật/Tắt
  expireDate: { type: Date, required: true } // Ngày hết hạn
}, { timestamps: true });

export default models.Voucher || model('Voucher', VoucherSchema);