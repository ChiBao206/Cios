import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';
import db from '../../../db.json';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// LẤY DANH SÁCH SẢN PHẨM TỪ MONGODB (KÈM FALLBACK TỰ ĐỘNG KHÔNG LO MẤT DỮ LIỆU)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const category_id = url.searchParams.get("category_id");
    await connectDB();

    // 1. TRUY VẤN NHANH 1 SẢN PHẨM CỤ THỂ (Tối ưu tải trang chi tiết siêu tốc)
    if (id) {
      let product: any = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id).lean();
      }
      if (!product) {
        product = await Product.findOne({ id: isNaN(Number(id)) ? id : Number(id) }).lean();
      }
      if (!product) {
        product = await Product.findOne({ id: String(id) }).lean();
      }

      if (product) {
        // Luôn đồng bộ chuẩn xác bộ ảnh đa góc từ db.json
        const matchedDb = db.products.find((p: any) => 
          String(p.id) === String(product.id) || 
          String(p.name).trim().toLowerCase() === String(product.name).trim().toLowerCase()
        );
        if (matchedDb && matchedDb.images && matchedDb.images.length > 0) {
          product.images = matchedDb.images;
        }
        return NextResponse.json(product, {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
        });
      }

      const fallback = db.products.find((p: any) => String(p.id) === id || String(p._id) === id);
      return NextResponse.json(fallback || null);
    }

    // 2. NẾU LỌC THEO CATEGORY (cho related products)
    if (category_id) {
      let catProds = await Product.find({ category_id: String(category_id) }).limit(8).lean();
      if (!catProds || catProds.length === 0) {
        catProds = db.products.filter((p: any) => String(p.category_id) === String(category_id)).slice(0, 8);
      }
      const enrichedCatProds = catProds.map((p: any) => {
        const matched = db.products.find((dp: any) => 
          String(dp.id) === String(p.id) || 
          String(dp.name).trim().toLowerCase() === String(p.name).trim().toLowerCase()
        );
        if (matched && matched.images && matched.images.length > 0) {
          return { ...p, images: matched.images };
        }
        return p;
      });
      return NextResponse.json(enrichedCatProds);
    }

    // 3. DANH SÁCH TOÀN BỘ SẢN PHẨM
    let products = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    // Nếu MongoDB kết nối được nhưng chưa có sản phẩm, nạp tự động từ db.json
    if (!products || products.length === 0) {
      if (db.products && db.products.length > 0) {
        try {
          await Product.insertMany(db.products);
          products = await Product.find({}).sort({ createdAt: -1 }).lean();
        } catch (e) {
          return NextResponse.json(db.products);
        }
      }
    }
    
    const finalProducts = (products && products.length > 0 ? products : db.products).map((p: any) => {
      const matched = db.products.find((dp: any) => 
        String(dp.id) === String(p.id) || 
        String(dp.name).trim().toLowerCase() === String(p.name).trim().toLowerCase()
      );
      if (matched && matched.images && matched.images.length > 0) {
        return { ...p, images: matched.images };
      }
      return p;
    });

    return NextResponse.json(finalProducts);
  } catch (error) {
    console.error("Lỗi kết nối MongoDB, chuyển sang nạp dữ liệu từ db.json dự phòng:", error);
    // Luôn trả về dữ liệu từ db.json dự phòng để website không bao giờ bị mất sản phẩm
    return NextResponse.json(db.products || []);
  }
}

// THÊM SẢN PHẨM MỚI (Dùng cho nút Thêm Mới)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newProduct = await Product.create(body);
    return NextResponse.json({ message: "Đã thêm sản phẩm", product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi thêm sản phẩm" }, { status: 500 });
  }
}

// CẬP NHẬT SẢN PHẨM (Dùng cho nút Sửa & trừ tồn kho khi mua hàng)
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const body = await request.json();

    if (!id) return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });

    await connectDB();

    let query: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      const orConditions: any[] = [
        { id: id },
        { id: isNaN(Number(id)) ? id : Number(id) },
        { id: String(id) }
      ];
      // Nếu có trong db.json thì tìm thêm theo tên sản phẩm để đảm bảo 100% khớp MongoDB
      const matchedDb = db.products?.find((p: any) => String(p.id) === String(id));
      if (matchedDb && matchedDb.name) {
        orConditions.push({ name: matchedDb.name });
      }
      query = { $or: orConditions };
    }

    let updatedProduct = await Product.findOneAndUpdate(query, { $set: body }, { returnDocument: 'after' });

    // Fallback tìm lại theo tên nếu query ban đầu không khớp
    if (!updatedProduct && !mongoose.Types.ObjectId.isValid(id)) {
      const matchedDb = db.products?.find((p: any) => String(p.id) === String(id));
      if (matchedDb && matchedDb.name) {
        updatedProduct = await Product.findOneAndUpdate(
          { name: matchedDb.name }, 
          { $set: body }, 
          { returnDocument: 'after' }
        );
      }
    }

    return NextResponse.json({ message: "Đã cập nhật sản phẩm", product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    return NextResponse.json({ message: "Lỗi khi cập nhật sản phẩm", error: error?.message }, { status: 500 });
  }
}

// XÓA SẢN PHẨM KHỎI MONGODB (Hỗ trợ cả ObjectId và id số)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    await connectDB();

    let query: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = {
        $or: [
          { id: id },
          { id: isNaN(Number(id)) ? id : Number(id) }
        ]
      };
    }

    await Product.findOneAndDelete(query);

    return NextResponse.json({ message: "Đã xóa sản phẩm thành công" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}