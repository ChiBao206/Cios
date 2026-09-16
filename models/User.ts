import mongoose, { Schema, model, models } from 'mongoose';
const UserSchema = new Schema({ id: Number, username: String, email: String, phone: String, password: String, role: String });
export default models.User || model('User', UserSchema);