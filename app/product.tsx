import db from '../db.json';

// Lấy ID từ thanh địa chỉ URL
export default function ProductDetail({ params }: { params: { id: string } }) {
  // Tìm sản phẩm trong db.json có ID khớp với ID trên URL
  const product = db.products.find((p) => p.id.toString() === params.id);

  if (!product) {
    return <h2>Không tìm thấy sản phẩm!</h2>;
  }

  return (
    <main>
      {/* 1. DÁN HTML HEADER VÀO ĐÂY */}

      <div className="container">
        {/* 2. DÁN CẤU TRÚC HTML TRANG CHI TIẾT CỦA BẠN VÀO ĐÂY */}
        <div className="product-detail-layout">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-info">
            <h1>{product.name}</h1>
            <p>Giá: {Number(product.price).toLocaleString('vi-VN')} VNĐ</p>
            <p>Mô tả: {product.description}</p>
            <button className="btn-add-cart">Thêm vào giỏ hàng</button>
          </div>
        </div>
      </div>

      {/* 3. DÁN HTML FOOTER VÀO ĐÂY */}
    </main>
  );
}