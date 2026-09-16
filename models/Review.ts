import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  username: { type: String },
  customer_name: { type: String },
  rating: { type: Number, required: true },
  comment: { type: String },
  image: { type: String },
  status: { type: String, default: 'Đã duyệt' }
}, { 
  timestamps: true,
  strict: false 
});

// LỆNH PHÁ GIÁP: Ép Next.js phải vứt bỏ bộ nhớ tạm và nhận cấu trúc mới 100%
delete mongoose.models.Review;

export default mongoose.model('Review', ReviewSchema);