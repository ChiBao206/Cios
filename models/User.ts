import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: '0' },
  avatar: { type: String, default: '' },
  image: { type: String, default: '' },
  cart: { type: [mongoose.Schema.Types.Mixed], default: [] },
  favorites: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true, strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
