import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({ 
  id: Number, 
  user_id: String, 
  total_money: Number, 
  status: { type: String, default: "Chờ xử lý" }, 
  customer_name: String,
  customer_phone: String,
  shipping_address: String,
  items: [Schema.Types.Mixed] // Dùng Mixed để ép MongoDB phải nhận hình ảnh
}, { timestamps: true, strict: false });

export default models.Order || model('Order', OrderSchema);