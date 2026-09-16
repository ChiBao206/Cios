import mongoose, { Schema, model, models } from 'mongoose';
const CategorySchema = new Schema({ id: Number, name: String });
export default models.Category || model('Category', CategorySchema);