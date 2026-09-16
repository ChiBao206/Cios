import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import User from '../../../models/User';
import Order from '../../../models/Order';
import db from '../../../db.json'; // Đọc file dữ liệu gốc

export async function GET() {
  try {
    await connectDB();

    // 1. LỆNH HỦY DIỆT: Xóa sạch sành sanh dữ liệu bị lặp, bị rác trong MongoDB
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    // 2. LỆNH HỒI SINH: Chép mới lại toàn bộ từ file db.json chuẩn
    if (db.products) await Product.insertMany(db.products);
    if (db.categories) await Category.insertMany(db.categories);
    if (db.users) await User.insertMany(db.users);
    if (db.orders) await Order.insertMany(db.orders);

    return NextResponse.json({ message: "Làm sạch và Đồng bộ thành công 100%!" });
  } catch (error) {
    console.error("Lỗi Seed Database:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra khi đồng bộ" }, { status: 500 });
  }
}