import mongoose, { Schema, model, models } from 'mongoose';

const SettingSchema = new Schema({
  saleDays: { type: String, default: '1, 15' },
  saleDiscount: { type: Number, default: 5 },
  feeHCM: { type: Number, default: 30000 },
  feeSouth: { type: Number, default: 50000 },
  feeOther: { type: Number, default: 80000 }
}, { timestamps: true });

export default models.Setting || model('Setting', SettingSchema);