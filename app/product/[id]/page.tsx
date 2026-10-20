"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import NotifBadge from '@/app/components/NotifBadge';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import FloatingActions from '@/app/components/FloatingActions';
import db from '@/db.json';

// Helper xác định chính xác danh mục và loại sản phẩm
function getProductType(product: any): 'switch' | 'router' | 'dvr' | 'camera_outdoor' | 'camera_indoor' | 'camera' | 'accessory' {
  if (!product) return 'camera';
  const catId = String(product.category_id || '');
  const catName = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();

  // 1. Switch mạng
  if (catId === '18' || catName.includes('switch') || name.includes('switch') || name.includes('chia mạng')) {
    return 'switch';
  }
  // 2. Router / Wifi
  if (catId === '17' || catName.includes('router') || name.includes('router') || (name.includes('wifi') && (name.includes('băng tần') || name.includes('ax') || name.includes('ac1200') || name.includes('totolink') || name.includes('archer') || name.includes('phát sóng') || name.includes('kích sóng')))) {
    return 'router';
  }
  // 3. Đầu ghi hình (DVR / NVR / XVR)
  if (catId === '19' || catName.includes('đầu ghi') || name.includes('đầu ghi') || name.includes('nvr') || name.includes('dvr') || name.includes('xvr')) {
    return 'dvr';
  }
  // 4. Phụ kiện & Lưu trữ
  if (name.includes('thẻ nhớ') || name.includes('ổ cứng') || name.includes('hdd') || name.includes('nguồn') || name.includes('jack') || name.includes('dây cáp') || name.includes('chân đế')) {
    return 'accessory';
  }
  // 5. Camera ngoài trời
  if (catId === '14' || name.includes('ngoài trời') || name.includes('outdoor') || name.includes('bullet') || name.includes('solar') || name.includes('năng lượng mặt trời') || name.includes('outpro') || name.includes('c8c') || name.includes('c3tn') || name.includes('s42fp')) {
    return 'camera_outdoor';
  }
  // 6. Camera trong nhà
  if (catId === '13' || name.includes('ranger') || name.includes('c6n') || name.includes('indoor') || name.includes('trong nhà') || name.includes('a22ep') || name.includes('c200') || name.includes('xoay 360')) {
    return 'camera_indoor';
  }
  return 'camera';
}

// Helper trích xuất thương hiệu sản phẩm chính xác
function getProductBrand(product: any): string {
  if (!product?.name) return 'Chính Hãng Phân Phối';
  const name = String(product.name).toUpperCase();
  if (name.includes('TP-LINK') || name.includes('TPLINK')) return 'TP-Link';
  if (name.includes('HIKVISION')) return 'Hikvision';
  if (name.includes('DAHUA')) return 'Dahua Technology';
  if (name.includes('EZVIZ')) return 'Ezviz';
  if (name.includes('IMOU')) return 'Imou';
  if (name.includes('KBVISION') || name.includes('KBONE')) return 'KBVision';
  if (name.includes('VANTECH')) return 'Vantech';
  if (name.includes('TENDA')) return 'Tenda';
  if (name.includes('CISCO')) return 'Cisco Systems';
  if (name.includes('TOTOLINK')) return 'Totolink';
  if (name.includes('XIAOMI')) return 'Xiaomi';
  if (name.includes('VIETMAP')) return 'Vietmap';
  if (name.includes('PANASONIC')) return 'Panasonic';
  if (name.includes('HUVIRON')) return 'Huviron';
  if (name.includes('VIETTEL')) return 'Viettel';
  if (name.includes('FPT')) return 'FPT Telecom';
  if (name.includes('YOOSEE')) return 'Yoosee';
  if (name.includes('GOOGLE')) return 'Google Nest';
  if (name.includes('LOGITECH')) return 'Logitech';
  if (name.includes('EUFY')) return 'Anker Eufy';
  if (name.includes('RING')) return 'Amazon Ring';
  if (name.includes('ARLO')) return 'Arlo Technologies';
  if (name.includes('WYZE')) return 'Wyze Labs';
  if (name.includes('BLINK')) return 'Amazon Blink';
  if (name.includes('WESTERN DIGITAL') || name.includes('WD')) return 'Western Digital';
  if (name.includes('SEAGATE')) return 'Seagate';
  if (name.includes('SANDISK')) return 'SanDisk';
  return 'Chính Hãng Phân Phối';
}

// Helper sinh 4 điểm nổi bật vượt trội phù hợp từng danh mục
function getProductHighlights(product: any, type: string) {
  const name = String(product?.name || '').toLowerCase();

  if (type === 'switch') {
    const isPoE = name.includes('poe');
    return [
      {
        icon: 'fas fa-network-wired',
        title: isPoE ? 'Cấp Nguồn PoE Tiện Lợi' : 'Cổng Mạng Tốc Độ Cao',
        desc: isPoE 
          ? 'Truyền tải dữ liệu và cấp nguồn trực tiếp cho camera IP chỉ qua 1 sợi cáp mạng duy nhất.'
          : 'Tự động nhận diện và chuyển tiếp dữ liệu tốc độ cao (10/100/1000Mbps), không lo giật lag hay nghẽn mạng.'
      },
      {
        icon: 'fas fa-bolt',
        title: 'Cắm Là Chạy (Plug & Play)',
        desc: 'Không cần cấu hình hay cài đặt phức tạp, chỉ cần cắm dây mạng là thiết bị tự động nhận diện và hoạt động ngay.'
      },
      {
        icon: 'fas fa-leaf',
        title: 'Tiết Kiệm Điện (Green Tech)',
        desc: 'Công nghệ tiết kiệm năng lượng thông minh, tự động điều chỉnh công suất theo chiều dài cáp kết nối.'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Vỏ Bền Bỉ, Tản Nhiệt Tốt',
        desc: 'Thiết kế thông minh không quạt êm ái hoặc vỏ hợp kim cao cấp, vận hành 24/7 mát mẻ và ổn định.'
      }
    ];
  }

  if (type === 'router') {
    const isWifi6 = name.includes('wifi 6') || name.includes('ax');
    return [
      {
        icon: 'fas fa-wifi',
        title: isWifi6 ? 'Wi-Fi 6 Siêu Tốc Độ' : 'Băng Tần Kép Sóng Khỏe',
        desc: isWifi6 
          ? 'Chuẩn Wi-Fi 6 thế hệ mới mang lại băng thông siêu nhanh, độ trễ cực thấp cho trải nghiệm xem camera mượt mà.'
          : 'Phát sóng song song 2 băng tần 2.4GHz & 5GHz, loại bỏ nhiễu sóng và tối ưu đường truyền internet.'
      },
      {
        icon: 'fas fa-broadcast-tower',
        title: 'Vùng Phủ Sóng Xuyên Tường',
        desc: 'Hệ thống ăng-ten ngoài độ lợi cao giúp phủ sóng xuyên tường mạnh mẽ, bắt sóng ổn định khắp mọi phòng.'
      },
      {
        icon: 'fas fa-users',
        title: 'Chịu Tải Đa Thiết Bị',
        desc: 'Công nghệ tiên tiến hỗ trợ kết nối đồng thời hàng chục điện thoại, laptop, camera an ninh mà không nghẽn mạng.'
      },
      {
        icon: 'fas fa-lock',
        title: 'Bảo Mật WPA3 Tiên Tiến',
        desc: 'Chuẩn bảo mật mã hóa thế hệ mới nhất bảo vệ toàn diện mạng nội bộ gia đình bạn trước các nguy cơ tấn công.'
      }
    ];
  }

  if (type === 'dvr') {
    return [
      {
        icon: 'fas fa-tv',
        title: 'Xuất Hình 4K / Full HD',
        desc: 'Cổng xuất hình HDMI 4K và VGA đồng thời, hiển thị đa kênh sắc nét rõ ràng trên màn hình lớn.'
      },
      {
        icon: 'fas fa-hdd',
        title: 'Chuẩn Nén H.265+ Tiên Tiến',
        desc: 'Tiết kiệm đến 80% dung lượng lưu trữ trên ổ cứng và giảm băng thông truyền tải qua internet.'
      },
      {
        icon: 'fas fa-mobile-alt',
        title: 'Xem Từ Xa Miễn Phí Trọn Đời',
        desc: 'Dễ dàng cài đặt và theo dõi camera trực tiếp cũng như xem lại lịch sử trên điện thoại, máy tính bảng.'
      },
      {
        icon: 'fas fa-database',
        title: 'Hỗ Trợ Ổ Cứng Lên Đến 10TB',
        desc: 'Khả năng gắn ổ cứng dung lượng cực lớn chuyên dụng an ninh, ghi hình ổn định liên tục 24/7.'
      }
    ];
  }

  if (type === 'camera_outdoor') {
    return [
      {
        icon: 'fas fa-tint',
        title: 'Kháng Nước & Bụi Chuẩn IP67',
        desc: 'Vỏ chuyên dụng kín khít hoàn hảo, chống chịu tốt dưới mưa bão lớn, nắng gắt và bụi bẩn ngoài trời.'
      },
      {
        icon: 'fas fa-moon',
        title: 'Ghi Hình Ban Đêm Có Màu',
        desc: 'Trang bị đèn LED trợ sáng và hồng ngoại thông minh, hình ảnh ban đêm luôn rõ ràng và có màu sắc sinh động.'
      },
      {
        icon: 'fas fa-bell',
        title: 'Cảnh Báo Chuyển Động AI',
        desc: 'Phát hiện chính xác người và phương tiện xâm nhập, tự động kích hoạt còi hú và đèn chớp răn đe kẻ xấu.'
      },
      {
        icon: 'fas fa-video',
        title: 'Độ Phân Giải Sắc Nét 2K/4MP',
        desc: 'Cảm biến chất lượng cao giúp bạn thu phóng hình ảnh vẫn nhìn rõ mặt đối tượng và biển số xe từ xa.'
      }
    ];
  }

  if (type === 'camera_indoor') {
    return [
      {
        icon: 'fas fa-sync-alt',
        title: 'Xoay Quét 360° Toàn Cảnh',
        desc: 'Góc quay ngang 355° và dọc 90°, kiểm soát toàn diện không gian phòng khách, phòng ngủ không có điểm mù.'
      },
      {
        icon: 'fas fa-microphone-alt',
        title: 'Đàm Thoại 2 Chiều To Rõ',
        desc: 'Tích hợp mic và loa lọc tiếng ồn, trò chuyện trực tiếp với người thân và con cái dễ dàng mọi lúc.'
      },
      {
        icon: 'fas fa-user-shield',
        title: 'Nhận Diện Người & Tiếng Khóc',
        desc: 'Thuật toán AI tự động phát hiện chuyển động bất thường hoặc tiếng trẻ em khóc và thông báo ngay về điện thoại.'
      },
      {
        icon: 'fas fa-eye-slash',
        title: 'Bảo Vệ Quyền Riêng Tư',
        desc: 'Chế độ ngủ riêng tư một chạm trên ứng dụng cho phép camera ẩn ống kính khi bạn đang ở nhà.'
      }
    ];
  }

  if (type === 'accessory') {
    return [
      {
        icon: 'fas fa-tachometer-alt',
        title: 'Tốc Độ Đọc/Ghi Siêu Tốc',
        desc: 'Được thiết kế chuyên biệt cho việc ghi hình video độ nét cao liên tục, không bị đứt quãng hay mất khung hình.'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Hoạt Động Bền Bỉ 24/7',
        desc: 'Chịu được nhiệt độ vận hành cao và chu kỳ ghi xóa liên tục trong thời gian dài nhiều năm.'
      },
      {
        icon: 'fas fa-check-circle',
        title: 'Tương Thích Mọi Thiết Bị',
        desc: 'Tương thích 100% với các thương hiệu camera, đầu ghi và thiết bị số phổ biến trên thị trường.'
      },
      {
        icon: 'fas fa-bolt',
        title: 'Chống Sốc Điện & Bền Bỉ',
        desc: 'Bảo vệ mạch điện an toàn, chống sốc và chống tĩnh điện bảo toàn tối đa dữ liệu quan trọng.'
      }
    ];
  }

  // Camera chung
  return [
    {
      icon: 'fas fa-video',
      title: 'Độ Phân Giải Sắc Nét',
      desc: 'Cảm biến hình ảnh cao cấp đem lại khung hình chân thực, bắt trọn từng chi tiết biển số xe và gương mặt.'
    },
    {
      icon: 'fas fa-moon',
      title: 'Hồng Ngoại Ban Đêm Smart IR',
      desc: 'Tự động điều chỉnh cường độ sáng hồng ngoại theo khoảng cách, không bị lóa trắng khi đối tượng lại gần.'
    },
    {
      icon: 'fas fa-cloud-download-alt',
      title: 'Chuẩn Nén H.265+ Tiên Tiến',
      desc: 'Tiết kiệm đến 50% dung lượng thẻ nhớ và băng thông mạng so với chuẩn H.264 truyền thống.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Vận Hành Ổn Định 24/7',
      desc: 'Linh kiện đạt tiêu chuẩn an ninh giám sát cao cấp, vận hành bền bỉ và chính xác suốt ngày đêm.'
    }
  ];
}

// Helper sinh Bảng Thông Số Kỹ Thuật (Specs Table) chính xác theo thiết bị
function getProductSpecs(product: any, type: string, brand: string) {
  const name = String(product?.name || '').toLowerCase();
  const sku = String(product?._id || product?.id || '').toUpperCase();

  if (type === 'switch') {
    const isPoE = name.includes('poe');
    const portCount = name.includes('8') ? '8 Cổng' : (name.includes('16') ? '16 Cổng' : (name.includes('24') ? '24 Cổng' : '5 Cổng'));
    const isGigabit = name.includes('1000') || name.includes('gigabit') || name.includes('ls1005g') || name.includes('cbs110');

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Số lượng cổng kết nối', value: `${portCount} RJ45 (Hỗ trợ Auto-MDI/MDIX)`, highlight: false },
      { label: 'Tốc độ truyền dữ liệu', value: isGigabit ? '10/100/1000 Mbps (Gigabit Auto-Negotiation)' : '10/100 Mbps Tự thích ứng', highlight: false },
      { label: 'Chuẩn mạng tương thích', value: 'IEEE 802.3, IEEE 802.3u, IEEE 802.3x', highlight: false },
      { label: 'Tính năng đặc biệt', value: isPoE ? 'Cấp nguồn PoE chuẩn IEEE 802.3af/at (tối đa 30W/cổng)' : 'Công nghệ Green Ethernet tiết kiệm điện đến 70%', highlight: false },
      { label: 'Chất liệu vỏ máy', value: name.includes('vỏ thép') || name.includes('cisco') ? 'Vỏ thép tản nhiệt công nghiệp cao cấp' : 'Vỏ nhựa ABS chống cháy cao cấp', highlight: false },
      { label: 'Nguồn điện cấp', value: isPoE ? '48V - 54V DC chuyên dụng cho PoE' : 'DC 5V / 9V / 12V chính hãng kèm theo', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'router') {
    const isWifi6 = name.includes('wifi 6') || name.includes('ax');
    const speed = isWifi6 ? 'AX3000 (2402 Mbps trên 5GHz + 574 Mbps trên 2.4GHz)' : 'AC1200 (867 Mbps trên 5GHz + 300 Mbps trên 2.4GHz)';

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Chuẩn Wi-Fi hỗ trợ', value: isWifi6 ? 'Wi-Fi 6 (802.11ax/ac/n/a 5GHz & 802.11ax/n/b/g 2.4GHz)' : 'Wi-Fi 5 (802.11ac/n/a 5GHz & 802.11b/g/n 2.4GHz)', highlight: false },
      { label: 'Tốc độ không dây tối đa', value: speed, highlight: false },
      { label: 'Số lượng ăng-ten', value: '4 Ăng-ten ngoài đa hướng 5dBi độ lợi cao', highlight: false },
      { label: 'Cổng kết nối mạng', value: '1 Cổng WAN Gigabit + 3/4 Cổng LAN Gigabit RJ45', highlight: false },
      { label: 'Chuẩn bảo mật', value: 'WPA3-Personal, WPA2-PSK, Tường lửa SPI bảo vệ', highlight: false },
      { label: 'Chế độ hoạt động', value: 'Router Wi-Fi, Điểm truy cập (Access Point), Bộ mở rộng sóng (Repeater)', highlight: false },
      { label: 'Nguồn điện cấp', value: 'Adapter 12V DC - 1A/1.5A chính hãng', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'dvr') {
    const channelCount = name.includes('8') ? '8 Kênh' : (name.includes('16') ? '16 Kênh' : '4 Kênh');

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Số kênh ghi hình', value: `${channelCount} Video đầu vào (Hỗ trợ camera IP & Analog/HDTVI/AHD)`, highlight: false },
      { label: 'Chuẩn nén video', value: 'H.265 Pro+ / H.265 / H.264+ (Tiết kiệm 80% dung lượng)', highlight: false },
      { label: 'Cổng xuất hình ảnh', value: '1 HDMI (Xuất hình 4K/Full HD) + 1 Cổng VGA đồng thời', highlight: false },
      { label: 'Hỗ trợ ổ cứng (HDD)', value: '1 Cổng SATA hỗ trợ dung lượng lên tới 6TB - 10TB', highlight: false },
      { label: 'Cổng mạng LAN', value: '1 Cổng RJ45 10/100 Mbps tự thích ứng', highlight: false },
      { label: 'Quản trị từ xa', value: 'Ứng dụng di động (iOS / Android) & Phần mềm máy tính miễn phí', highlight: false },
      { label: 'Nguồn điện cấp', value: '12V DC - 1.5A / 2A đi kèm máy', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'camera_outdoor') {
    const resolution = name.includes('4mp') ? '4.0 Megapixel (2K QHD 2560x1440)' : (name.includes('3mp') ? '3.0 Megapixel (2K 2304x1296)' : '2.0 Megapixel (Full HD 1080P)');

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Độ phân giải cảm biến', value: resolution, highlight: false },
      { label: 'Góc nhìn & Ống kính', value: 'Ống kính 2.8mm / 3.6mm - Góc mở rộng 108°', highlight: false },
      { label: 'Tầm xa quan sát đêm', value: '30 Mét (Hồng ngoại Smart IR kết hợp LED trợ sáng có màu)', highlight: false },
      { label: 'Chuẩn kháng nước & bụi', value: 'IP67 / IP66 (Hoạt động hoàn hảo dưới mưa bão nhiệt đới)', highlight: false },
      { label: 'Tính năng AI thông minh', value: 'Nhận diện người AI, Báo động còi hú & Đèn chớp, Đàm thoại 2 chiều', highlight: false },
      { label: 'Lưu trữ dữ liệu', value: 'Hỗ trợ thẻ nhớ MicroSD tối đa 256GB hoặc Cloud lưu trữ', highlight: false },
      { label: 'Nguồn điện cấp', value: '12V DC - 1A / Hỗ trợ PoE (tùy phiên bản)', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'camera_indoor') {
    const resolution = name.includes('2k') || name.includes('3mp') || name.includes('4mp') ? '2K Super HD / 3MP' : 'Full HD 1080P (1920x1080)';

    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Khả năng xoay quét', value: 'Xoay ngang 355°, Xoay dọc 90° (Bao quát 360° không góc chết)', highlight: false },
      { label: 'Độ phân giải hình ảnh', value: resolution, highlight: false },
      { label: 'Tầm nhìn ban đêm', value: 'Hồng ngoại Smart IR 10 - 15 mét (Rõ nét không chói lóa)', highlight: false },
      { label: 'Âm thanh đàm thoại', value: 'Tích hợp Micro & Loa khử tiếng vang đàm thoại 2 chiều', highlight: false },
      { label: 'Tính năng thông minh', value: 'Theo dõi chuyển động Smart Tracking, Nhận diện tiếng khóc trẻ em', highlight: false },
      { label: 'Lưu trữ dữ liệu', value: 'Khe cắm thẻ nhớ MicroSD lên đến 256GB / Cloud bảo mật', highlight: false },
      { label: 'Nguồn điện cấp', value: 'DC 5V - 1A (Cổng Micro-USB / Type-C)', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  if (type === 'accessory') {
    return [
      { label: 'Thương hiệu', value: brand, highlight: true },
      { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
      { label: 'Phân loại thiết bị', value: 'Phụ kiện an ninh / Thiết bị lưu trữ chuyên dụng', highlight: false },
      { label: 'Đặc tính vận hành', value: 'Thiết kế chịu nhiệt, chống ẩm, hoạt động liên tục 24/7', highlight: false },
      { label: 'Khả năng tương thích', value: 'Tương thích 100% với hệ thống Camera, Router, Đầu ghi hình', highlight: false },
      { label: 'Chế độ bảo hành', value: '24 - 36 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
    ];
  }

  // Mặc định camera khác
  return [
    { label: 'Thương hiệu', value: brand, highlight: true },
    { label: 'Mã sản phẩm (SKU)', value: sku, highlight: false },
    { label: 'Độ phân giải hình ảnh', value: 'Full HD 1080P / 2K Ultra Clear', highlight: false },
    { label: 'Ống kính & Góc nhìn', value: '2.8mm - Góc quan sát rộng 108°', highlight: false },
    { label: 'Tầm quan sát hồng ngoại', value: '30 mét (Công nghệ Smart IR LED kép)', highlight: false },
    { label: 'Chuẩn bảo vệ thiết bị', value: 'IP67 (Chống nước và bụi hoàn toàn)', highlight: false },
    { label: 'Nguồn điện cấp', value: '12V DC / Hỗ trợ PoE chuẩn 802.3af', highlight: false },
    { label: 'Chế độ bảo hành', value: '24 tháng chính hãng (1 đổi 1 trong 30 ngày)', highlight: true, green: true }
  ];
}

// Helper sinh đoạn văn mô tả bổ sung chuẩn theo thiết bị
function getProductExtraDesc(product: any, type: string) {
  if (type === 'switch') {
    return 'Thiết bị chuyển mạch Switch mạng hiệu năng cao, cung cấp khả năng truyền tải dữ liệu ổn định và liền mạch cho hệ thống camera an ninh, máy tính văn phòng và thiết bị thông minh. Hỗ trợ tính năng cắm và chạy (Plug and Play) tiện lợi, tự động tương thích tốc độ và công nghệ Green Ethernet tiết kiệm năng lượng tối ưu.';
  }
  if (type === 'router') {
    return 'Bộ phát wifi router không dây tốc độ cao, tối ưu vùng phủ sóng mạnh mẽ xuyên qua các tầng lầu và vật cản. Hỗ trợ đa kết nối đồng thời với độ trễ siêu thấp, đảm bảo tín hiệu camera an ninh truyền về màn hình mượt mà không bị gián đoạn, đáp ứng tốt cho nhu cầu xem video 4K và làm việc trực tuyến.';
  }
  if (type === 'dvr') {
    return 'Đầu ghi hình kỹ thuật số chuyên dụng chuẩn giám sát an ninh 24/7, khả năng xử lý tín hiệu camera độ nét cao và quản lý tập trung nhiều kênh ghi hình. Tích hợp chuẩn nén tiên tiến tiết kiệm dung lượng lưu trữ, hỗ trợ xem trực tiếp và xem lại dữ liệu mượt mà trên điện thoại, máy tính bảng từ bất cứ đâu.';
  }
  if (type === 'camera_outdoor') {
    return 'Camera an ninh chuyên dụng lắp đặt ngoài trời với tiêu chuẩn bảo vệ chống bụi và nước nghiêm ngặt, vận hành ổn định trước nắng mưa và thời tiết khắc nghiệt. Tích hợp cảm biến quang học thế hệ mới cùng đèn hồng ngoại / trợ sáng ban đêm, đảm bảo an ninh tối đa cho ngôi nhà và khuôn viên của bạn.';
  }
  if (type === 'camera_indoor') {
    return 'Camera thông minh trong nhà sở hữu thiết kế trang nhã, công nghệ xoay quét góc nhìn toàn cảnh cùng tính năng đàm thoại hai chiều âm thanh trung thực. Thiết bị cho phép bạn theo dõi con nhỏ, người già hoặc quản lý cửa hàng mọi lúc mọi nơi thông qua ứng dụng trên điện thoại vô cùng dễ dàng.';
  }
  if (type === 'accessory') {
    return 'Phụ kiện cao cấp được thiết kế đồng bộ, đảm bảo tính tương thích và độ bền cao nhất cho hệ thống thiết bị an ninh, mang lại sự an tâm tuyệt đối trong quá trình sử dụng lâu dài.';
  }
  return 'Được trang bị vi xử lý xử lý hình ảnh thế hệ mới, thiết bị đem lại chất lượng ghi hình vượt trội trong mọi điều kiện ánh sáng. Vỏ ngoài gia công bằng vật liệu cao cấp đạt tiêu chuẩn quốc tế, phù hợp lắp đặt cho nhà ở, văn phòng, cửa hàng và xưởng sản xuất.';
}

// Helper sinh danh sách ưu đãi quà tặng phù hợp từng sản phẩm
function getProductGiftList(product: any, type: string) {
  if (type === 'switch') {
    return [
      'Miễn phí tư vấn giải pháp mạng & hỗ trợ sơ đồ kết nối camera',
      'Tặng kèm dây nhảy mạng đúc sẵn Cat6 cao cấp chống nhiễu',
      'Freeship toàn quốc cho đơn hàng từ 500.000đ',
      'Bảo hành chính hãng 24 tháng (1 đổi 1 trong 30 ngày)'
    ];
  }
  if (type === 'router') {
    return [
      'Miễn phí cài đặt cấu hình tên Wi-Fi & mật khẩu theo yêu cầu',
      'Tặng kèm dây cáp mạng RJ45 bấm sẵn đúc chất lượng cao',
      'Giao hàng hỏa tốc trong 2H tại nội thành',
      'Hỗ trợ kỹ thuật cấu hình từ xa 24/7 trọn đời thiết bị'
    ];
  }
  if (type === 'dvr') {
    return [
      'Tặng kèm chuột quang điều khiển + cáp nguồn & cáp SATA ổ cứng',
      'Miễn phí cấu hình cài đặt xem qua điện thoại trọn đời máy',
      'Freeship toàn quốc - Kiểm tra hàng trước khi thanh toán',
      'Bảo hành 24 tháng chính hãng (1 đổi 1 trong 30 ngày)'
    ];
  }
  if (type === 'accessory') {
    return [
      'Cam kết linh kiện chính hãng 100%, kiểm tra kỹ trước khi giao',
      'Freeship toàn quốc cho đơn hàng từ 500.000đ',
      'Bảo hành đổi mới 1-1 nhanh chóng nếu phát sinh lỗi',
      'Tư vấn kỹ thuật tương thích chuẩn xác cho mọi thiết bị'
    ];
  }
  return [
    'Miễn phí công tư vấn & khảo sát vị trí lắp đặt tận nơi',
    'Tặng kèm bộ nguồn adapter chính hãng + phụ kiện chân đế & ốc vít',
    'Freeship toàn quốc cho đơn hàng từ 500.000đ',
    'Hỗ trợ kỹ thuật cài đặt từ xa 24/7 trọn đời thiết bị'
  ];
}

// Helper lấy danh sách đầy đủ các ảnh góc nhìn cho toàn bộ sản phẩm chuẩn TikTok Shop & Shopee
function getProductImages(product: any, type: string): string[] {
  const name = String(product?.name || '').toLowerCase();
  const id = String(product?._id || product?.id || '');
  const catId = String(product?.category_id || '');

  // 1. ƯU TIÊN 1: Tìm cấu hình ảnh chuẩn xác 100% từ db.json
  const matchedDb = (db.products || []).find((p: any) => 
    String(p.id) === id || 
    String((p as any)._id) === id || 
    (product?.name && String(p.name).trim().toLowerCase() === String(product.name).trim().toLowerCase())
  );
  if (matchedDb && matchedDb.images && Array.isArray(matchedDb.images) && matchedDb.images.length > 1) {
    return matchedDb.images;
  }

  // 2. ƯU TIÊN 2: Mảng images từ sản phẩm (loại trừ trường hợp dữ liệu cũ bị dính ảnh Imou sai)
  if (product?.images && Array.isArray(product.images) && product.images.length > 1) {
    const isImouModel = name.includes('imou') || name.includes('ranger') || id === '92';
    const hasImouLeak = product.images.some((img: string) => img.includes('p_92_angle_') || img.includes('imou_ranger2'));
    if (isImouModel || !hasImouLeak) {
      return product.images;
    }
  }

  const mainImg = product?.image || '/uploads/32.jpg';

  // 3. ROUTER & THIẾT BỊ PHÁT WI-FI (100% ẢNH THẬT ROUTER)
  if (type === 'router' || name.includes('router') || name.includes('totolink') || name.includes('archer') || name.includes('ax53')) {
    if (id === '126' || name.includes('totolink') || name.includes('a720r')) {
      return [
        mainImg,
        '/uploads/gallery/totolink_2.jpg',
        '/uploads/gallery/totolink_3.jpg',
        '/uploads/gallery/totolink_4.jpg',
        '/uploads/gallery/totolink_5.jpg'
      ];
    }
    if (id === '125' || name.includes('ax53') || name.includes('archer')) {
      return [
        mainImg,
        '/uploads/gallery/ax53_2.jpg',
        '/uploads/gallery/ax53_3.jpg',
        '/uploads/gallery/ax53_4.jpg',
        '/uploads/gallery/ax53_5.jpg'
      ];
    }
    return [
      mainImg,
      '/uploads/gallery/ax53_2.jpg',
      '/uploads/gallery/totolink_3.jpg',
      '/uploads/gallery/totolink_5.jpg'
    ];
  }

  // 4. SWITCH CHIA MẠNG & SWITCH POE (100% ẢNH THẬT SWITCH)
  if (type === 'switch' || name.includes('switch') || name.includes('chia mạng') || name.includes('s105') || name.includes('ls1005') || name.includes('cbs110') || name.includes('3e0105')) {
    if (id === '131' || name.includes('s105') || name.includes('tenda')) {
      return [
        mainImg,
        '/uploads/gallery/tenda_s105_1.png',
        '/uploads/gallery/tenda_s105_3.jpg',
        '/uploads/gallery/tenda_s105_4.jpg',
        '/uploads/gallery/tenda_s105_5.jpg'
      ];
    }
    if (id === '129' || name.includes('ls1005g') || (name.includes('tp-link') && name.includes('5 cổng'))) {
      return [
        mainImg,
        '/uploads/gallery/tplink_ls1005g_2.jpg',
        '/uploads/gallery/tplink_ls1005g_3.jpg',
        '/uploads/gallery/tplink_ls1005g_4.jpg'
      ];
    }
    if (id === '130' || name.includes('3e0105') || (name.includes('poe') && name.includes('hikvision'))) {
      return [
        mainImg,
        '/uploads/gallery/hik_poe_2.jpg',
        '/uploads/gallery/hik_poe_3.jpg',
        '/uploads/gallery/hik_poe_4.jpg',
        '/uploads/gallery/hik_poe_5.jpg'
      ];
    }
    if (id === '132' || name.includes('cbs110') || name.includes('cisco')) {
      return [
        mainImg,
        '/uploads/gallery/cisco_cbs110_1.jpg',
        '/uploads/gallery/cisco_cbs110_2.jpg',
        '/uploads/gallery/cisco_cbs110_3.jpg',
        '/uploads/gallery/cisco_cbs110_4.jpg'
      ];
    }
    return [
      mainImg,
      '/uploads/gallery/tplink_ls1005g_2.jpg',
      '/uploads/gallery/hik_poe_3.jpg',
      '/uploads/gallery/tenda_s105_4.jpg'
    ];
  }

  // 5. ĐẦU GHI HÌNH DVR / NVR (100% ẢNH THẬT ĐẦU GHI)
  if (type === 'dvr' || name.includes('đầu ghi') || name.includes('dvr') || name.includes('nvr') || name.includes('xvr')) {
    if (id === '128' || name.includes('vantech') || name.includes('vp-464a')) {
      return [
        mainImg,
        '/uploads/gallery/vantech_dvr_2.jpg',
        '/uploads/gallery/vantech_dvr_3.jpg',
        '/uploads/gallery/vantech_dvr_4.jpg'
      ];
    }
    return [
      mainImg,
      '/uploads/gallery/hik_dvr_2.jpg',
      '/uploads/gallery/hik_dvr_3.jpg',
      '/uploads/gallery/hik_dvr_4.jpg'
    ];
  }

  // 6. PHỤ KIỆN / THẺ NHỚ / Ổ CỨNG
  if (type === 'accessory' || name.includes('thẻ nhớ') || name.includes('ổ cứng') || name.includes('hdd') || name.includes('nguồn')) {
    return [
      mainImg,
      '/uploads/gallery/hik_dvr_3.jpg',
      '/uploads/gallery/hik_poe_3.jpg'
    ];
  }

  // 7. CAMERA NĂNG LƯỢNG MẶT TRỜI 4G (ID 113) - TẤM PIN SOLAR, SIM 4G, QUAY QUÉT 360
  if (id === '113' || name.includes('năng lượng mặt trời') || name.includes('solar')) {
    return [
      mainImg,
      '/uploads/gallery/solar_4g_panel.png',
      '/uploads/gallery/solar_4g_ptz.png',
      '/uploads/gallery/solar_4g_sim.png',
      '/uploads/gallery/solar_4g_kit.jpg'
    ];
  }

  // 8. CAMERA LOGITECH CIRCLE (ID 124) - BỘ ẢNH CHÍNH HÃNG LOGITECH CIRCLE VIEW TRÒN
  if (id === '124' || name.includes('logitech') || name.includes('circle')) {
    return [
      mainImg,
      '/uploads/gallery/logi_circle_1.png',
      '/uploads/gallery/logi_circle_2.png',
      '/uploads/gallery/logi_circle_3.png',
      '/uploads/gallery/logi_circle_4.png'
    ];
  }

  // 9. CAMERA MINI A9 (ID 115) - ẢNH CAMERA NAM CHÂM SIÊU NHỎ A9
  if (id === '115' || name.includes('mini a9') || (name.includes('mini') && name.includes('a9'))) {
    return [
      mainImg,
      '/uploads/gallery/a9_angle.jpg',
      '/uploads/gallery/a9_mount.jpg',
      '/uploads/gallery/a9_hand.png'
    ];
  }

  // 10. CAMERA NGỤY TRANG BÓNG ĐÈN (ID 114) - ĐUI XOAY E27 & GÓC TOÀN CẢNH 360
  if (id === '114' || name.includes('bóng đèn')) {
    return [
      mainImg,
      '/uploads/gallery/bulb_e27.jpg',
      '/uploads/gallery/bulb_360.jpg',
      '/uploads/gallery/bulb_led.jpg',
      '/uploads/gallery/bulb_scene.jpg'
    ];
  }

  // 11. CAMERA HÀNH TRÌNH VIETMAP C61 (ID 112) - MÀN HÌNH DASHCAM Ô TÔ & GẮN KÍNH
  if (id === '112' || name.includes('vietmap') || name.includes('hành trình') || name.includes('c61')) {
    return [
      mainImg,
      '/uploads/gallery/vietmap_screen.png',
      '/uploads/gallery/vietmap_mount.png',
      '/uploads/gallery/vietmap_app.png',
      '/uploads/gallery/vietmap_kit.png'
    ];
  }

  // 12. CAMERA IMOU CRUISER S42FP (ID 110) - PTZ NGOÀI TRỜI 2 RÂU FULL COLOR
  if (id === '110' || name.includes('cruiser') || name.includes('s42fp')) {
    return [
      mainImg,
      '/uploads/gallery/cruiser_angle.jpg',
      '/uploads/gallery/cruiser_color.jpg',
      '/uploads/gallery/cruiser_waterproof.jpg',
      '/uploads/gallery/cruiser_bracket.jpg'
    ];
  }

  // 13. CAMERA PTZ EZVIZ C8C (ID 109) - HÌNH CẦU NGOÀI TRỜI QUAY QUÉT 360
  if (id === '109' || name.includes('c8c')) {
    return [
      mainImg,
      '/uploads/gallery/c8c_front.png',
      '/uploads/gallery/c8c_mount.jpg',
      '/uploads/gallery/c8c_night.jpg'
    ];
  }

  // 14. CAMERA DAHUA WIFI HERO A1 (ID 111) - DAHUA HERO A1 QUAY QUÉT
  if (id === '111' || name.includes('hero a1') || (name.includes('dahua') && name.includes('hero'))) {
    return [
      mainImg,
      '/uploads/gallery/hero_a1_front.jpg',
      '/uploads/gallery/hero_a1_rotate.jpg',
      '/uploads/gallery/hero_a1_call.jpg',
      '/uploads/gallery/hero_a1_port.jpg'
    ];
  }

  // 15. CAMERA TP-LINK TAPO C200 (ID 103) - BỘ ẢNH THẬT TAPO C200
  if (id === '103' || name.includes('tapo') || name.includes('c200')) {
    return [
      mainImg,
      '/uploads/gallery/tapo_c200_side.jpg',
      '/uploads/gallery/tapo_c200_sd.jpg',
      '/uploads/gallery/p_103_angle_1.jpg',
      '/uploads/gallery/p_103_angle_2.jpg'
    ];
  }

  // 16. CAMERA XIAOMI MI HOME 360 (ID 102) - BỘ ẢNH THẬT XIAOMI MIJIA
  if (id === '102' || name.includes('xiaomi') || name.includes('mi home')) {
    return [
      mainImg,
      '/uploads/gallery/p_102_angle_1.jpg',
      '/uploads/gallery/p_102_angle_2.jpg',
      '/uploads/gallery/p_102_angle_3.jpg',
      '/uploads/gallery/p_102_angle_4.jpg'
    ];
  }

  // 17. CAMERA FPT INDOOR (ID 104) - BỘ ẢNH THẬT FPT
  if (id === '104' || name.includes('fpt')) {
    return [
      mainImg,
      '/uploads/gallery/p_104_angle_1.jpg',
      '/uploads/gallery/p_104_angle_2.jpg',
      '/uploads/gallery/p_104_angle_3.jpg',
      '/uploads/gallery/p_104_angle_4.jpg'
    ];
  }

  // 18. CAMERA VIETTEL HC2 (ID 105) - BỘ ẢNH THẬT VIETTEL
  if (id === '105' || name.includes('viettel') || name.includes('hc2')) {
    return [
      mainImg,
      '/uploads/gallery/p_105_angle_1.png',
      '/uploads/gallery/hero_a1_rotate.jpg',
      '/uploads/gallery/tapo_c200_side.jpg'
    ];
  }

  // 19. CAMERA DOME BÁN CẦU: HUVIRON (107) & PANASONIC (108) (100% ẢNH THẬT CAMERA TRÒN GẮN TRẦN)
  if (id === '107' || id === '108' || name.includes('huviron') || name.includes('panasonic') || name.includes('bán cầu') || name.includes('dome') || catId === '16') {
    return [
      mainImg,
      '/uploads/gallery/dome_front.jpg',
      '/uploads/gallery/dome_angle.jpg',
      '/uploads/gallery/dome_mount.jpg'
    ];
  }

  // 20. CAMERA CUBE / KHỐI NHỎ: GOOGLE NEST, RING, ARLO, WYZE, BLINK, EUFY
  if (id === '117' || name.includes('nest') || name.includes('google')) {
    return [
      mainImg,
      '/uploads/gallery/nest_cam_mount.jpg',
      '/uploads/gallery/cube_side.jpg',
      '/uploads/gallery/cube_back.jpg'
    ];
  }
  if (id === '119' || name.includes('arlo')) {
    return [
      mainImg,
      '/uploads/gallery/arlo_pro4_45.png',
      '/uploads/gallery/outdoor_bracket.jpg',
      '/uploads/gallery/cube_back.jpg'
    ];
  }
  if (id === '120' || name.includes('wyze')) {
    return [
      mainImg,
      '/uploads/gallery/wyze_v3_cutout.png',
      '/uploads/gallery/cube_side.jpg',
      '/uploads/gallery/cube_back.jpg'
    ];
  }
  if (id === '121' || name.includes('blink')) {
    return [
      mainImg,
      '/uploads/gallery/blink_mini_white.png',
      '/uploads/gallery/cube_side.jpg',
      '/uploads/gallery/cube_back.jpg'
    ];
  }
  if (id === '122' || name.includes('eufy')) {
    return [
      mainImg,
      '/uploads/gallery/cube_front.jpg',
      '/uploads/gallery/cube_side.jpg',
      '/uploads/gallery/cube_back.jpg'
    ];
  }
  if (id === '118' || name.includes('ring')) {
    return [
      mainImg,
      '/uploads/gallery/outdoor_bracket.jpg',
      '/uploads/gallery/cube_side.jpg',
      '/uploads/gallery/cube_back.jpg'
    ];
  }

  // 21. CAMERA KBVISION THÂN (ID 106)
  if (id === '106' || name.includes('kbvision') || name.includes('kx-a2111')) {
    return [
      mainImg,
      '/uploads/gallery/kbvision_c31l.jpg',
      '/uploads/gallery/outdoor_ports.jpg',
      '/uploads/gallery/outdoor_bracket.jpg'
    ];
  }

  // 22. CAMERA DAHUA THÂN (ID 100)
  if (id === '100' || name.includes('1230s') || (name.includes('dahua') && name.includes('hfw'))) {
    return [
      mainImg,
      '/uploads/gallery/p_100_angle_1.jpg',
      '/uploads/gallery/p_100_angle_2.jpg',
      '/uploads/gallery/p_100_angle_3.jpg',
      '/uploads/gallery/p_100_angle_4.jpg'
    ];
  }

  // 23. CAMERA HIKVISION THÂN (ID 98) & TRỌN BỘ HIKVISION (ID 101)
  if (id === '98' || name.includes('2021g1') || name.includes('ds-2cd')) {
    return [
      mainImg,
      '/uploads/gallery/p_98_angle_1.png',
      '/uploads/gallery/outdoor_ports.jpg',
      '/uploads/gallery/outdoor_bracket.jpg'
    ];
  }
  if (id === '101' || name.includes('trọn bộ')) {
    return [
      mainImg,
      '/uploads/gallery/p_101_angle_1.png',
      '/uploads/gallery/hik_dvr_2.jpg',
      '/uploads/gallery/hik_dvr_4.jpg'
    ];
  }

  // 24. CAMERA EZVIZ OUTPRO (ID 95) & IMOU BULLET 2C (ID 94)
  if (id === '95' || name.includes('outpro') || name.includes('c3tn')) {
    return [
      mainImg,
      '/uploads/gallery/p_95_angle_1.png',
      '/uploads/gallery/p_95_angle_2.jpg',
      '/uploads/gallery/p_95_angle_3.jpg',
      '/uploads/gallery/p_95_angle_4.jpg'
    ];
  }
  if (id === '94' || name.includes('bullet 2c')) {
    return [
      mainImg,
      '/uploads/gallery/p_94_angle_1.png',
      '/uploads/gallery/p_94_angle_2.png',
      '/uploads/gallery/outdoor_ports.jpg',
      '/uploads/gallery/outdoor_bracket.jpg'
    ];
  }

  // 25. CAMERA VANTECH V-2020AI (ID 97)
  if (id === '97' || name.includes('vantech') || name.includes('v-2020') || name.includes('2020ai')) {
    return [
      mainImg,
      '/uploads/gallery/vantech_4.jpg',
      '/uploads/gallery/vantech_black_clean.jpg',
      '/uploads/gallery/vantech_white_angle.jpg'
    ];
  }

  // 26. CAMERA KBONE H21P (ID 96)
  if (id === '96' || name.includes('kbone') || name.includes('h21p')) {
    return [
      mainImg,
      '/uploads/gallery/p_96_angle_1.jpg',
      '/uploads/gallery/p_96_angle_2.jpg',
      '/uploads/gallery/p_96_angle_3.jpg'
    ];
  }

  // 27. CAMERA YOOSEE 3 RÂU (ID 99)
  if (id === '99' || name.includes('yoosee')) {
    return [
      mainImg,
      '/uploads/gallery/p_99_angle_1.png',
      '/uploads/gallery/p_99_angle_2.jpg',
      '/uploads/gallery/p_99_angle_3.jpg',
      '/uploads/gallery/p_99_angle_4.jpg'
    ];
  }

  // 28. CAMERA EZVIZ C6N (ID 93)
  if (id === '93' || name.includes('c6n')) {
    return [
      mainImg,
      '/uploads/gallery/ezviz_c6n_angle.jpg',
      '/uploads/gallery/ezviz_c6n_back.jpg',
      '/uploads/gallery/ezviz_c6n_kit.jpg',
      '/uploads/gallery/ezviz_c6n_scene.jpg'
    ];
  }

  // 29. CAMERA IMOU RANGER 2 (ID 92)
  if (id === '92' || name.includes('ranger 2') || name.includes('a22ep')) {
    return [
      mainImg,
      '/uploads/gallery/p_92_angle_2.jpg',
      '/uploads/gallery/p_92_angle_3.jpg',
      '/uploads/gallery/p_92_angle_4.png',
      '/uploads/gallery/imou_ranger2_angle.png'
    ];
  }

  // 30. MẶC ĐỊNH THEO LOẠI THIẾT BỊ NẾU LÀ MODEL LẠ
  if (type === 'camera_outdoor') {
    return [
      mainImg,
      '/uploads/gallery/p_95_angle_2.jpg',
      '/uploads/gallery/outdoor_ports.jpg',
      '/uploads/gallery/outdoor_bracket.jpg'
    ];
  }

  return [
    mainImg,
    '/uploads/gallery/ezviz_c6n_angle.jpg',
    '/uploads/gallery/ezviz_c6n_back.jpg',
    '/uploads/gallery/ezviz_c6n_kit.jpg'
  ];
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter(); 
  const { addToCart, totalItems } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc'); 
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false); 
  
<<<<<<< HEAD
  // STATE LẤY DỮ LIỆU NHANH
  const [user, setUser] = useState<any>(null);
  const paramId = String(params?.id || '');
  const initialProduct = (db.products || []).find((p: any) => 
    String(p.id) === paramId || String((p as any)._id) === paramId
  ) || null;

  const [product, setProduct] = useState<any>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(!initialProduct);
=======
  // ==========================================
  // STATE LẤY DỮ LIỆU TỪ MONGODB
  // ==========================================
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96

  // State cho Form Đánh giá mới
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState(0); 
  const [newComment, setNewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

<<<<<<< HEAD
  // STATE SALE VÀ GIẢM GIÁ TỪ ADMIN
=======
  // STATE KIỂM TRA NGÀY VÀNG VÀ % GIẢM GIÁ TỪ ADMIN
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  const [isSaleDay, setIsSaleDay] = useState(false);
  const [saleDiscount, setSaleDiscount] = useState(0);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) setUser(JSON.parse(loggedInUser));

<<<<<<< HEAD
    if (!params?.id) return;
    const currentId = String(params.id);

    // 1. Luôn cuộn lên đầu trang khi mở/chuyển sản phẩm
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 2. Reset góc ảnh về ảnh chính đầu tiên
    setActiveImageIndex(0);

    // 3. FIX LỖI SẢN PHẨM CŨ: Lập tức đồng bộ lại sản phẩm đúng với URL hiện tại
    const freshInitial = (db.products || []).find((p: any) => 
      String(p.id) === currentId || String((p as any)._id) === currentId
    ) || null;

    setProduct(freshInitial);
    if (!freshInitial) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    // 4. Thử lấy nhanh từ bộ nhớ session (nếu có cache của chính ID này)
    try {
      const cached = sessionStorage.getItem(`prod_${currentId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (String(parsed.id) === currentId || String(parsed._id) === currentId)) {
          setProduct(parsed);
          setIsLoading(false);
        }
      }
    } catch (e) {}

    // 5. Fetch thông tin sản phẩm cụ thể từ API (MongoDB Cloud)
    fetch(`/api/products?id=${encodeURIComponent(currentId)}`)
      .then(res => res.ok ? res.json() : null)
      .then(pData => {
        if (pData) {
          setProduct(pData);
          setIsLoading(false);
          try { sessionStorage.setItem(`prod_${currentId}`, JSON.stringify(pData)); } catch(e) {}

          // Nạp các sản phẩm liên quan cùng danh mục
          if (pData.category_id) {
            fetch(`/api/products?category_id=${pData.category_id}`)
              .then(r => r.ok ? r.json() : [])
              .then(relData => {
                if (Array.isArray(relData)) {
                  setRelatedProducts(relData.filter((rp: any) => String(rp._id || rp.id) !== currentId).slice(0, 4));
                }
              })
              .catch(() => {});
          }
        } else if (!product) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    // 3. Fetch reviews song song chỉ cho sản phẩm này
    fetch(`/api/reviews?product_id=${encodeURIComponent(currentId)}`)
      .then(res => res.ok ? res.json() : [])
      .then(rData => {
        let fetchedReviews: any[] = Array.isArray(rData) ? rData : [];
        if (db.reviews && Array.isArray(db.reviews)) {
          const dbrs = db.reviews.filter((dbr: any) => String(dbr.product_id) === currentId);
          for (const dbr of dbrs) {
            const exists = fetchedReviews.some((cr: any) => 
              String(cr._id || cr.id) === String(dbr.id) ||
              (cr.comment === dbr.comment && Number(cr.rating) === Number(dbr.rating))
            );
            if (!exists) {
              fetchedReviews.push({
                ...dbr,
                customer_name: dbr.user_id === '11' ? 'bao' : (dbr.user_id === '1' ? 'ADMIN' : 'Khách hàng'),
                createdAt: dbr.created_at
              });
            }
          }
        }
        setReviews(fetchedReviews);
      })
      .catch(() => {});

    // 4. Fetch settings khuyến mãi
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(sData => {
        if (sData) {
          const discount = Number(sData.saleDiscount) || 0;
          setSaleDiscount(discount);
          const currentDay = new Date().getDate();
          const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
          if (daysArray.includes(currentDay) && discount > 0) {
            setIsSaleDay(true);
          }
        }
      })
      .catch(() => {});
=======
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        
        // GỌI THÊM API SETTINGS ĐỂ LẤY CẤU HÌNH ADMIN
        const [prodRes, reviewRes, setRes] = await Promise.all([
          fetch(`/api/products?t=${timestamp}`),
          fetch(`/api/reviews?t=${timestamp}`),
          fetch(`/api/settings?t=${timestamp}`).catch(() => null)
        ]);

        if (prodRes.ok) {
          const allProducts = await prodRes.json();
          const currentProduct = allProducts.find((p: any) => String(p._id || p.id) === String(params?.id));
          setProduct(currentProduct);

          if (currentProduct) {
            const related = allProducts
              .filter((p: any) => String(p.category_id) === String(currentProduct.category_id) && String(p._id || p.id) !== String(params?.id))
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }

        if (reviewRes.ok) {
          const allReviews = await reviewRes.json();
          const currentReviews = allReviews.filter((r: any) => String(r.product_id) === String(params?.id));
          setReviews(currentReviews);
        }

        // XỬ LÝ CẤU HÌNH TỪ ADMIN ĐỂ ÁP DỤNG SALE
        if (setRes && setRes.ok) {
          const sData = await setRes.json();
          if (sData) {
            const discount = Number(sData.saleDiscount) || 0;
            setSaleDiscount(discount);
            
            const currentDay = new Date().getDate();
            const daysArray = (sData.saleDays || "").split(',').map((d: string) => parseInt(d.trim()));
            
            if (daysArray.includes(currentDay) && discount > 0) {
              setIsSaleDay(true);
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu MongoDB:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchData();
    }
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
  }, [params?.id]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); 
    window.location.href = '/'; 
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập để gửi đánh giá!");
    if (newRating === 0) return alert("Vui lòng chọn số sao đánh giá cho sản phẩm!");
    if (!newComment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setIsSubmittingReview(true);
    
    const reviewData = {
<<<<<<< HEAD
      product_id: String(product?._id || product?.id || params?.id),
      username: user.username,
      customer_name: user.full_name || user.username,
=======
      product_id: params?.id,
      username: user.username,
      customer_name: user.username,
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
      rating: newRating,
      comment: newComment,
      image: reviewImage, 
      status: "Đã duyệt" 
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setShowReviewForm(false);
        setNewComment('');
        setNewRating(0); 
        setReviewImage(''); 
        alert("🎉 Cảm ơn bạn đã đánh giá sản phẩm!");
      } else {
        alert("Có lỗi xảy ra khi lưu đánh giá.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ API!");
    }
    setIsSubmittingReview(false);
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews).toFixed(1) 
    : null;

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <Header user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              border: '3.5px solid #e0f2fe',
              borderTopColor: '#0284c7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#0369a1', fontWeight: '700', fontSize: '16px' }}>Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
        <Footer />
=======
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "bold", color: "#64748b" }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i> Đang tải thông tin sản phẩm...
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-box-open" style={{ fontSize: '64px', color: '#bae6fd', marginBottom: '20px' }}></i>
        <h1 style={{ fontSize: '28px', color: '#0c4a6e', marginBottom: '16px', fontWeight: '800' }}>Không tìm thấy sản phẩm!</h1>
        <p style={{ color: '#64748b', marginBottom: '25px' }}>Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.</p>
        <Link href="/" className="btn-hero-primary" style={{ background: '#0284c7', color: 'white' }}>
          <i className="fas fa-arrow-left"></i> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const addToFavorite = (productData: any) => {
<<<<<<< HEAD
    if (!user) {
      alert("Vui lòng đăng nhập để lưu vào mục yêu thích!");
      router.push('/login');
      return;
    }
=======
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
    const saved = localStorage.getItem('camera_bn_favs');
    let favList = saved ? JSON.parse(saved) : [];
    const exists = favList.find((item: any) => String(item._id || item.id) === String(productData._id || productData.id));
    
    if(!exists) {
      favList.push(productData);
      localStorage.setItem('camera_bn_favs', JSON.stringify(favList));
      alert("❤️ Đã thêm sản phẩm vào danh sách yêu thích!");
    } else { 
      alert("Sản phẩm này đã có trong danh sách yêu thích của bạn!"); 
    }
  };
  
  const handleDecrease = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => { if (quantity < Number(product.quantity)) setQuantity(quantity + 1); };

<<<<<<< HEAD
  const currentPrice = isSaleDay && saleDiscount > 0 
    ? Number(product.price) * (1 - saleDiscount / 100) 
    : Number(product.price);

  // Tính toán dữ liệu thông minh theo danh mục sản phẩm
  const productType = getProductType(product);
  const productBrand = getProductBrand(product);
  const highlights = getProductHighlights(product, productType);
  const specs = getProductSpecs(product, productType, productBrand);
  const extraDesc = getProductExtraDesc(product, productType);
  const giftLines = getProductGiftList(product, productType);
  const categoryObj = db.categories?.find((c: any) => String(c.id) === String(product?.category_id));
  const categoryName = categoryObj?.name || (
    productType === 'switch' ? 'Switch Mạng' :
    productType === 'router' ? 'Router Wi-Fi' :
    productType === 'dvr' ? 'Đầu Ghi Hình' :
    productType === 'accessory' ? 'Phụ Kiện An Ninh' : 'Camera Quan Sát'
  );

  // Danh sách hình ảnh đa góc độ phong phú của sản phẩm
  const productImages = getProductImages(product, productType);
  const currentMainImg = productImages[activeImageIndex] || product.image;

  const handlePrevImg = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImg = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 0. TOP UTILITY BAR */}
      <div className="top-utility-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span><i className="fas fa-phone-alt"></i> Hotline tư vấn: <strong style={{ color: '#ffffff' }}>0971.024.173</strong></span>
            <span><i className="fas fa-map-marker-alt"></i> 12 Trịnh Đình Thảo, Tân Phú, TP. HCM</span>
          </div>
          <div className="top-bar-right">
            <span><i className="fas fa-truck"></i> Miễn phí lắp đặt nội thành</span>
            <span><i className="fas fa-shield-alt"></i> Bảo hành chính hãng 24 tháng</span>
          </div>
=======
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <style>{`
        .pd-wrapper { max-width: 1200px; width: 95%; margin: 20px auto 60px; flex: 1; font-family: 'Segoe UI', sans-serif;}
        .breadcrumb-box { background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border-left: 4px solid #0ea5e9; font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 25px; }
        .breadcrumb-box a { color: #1e293b; transition: 0.2s; text-decoration: none; }
        .breadcrumb-box a:hover { color: #0ea5e9; }
        
        .pd-main-card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; gap: 50px; flex-wrap: wrap; margin-bottom: 30px; position: relative;}
        .pd-img-col { flex: 1; min-width: 300px; display: flex; justify-content: center; align-items: center; padding: 20px; position: relative;}
        .pd-img-col img { width: 100%; max-width: 400px; object-fit: contain; }
        
        .pd-info-col { flex: 1.2; min-width: 350px; position: relative; }
        .pd-sku { background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 12px; color: #64748b; display: inline-block; margin-bottom: 15px; }
        .pd-heart { position: absolute; top: 0; right: 0; width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 18px; cursor: pointer; transition: 0.3s; background: white;}
        .pd-heart:hover { color: #ef4444; border-color: #ef4444; background: #fff1f2; }
        
        .pd-title { font-size: 28px; color: #0f172a; margin-bottom: 20px; font-weight: 800; line-height: 1.3; padding-right: 50px;}
        .pd-price-box { background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f1f5f9; display: flex; align-items: baseline; gap: 15px;}
        .pd-price { color: #ef4444; font-size: 36px; font-weight: 800; }
        .pd-old-price { color: #94a3b8; font-size: 18px; text-decoration: line-through; }
        
        .pd-rating { display: flex; align-items: center; gap: 10px; font-size: 14px; margin-bottom: 25px; color: #64748b; }
        .pd-stars { color: #facc15; font-size: 13px; }
        
        .pd-qty-row { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; font-weight: 600; color: #1e293b;}
        .qty-controls { display: flex; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; height: 40px; }
        .qty-btn { width: 40px; background: white; border: none; font-size: 18px; cursor: pointer; color: #64748b; transition: 0.2s;}
        .qty-btn:hover { background: #f1f5f9; color: #1e293b; }
        .qty-input { width: 60px; border: none; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-size: 15px; outline: none; }
        
        .pd-buttons { display: flex; gap: 15px; }
        .btn-add { flex: 1; border: 2px solid #0ea5e9; color: #0ea5e9; background: white; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 15px; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px;}
        .btn-add:hover { background: #f0f9ff; }
        .btn-buy { flex: 1; background: linear-gradient(to right, #ff6b6b, #ef4444); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 15px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
        .btn-buy:hover { opacity: 0.9; transform: translateY(-2px); }
        
        .pd-tabs-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow: hidden; margin-bottom: 50px;}
        .tab-header { display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .tab-btn { flex: 1; padding: 18px; font-weight: 700; color: #64748b; background: transparent; border: none; border-top: 3px solid transparent; cursor: pointer; font-size: 15px; transition: 0.3s; }
        .tab-btn.active { color: #0ea5e9; border-top-color: #0ea5e9; background: white; }
        .tab-content { padding: 40px; line-height: 1.8; color: #475569; font-size: 15px; }
        
        .section-title-center { text-align: center; font-size: 22px; color: #1e293b; text-transform: uppercase; font-weight: 800; margin-bottom: 40px; position: relative; }
        .section-title-center::after { content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 50px; height: 3px; background: #0ea5e9; }
        
        .related-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; transition: 0.3s; position: relative; display: flex; flex-direction: column;}
        .related-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .badge-discount { position: absolute; top: 15px; left: 15px; background: #ef4444; color: white; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; z-index: 2; }
        .rc-img { height: 160px; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; overflow: hidden; }
        .rc-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 10px; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .rc-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; flex-direction: column; justify-content: center; min-height: 40px;}
        .rc-new-price { color: #ef4444; font-weight: 800; font-size: 16px; }
        .rc-old-price { color: #94a3b8; text-decoration: line-through; font-size: 12px; }
        .rc-meta { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-top: auto; }
        
        .star-rating i { color: #cbd5e1; font-size: 28px; cursor: pointer; transition: 0.2s; margin-right: 8px; }
        .star-rating i.active { color: #f59e0b; }
        
        @media (max-width: 768px) {
          .pd-main-card { padding: 20px; flex-direction: column; gap: 20px; }
          .pd-title { font-size: 22px; }
          .pd-price { font-size: 28px; }
          .pd-buttons { flex-direction: column; }
          .tab-btn { padding: 12px; font-size: 13px; }
          .tab-content { padding: 20px; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ background: '#1e293b', padding: '12px 0', borderBottom: '1px solid #0f172a', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '96%' }}>
          <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <i className="fas fa-video"></i> CIOs - impossible is nothing
          </Link>
          <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-home"></i> Trang chủ</Link>
            <Link href="/contact" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}><i className="fas fa-phone-alt"></i> Liên hệ</Link>
            <Link href="/notifications" className="nav-link" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-bell"></i> Thông báo <NotifBadge />
            </Link>
            <Link href="/cart" className="nav-link" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng
              {totalItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#e11d48', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%' }}>{totalItems}</span>}
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/profile" style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>
                  Xin chào,<br/><strong style={{ color: '#4ade80', fontSize: '14px', textTransform: 'uppercase' }}>{user.username}</strong>
                </Link>
                <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Thoát</button>
              </div>
            ) : (
              <Link href="/login" className="nav-link" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                <i className="fas fa-user"></i> Đăng nhập
              </Link>
            )}
          </nav>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
        </div>
      </div>

      {/* 1. HEADER */}
      <Header user={user} onLogout={handleLogout} />

      {/* MAIN CONTAINER */}
      <main className="product-detail-main">
        {/* THANH ĐIỀU HƯỚNG & NÚT QUAY LẠI CHUẨN MỌI THIẾT BỊ */}
        <div className="product-breadcrumb-bar">
          <button 
            type="button"
            onClick={() => router.push('/')}
            className="product-back-btn"
            title="Quay lại danh sách sản phẩm"
          >
            <i className="fas fa-arrow-left"></i> Quay lại danh sách
          </button>

          <div className="product-breadcrumb">
            <Link href="/" title="Về trang chủ">Trang chủ</Link>
            <span style={{ color: '#cbd5e1' }}>›</span>
            <span style={{ color: '#0369a1' }}>{categoryName}</span>
            <span style={{ color: '#cbd5e1' }}>›</span>
            <span style={{ color: '#0284c7', fontWeight: '700' }}>{product.name}</span>
          </div>
        </div>

<<<<<<< HEAD
        {/* KHUNG SẢN PHẨM CHÍNH (PRODUCT SHOWCASE) */}
        <div className="product-showcase-card">
          {/* Sale badge */}
          {isSaleDay && saleDiscount > 0 && (
            <div className="product-sale-badge">
              🔥 GIẢM NGAY {saleDiscount}% HÔM NAY
            </div>
          )}

          {/* CỘT ẢNH SẢN PHẨM CHÍNH (GALLERY SLIDER & THUMBNAILS) */}
          <div className="product-gallery-col">
            <div className="product-main-img-box">
              <img 
                src={currentMainImg} 
                alt={product.name} 
              />

              {/* Nút lướt ảnh trái / phải */}
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImg}
                    className="product-img-nav-btn prev"
                    title="Ảnh trước"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <button 
                    onClick={handleNextImg}
                    className="product-img-nav-btn next"
                    title="Ảnh kế tiếp"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}

              {/* Icon phóng to ảnh ở góc dưới bên trái */}
              <button 
                onClick={() => setIsZoomModalOpen(true)}
                className="product-zoom-trigger-btn"
                title="Phóng to ảnh"
              >
                <i className="fas fa-expand-alt"></i>
              </button>

              {/* Tag số thứ tự ảnh */}
              <div className="product-img-counter-tag">
                <i className="fas fa-images"></i> {activeImageIndex + 1} / {productImages.length}
              </div>
            </div>

            {/* DẢI THUMBNAILS THU NHỎ BÊN DƯỚI */}
            {productImages.length > 1 && (
              <div className="product-thumbnails-row">
                {productImages.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`product-thumb-btn${isActive ? " is-active" : ""}`}
                      title={`Xem góc ảnh ${idx + 1}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} góc ${idx + 1}`} 
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dải thông số nhanh */}
            <div className="product-quick-specs-grid">
              <div className="product-quick-spec-item">
                <i className="fas fa-award"></i>
                <span className="product-quick-spec-title">Chính Hãng</span>
                <span className="product-quick-spec-desc">Bảo hành 24T</span>
              </div>
              <div className="product-quick-spec-item">
                <i className="fas fa-bolt"></i>
                <span className="product-quick-spec-title">Giao Hỏa Tốc</span>
                <span className="product-quick-spec-desc">Nhận trong 2H</span>
              </div>
              <div className="product-quick-spec-item">
                <i className="fas fa-shield-alt"></i>
                <span className="product-quick-spec-title">Đổi Mới 1-1</span>
                <span className="product-quick-spec-desc">Trong 30 ngày</span>
              </div>
            </div>
          </div>

          {/* CỘT THÔNG TIN VÀ NÚT MUA HÀNG */}
          <div className="product-info-col">
            <div className="product-info-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="product-sku-tag">
                  SKU: {String(product._id || product.id).slice(-6).toUpperCase()}
                </span>
                <span className="product-stock-tag">
                  <i className="fas fa-check-circle"></i> Còn hàng
                </span>
=======
        <div className="pd-main-card">
          {/* TAG SALE DÀNH CHO SẢN PHẨM CHÍNH ĐỘNG TỪ ADMIN */}
          {isSaleDay && saleDiscount > 0 && (
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#e11d48', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', zIndex: 5, boxShadow: '0 4px 10px rgba(225,29,72,0.3)', transform: 'rotate(-5deg)' }}>
              -{saleDiscount}% GIẢM NGAY
            </div>
          )}

          <div className="pd-img-col">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="pd-info-col">
            <div className="pd-sku">SKU: {String(product._id || product.id).slice(-6).toUpperCase()}</div>
            <div className="pd-heart" onClick={() => addToFavorite(product)}><i className="fas fa-heart"></i></div>
            
            <h1 className="pd-title">{product.name}</h1>
            
            {/* TÍNH TOÁN GIÁ DỰA TRÊN CẤU HÌNH ADMIN */}
            <div className="pd-price-box">
              {isSaleDay && saleDiscount > 0 ? (
                <>
                  <div className="pd-price">{(Number(product.price) * (1 - saleDiscount / 100)).toLocaleString('vi-VN')} đ</div>
                  <div className="pd-old-price">{Number(product.price).toLocaleString('vi-VN')} đ</div>
                </>
              ) : (
                <div className="pd-price">{Number(product.price).toLocaleString('vi-VN')} đ</div>
              )}
            </div>

            <div className="pd-rating">
              <span className="pd-stars">
                 {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
              </span>
              <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); }} style={{ color: '#0ea5e9', textDecoration: 'underline' }}>
                (Xem {totalReviews} đánh giá)
              </Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
              <span>Đã bán {product.sold || 1}</span>
            </div>

            <div className="pd-qty-row">
              <span>Số lượng:</span>
              <div className="qty-controls">
                <button className="qty-btn" onClick={handleDecrease}>-</button>
                <input type="text" className="qty-input" value={quantity} readOnly />
                <button className="qty-btn" onClick={handleIncrease}>+</button>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
              </div>

<<<<<<< HEAD
              <button 
                onClick={() => addToFavorite(product)}
                className="product-fav-btn"
                title="Lưu vào yêu thích"
              >
                <i className="fas fa-heart"></i>
              </button>
=======
            <div className="pd-buttons">
              {Number(product.quantity) > 0 ? (
                <>
                  <button className="btn-add" onClick={() => {
                    if (!user) {
                      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                      router.push('/login');
                    } else {
                      addToCart(product, quantity, true);
                      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
                    }
                  }}>
                    <i className="fas fa-cart-plus"></i> THÊM VÀO GIỎ
                  </button>
                  <button className="btn-buy" onClick={() => {
                    if (!user) {
                      alert("Vui lòng đăng nhập để mua hàng!");
                      router.push('/login');
                    } else {
                      addToCart(product, quantity, false);
                      router.push('/cart');
                    }
                  }}>
                    MUA NGAY
                  </button>
                </>
              ) : (
                <button className="btn-buy" disabled style={{ background: '#cbd5e1', cursor: 'not-allowed', width: '100%', color: '#64748b', boxShadow: 'none' }}>
                  SẢN PHẨM TẠM HẾT HÀNG
                </button>
              )}
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
            </div>

            <h1 className="product-title-heading">
              {product.name}
            </h1>

            {/* Đánh giá & đã bán */}
            <div className="product-rating-row">
              {totalReviews > 0 && avgRating ? (
                <>
                  <div style={{ color: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{avgRating}</span>
                    <span>{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</span>
                  </div>
                  <span>•</span>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {totalReviews} đánh giá khách hàng
                  </button>
                </>
              ) : (
                <>
                  <div style={{ color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#cbd5e1' }}>☆☆☆☆☆</span>
                    <span style={{ color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Chưa có đánh giá</span>
                  </div>
                  <span>•</span>
                  <button 
                    onClick={() => {
                      setActiveTab('reviews');
                      setShowReviewForm(true);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Viết đánh giá đầu tiên
                  </button>
                </>
              )}
              <span>•</span>
              <span>Đã bán <strong>{Number(product.sold) || 0}</strong></span>
            </div>

            {/* Khung Giá bán */}
            <div className="product-price-box">
              <span className="product-current-price">
                {currentPrice.toLocaleString('vi-VN')} đ
              </span>
              {isSaleDay && saleDiscount > 0 && (
                <span className="product-old-price">
                  {Number(product.price).toLocaleString('vi-VN')} đ
                </span>
              )}
              <span className="product-vat-tag">
                [Đã bao gồm VAT]
              </span>
            </div>

            {/* HỘP QUÀ TẶNG & KHUYẾN MÃI ĐẶC QUYỀN */}
            <div className="product-gift-box">
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-gift" style={{ color: '#0284c7', fontSize: '16px' }}></i> ƯU ĐÃI ĐẶC BIỆT KHI MUA HÀNG HÔM NAY
              </div>
              <ul style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7', paddingLeft: '4px', listStyleType: 'none', margin: 0 }}>
                {giftLines.map((gift, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#0284c7', fontSize: '12px' }}>🎁</span>
                    <span>{gift}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chọn số lượng */}
            <div className="product-qty-row">
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e' }}>Số lượng:</span>
              <div className="product-qty-control">
                <button 
                  onClick={handleDecrease}
                  className="product-qty-btn"
                >
                  -
                </button>
                <input 
                  type="text" 
                  value={quantity} 
                  readOnly 
                  className="product-qty-input"
                />
                <button 
                  onClick={handleIncrease}
                  className="product-qty-btn"
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                (Còn {product.quantity} sản phẩm trong kho)
              </span>
            </div>

            {/* Nút hành động */}
            <div className="product-actions-row">
              {Number(product.quantity) > 0 ? (
                <>
                  <button 
                    onClick={() => {
                      if (!user) {
                        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
                        router.push('/login');
                      } else {
                        addToCart(product, quantity, true);
                        alert(`🎉 Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
                      }
                    }}
                    className="btn-add-to-cart"
                  >
                    <i className="fas fa-cart-plus"></i> THÊM VÀO GIỎ
                  </button>

                  <button 
                    onClick={() => {
                      if (!user) {
                        alert("Vui lòng đăng nhập để mua hàng!");
                        router.push('/login');
                      } else {
                        addToCart(product, quantity, false);
                        router.push('/cart');
                      }
                    }}
                    className="btn-card-action btn-buy-now"
                  >
                    <i className="fas fa-bolt"></i> MUA NGAY (GIAO 2H)
                  </button>
                </>
              ) : (
                <button disabled className="btn-card-action" style={{ width: '100%', padding: '14px', background: '#cbd5e1', cursor: 'not-allowed' }}>
                  SẢN PHẨM TẠM HẾT HÀNG
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABS NỘI DUNG CHI TIẾT (MÔ TẢ - THÔNG SỐ - ĐÁNH GIÁ) */}
        <div className="product-tabs-card">
          {/* Tab Header */}
          <div className="product-tabs-header">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`product-tab-btn${activeTab === 'desc' ? " is-active" : ""}`}
            >
              <i className="fas fa-file-alt"></i> 
              <span className="tab-text-full">Mô Tả Chi Tiết</span>
              <span className="tab-text-short">Mô tả</span>
            </button>

            <button 
              onClick={() => setActiveTab('specs')}
              className={`product-tab-btn${activeTab === 'specs' ? " is-active" : ""}`}
            >
              <i className="fas fa-cogs"></i> 
              <span className="tab-text-full">Thông Số Kỹ Thuật</span>
              <span className="tab-text-short">Thông số</span>
            </button>

            <button 
              onClick={() => setActiveTab('reviews')}
              className={`product-tab-btn${activeTab === 'reviews' ? " is-active" : ""}`}
            >
              <i className="fas fa-star"></i> 
              <span className="tab-text-full">Đánh Giá ({totalReviews})</span>
              <span className="tab-text-short">Đánh giá ({totalReviews})</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="product-tab-body">
            
            {/* TAB 1: MÔ TẢ CHI TIẾT */}
            {activeTab === 'desc' && (
              <div>
<<<<<<< HEAD
                <h3 style={{ fontSize: '20px', color: '#0c4a6e', fontWeight: '800', marginBottom: '16px' }}>
                  Giới thiệu tổng quan về {product.name}
                </h3>
                <p style={{ marginBottom: '16px', color: '#334155', fontSize: '15.5px', fontWeight: '500', lineHeight: '1.8' }}>
                  {product.description || `Sản phẩm ${product.name} chính hãng phân phối bởi CIOs Camera, đáp ứng tiêu chuẩn chất lượng và độ bền cao.`}
                </p>
                <p style={{ marginBottom: '25px', color: '#475569', lineHeight: '1.8' }}>
                  {extraDesc}
                </p>

                {/* ẢNH MINH HỌA NẰM CHÍNH GIỮA */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '40px auto', 
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <div style={{ 
                    maxWidth: '520px', 
                    width: '100%', 
                    background: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '30px', 
                    boxShadow: '0 12px 35px -5px rgba(2, 132, 199, 0.15)', 
                    border: '1.5px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <img 
                      src={currentMainImg} 
                      alt={product.name} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '380px', 
                        objectFit: 'contain', 
                        margin: '0 auto', 
                        display: 'block',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                    Hình ảnh thiết kế chi tiết của {product.name} chính hãng
                  </span>
                </div>

                {/* KHỐI 4 TÍNH NĂNG NỔI BẬT THEO LOẠI THIẾT BỊ */}
                <h3 style={{ fontSize: '18px', color: '#0c4a6e', fontWeight: '800', margin: '35px 0 16px' }}>
                  Điểm Nổi Bật Vượt Trội
                </h3>
                <div className="product-highlights-grid">
                  {highlights.map((h, i) => (
                    <div key={i} className="product-highlight-item">
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
                        <i className={h.icon}></i>
                      </div>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#0c4a6e', marginBottom: '6px' }}>{h.title}</strong>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>{h.desc}</p>
                    </div>
                  ))}
=======
                <p style={{ marginBottom: '20px' }}>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
                <p style={{ marginBottom: '30px' }}>Sản phẩm được thiết kế với công nghệ mới nhất, đảm bảo hiệu suất hoạt động ổn định trong thời gian dài. Vỏ ngoài làm từ chất liệu cao cấp chống va đập, tản nhiệt tốt. Phù hợp cho cả nhu cầu gia đình và doanh nghiệp nhỏ.</p>
                <div style={{ textAlign: 'center' }}>
                  <img src={product.image} alt={product.name} style={{ maxWidth: '100%', width: '400px', borderRadius: '8px' }} />
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                </div>
              </div>
            )}

            {/* TAB 2: THÔNG SỐ KỸ THUẬT */}
            {activeTab === 'specs' && (
              <div className="product-specs-table-wrapper">
                <table className="product-specs-table">
                  <tbody>
                    {specs.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < specs.length - 1 ? '1px solid #e0f2fe' : 'none', background: idx % 2 === 0 ? '#f0f9ff' : '#ffffff' }}>
                        <td style={{ width: '35%', fontWeight: '700', color: '#0c4a6e', background: idx % 2 === 1 ? '#f8fafc' : undefined }}>
                          {item.label}
                        </td>
                        <td style={{ 
                          color: (item as any).green ? '#16a34a' : (item.highlight ? '#0284c7' : '#1e293b'), 
                          fontWeight: (item as any).green || item.highlight ? '800' : '500' 
                        }}>
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

<<<<<<< HEAD
            {/* TAB 3: ĐÁNH GIÁ KHÁCH HÀNG */}
=======
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
            {activeTab === 'reviews' && (
              <div>
                <div className="product-reviews-summary" style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '35px', paddingBottom: '30px', borderBottom: '1.5px solid #e0f2fe', flexWrap: 'wrap' }}>
                  
<<<<<<< HEAD
                  {totalReviews > 0 && avgRating ? (
                    <div className="review-score-box" style={{ textAlign: 'center', minWidth: '140px', padding: '20px', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '48px', fontWeight: '900', color: '#0284c7', lineHeight: '1' }}>{avgRating}</div>
                      <div style={{ color: '#f59e0b', fontSize: '18px', margin: '8px 0' }}>
                        {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Dựa trên {totalReviews} đánh giá</div>
=======
                  <div style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '50px', fontWeight: '900', color: '#f59e0b', lineHeight: '1' }}>{avgRating}</div>
                    <div style={{ color: '#f59e0b', fontSize: '18px', margin: '5px 0' }}>
                        {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                    </div>
                  ) : (
                    <div className="review-score-box" style={{ textAlign: 'center', minWidth: '140px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ fontSize: '40px', fontWeight: '900', color: '#94a3b8', lineHeight: '1' }}>0.0</div>
                      <div style={{ color: '#cbd5e1', fontSize: '18px', margin: '8px 0' }}>
                        ☆☆☆☆☆
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Chưa có đánh giá</div>
                    </div>
                  )}

                  <div className="review-bars-col" style={{ flex: 1, minWidth: '240px' }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => Number(r.rating || 5) === star).length;
                      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                          <span style={{ width: '45px', fontWeight: '700' }}>{star} sao</span>
                          <div style={{ flex: 1, background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                          </div>
                          <span style={{ width: '25px', textAlign: 'right', fontWeight: '600' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="review-cta-col" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '12px' }}>Bạn đã trải nghiệm thiết bị này?</p>
                    <button 
                      onClick={() => {
                        if (!user) { alert("Vui lòng đăng nhập để gửi đánh giá!"); router.push('/login'); return; }
                        setShowReviewForm(!showReviewForm);
                      }} 
                      className="btn-card-action"
                      style={{ padding: '12px 24px', fontSize: '14px' }}
                    >
                      {showReviewForm ? 'Hủy bỏ' : 'Viết Đánh Giá Của Bạn'}
                    </button>
                  </div>
                </div>

<<<<<<< HEAD
                {/* FORM GỬI ĐÁNH GIÁ */}
=======
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1.5px solid #bae6fd', marginBottom: '35px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#0c4a6e', fontSize: '16px', fontWeight: '800' }}>Gửi Nhận Xét & Đánh Giá Của Bạn</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e' }}>Đánh giá chất lượng:</span>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '26px', cursor: 'pointer' }} onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <i 
                            key={star} 
                            className={star <= (hoverRating || newRating) ? "fas fa-star" : "far fa-star"} 
                            style={{ color: star <= (hoverRating || newRating) ? '#f59e0b' : '#cbd5e1' }}
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                          ></i>
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: newRating > 0 ? '#0284c7' : '#94a3b8', fontWeight: '700' }}>
                        {newRating === 0 ? 'Vui lòng chọn số sao' : `${newRating} Sao - Rất hài lòng`}
                      </span>
                    </div>

                    <textarea 
                      required 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      placeholder="Hãy chia sẻ chi tiết trải nghiệm của bạn (chất lượng hình ảnh, độ mượt khi xem trên điện thoại, dịch vụ giao hàng...)" 
                      style={{ width: '100%', height: '110px', padding: '14px', borderRadius: '10px', border: '1.5px solid #bae6fd', outline: 'none', fontSize: '14px', resize: 'vertical', marginBottom: '15px' }}
                    ></textarea>

<<<<<<< HEAD
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1.5px solid #bae6fd', borderRadius: '8px', fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>
                        <i className="fas fa-camera"></i> {reviewImage ? 'Đã đính kèm ảnh' : 'Đính kèm hình ảnh'}
=======
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', color: '#475569', fontWeight: 'bold', transition: '0.2s' }}>
                        <i className="fas fa-camera" style={{ color: '#3b82f6' }}></i> Thêm ảnh
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                        <input type="file" accept="image/*" onChange={handleReviewImageUpload} style={{ display: 'none' }} />
                      </label>

                      <button type="submit" disabled={isSubmittingReview} className="btn-card-action" style={{ padding: '12px 28px', fontSize: '14px' }}>
                        {isSubmittingReview ? 'ĐANG GỬI...' : 'HOÀN TẤT & ĐĂNG BÌNH LUẬN'}
                      </button>
                    </div>

                    {reviewImage && (
                      <div style={{ marginTop: '12px', position: 'relative', display: 'inline-block' }}>
                        <img src={reviewImage} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bae6fd' }} />
                        <button type="button" onClick={() => setReviewImage('')} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                      </div>
                    )}
                  </form>
                )}

                {/* DANH SÁCH BÌNH LUẬN */}
                <h4 style={{ fontSize: '17px', color: '#0c4a6e', fontWeight: '800', marginBottom: '20px' }}>
                  Bình Luận Từ Khách Hàng
                </h4>
                
                {reviews.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px' }}>
                    Chưa có bài đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và để lại nhận xét nhé!
                  </div>
                ) : (
                  reviews.map((r, index) => {
                    const rName = r.customer_name || r.customer || r.username || 'Khách hàng';
                    const rRating = Number(r.rating || 5);
                    const rDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Mới đây';

                    return (
                      <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '17px', flexShrink: 0 }}>
                          {rName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '800', fontSize: '14.5px', color: '#0f172a' }}>{rName}</span>
                            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                              <i className="fas fa-check-circle"></i> Đã mua tại CIOs Camera
                            </span>
                          </div>
                          
<<<<<<< HEAD
                          <div style={{ color: '#f59e0b', fontSize: '12.5px', marginBottom: '6px' }}>
=======
                          <div style={{ color: '#f59e0b', fontSize: '13px', margin: '5px 0' }}>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                             {'★'.repeat(rRating)}{'☆'.repeat(5 - rRating)}
                          </div>
                          
                          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '4px 0' }}>{r.comment || r.content}</p>
                          
                          {r.image && (
                            <div style={{ marginTop: '10px' }}>
                              <img src={r.image} alt="Review attachment" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bae6fd', cursor: 'pointer' }} onClick={() => window.open(r.image, '_blank')} />
                            </div>
                          )}

                          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '8px' }}>
                            Đánh giá lúc {rDate}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. SẢN PHẨM TƯƠNG TỰ (GỢI Ý CÙNG DANH MỤC) */}
        {relatedProducts.length > 0 && (
<<<<<<< HEAD
          <div style={{ marginTop: '20px' }}>
            <div className="section-header-modern">
              <div className="section-title-modern">
                <span className="title-accent"></span>
                Sản Phẩm Tương Tự
              </div>
              <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>
                Cùng danh mục thiết bị
              </span>
            </div>

            <div className="products-grid-modern">
              {relatedProducts.map((p) => (
                <div className="product-card-modern" key={p._id || p.id}>
                  {isSaleDay && saleDiscount > 0 && <div className="card-badge-discount">-{saleDiscount}%</div>}
                  
                  <div className="card-img-wrapper">
                    <Link href={`/product/${p._id || p.id}`}>
                      <img src={p.image} alt={p.name} />
                    </Link>
                  </div>
                  
                  <div className="card-info-content">
                    <Link href={`/product/${p._id || p.id}`}>
                      <h3 className="card-product-title">{p.name}</h3>
                    </Link>
                    
                    <div className="card-price-container">
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span className="current-price">
                            {(Number(p.price) * (1 - saleDiscount / 100)).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="old-price">
                            {Number(p.price).toLocaleString('vi-VN')} đ
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
=======
          <div>
            <h2 className="section-title-center">CÓ THỂ BẠN SẼ THÍCH</h2>
            <div className="product-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {relatedProducts.map((p) => {
                return (
                  <div className="related-card" key={p._id || p.id} style={{ flex: 1, minWidth: '250px' }}>
                    {isSaleDay && saleDiscount > 0 && <div className="badge-discount">-{saleDiscount}%</div>}
                    
                    <div className="rc-img">
                      <Link href={`/product/${p._id || p.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={p.image} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </Link>
                    </div>
                    
                    <Link href={`/product/${p._id || p.id}`} style={{ textDecoration: 'none' }}>
                      <div className="rc-title">{p.name}</div>
                    </Link>
                    
                    <div className="rc-price-row">
                      {isSaleDay && saleDiscount > 0 ? (
                        <>
                          <span className="rc-old-price" style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '12px' }}>
                            {Number(p.price).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="rc-new-price" style={{ color: '#ef4444', fontWeight: '800', fontSize: '16px' }}>
                            {(Number(p.price) * (1 - saleDiscount / 100)).toLocaleString('vi-VN')} đ
                          </span>
                        </>
                      ) : (
                        <span className="rc-new-price" style={{ color: '#ef4444', fontWeight: '800', fontSize: '16px' }}>
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
                          {Number(p.price).toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                    
                    <div className="card-stock-label">
                      <i className="fas fa-check-circle"></i> Sẵn hàng: {p.quantity !== undefined && p.quantity !== null ? p.quantity : 0} cái
                    </div>

                    <Link href={`/product/${p._id || p.id}`} className="btn-card-action" style={{ textDecoration: 'none' }}>
                      <i className="fas fa-eye"></i> Xem Chi Tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BUTTONS */}
      <FloatingActions />

<<<<<<< HEAD
      {/* FOOTER */}
      <Footer />

      {/* MODAL PHÓNG TO HÌNH ẢNH TOÀN MÀN HÌNH (LIGHTBOX ZOOM) */}
      {isZoomModalOpen && (
        <div 
          onClick={() => setIsZoomModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(12, 74, 110, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '25px',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Nút đóng X */}
          <button 
            onClick={() => setIsZoomModalOpen(false)}
            style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            title="Đóng (ESC)"
          >
            &times;
          </button>

          {/* Tiêu đề & chỉ số ảnh */}
          <div style={{ color: 'white', textAlign: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {product.name}
            </h3>
            <span style={{ fontSize: '13px', color: '#bae6fd' }}>
              Ảnh {activeImageIndex + 1} / {productImages.length}
            </span>
          </div>

          {/* Khung ảnh to */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              position: 'relative', 
              maxWidth: '85vw', 
              maxHeight: '70vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              border: '2px solid #bae6fd'
            }}
          >
            <img 
              src={currentMainImg} 
              alt={product.name} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '62vh', 
                objectFit: 'contain', 
                borderRadius: '12px'
              }} 
            />

            {/* Nút lướt ảnh trái / phải trong modal */}
            {productImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImg}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0284c7',
                    border: '2px solid white',
                    color: 'white',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  title="Ảnh trước"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  onClick={handleNextImg}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0284c7',
                    border: '2px solid white',
                    color: 'white',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  title="Ảnh kế tiếp"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>

          {/* Dải Thumbnails trong Modal Zoom */}
          {productImages.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', gap: '12px', marginTop: '22px', flexWrap: 'wrap', justifyContent: 'center' }}
=======
      {/* 4. FLOATING BUTTONS (SỬA LẠI GIỐNG TRANG CHỦ) */}
      <div className="floating-buttons">
        <a href="https://zalo.me/0971024173" target="_blank" rel="noopener noreferrer" className="float-btn zalo">
          <i className="fas fa-comment-dots"></i> Chat Zalo
        </a>
        <a href="tel:0971024173" className="float-btn phone">
          <i className="fas fa-phone-alt"></i> 0971.024.173
        </a>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="float-btn up-top" 
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>

      {/* 5. FOOTER (SỬA LẠI GIỐNG TRANG CHỦ) */}
      <footer className="pro-footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3>CIOs - impossible is nothing</h3>
            <p>
              Đối tác tin cậy cung cấp giải pháp an ninh toàn diện. Cam kết sản
              phẩm chính hãng, dịch vụ tận tâm và hỗ trợ kỹ thuật trọn đời.
            </p>
            <div className="social-icons">
              <div className="social-btn" style={{ background: "#3b5998" }}>
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="social-btn" style={{ background: "#e1306c" }}>
                <i className="fab fa-instagram"></i>
              </div>
              <div className="social-btn" style={{ background: "#ff0000" }}>
                <i className="fab fa-youtube"></i>
              </div>
            </div>
            <div className="newsletter-box">
              <span>Đăng ký nhận khuyến mãi:</span>
              <div className="input-group">
                <input type="email" placeholder="Email của bạn..." />
                <button>GỬI</button>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>CHÍNH SÁCH HỖ TRỢ</h3>
            <ul className="footer-links">
              <li><span className="bullet">›</span> Chính sách bảo hành 24 tháng</li>
              <li><span className="bullet">›</span> Đổi trả 1-1 trong 30 ngày</li>
              <li><span className="bullet">›</span> Chính sách bảo mật thông tin</li>
              <li><span className="bullet">›</span> Hướng dẫn mua hàng online</li>
              <li><span className="bullet">›</span> Hướng dẫn thanh toán</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
            <div className="contact-row">
              <div className="icon-box">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <strong>Trụ sở chính:</strong>
                <p>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP. Hồ Chí Minh</p>
              </div>
            </div>
            <div className="contact-row">
              <div className="icon-box">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div>
                <strong>Hotline 24/7:</strong>
                <span className="hotline-text">0971.024.173</span>
              </div>
            </div>
            <div className="contact-row">
              <div className="icon-box">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <strong>Email hỗ trợ:</strong>
                <p>hotro@cameracb.com</p>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>BẢN ĐỒ CỬA HÀNG</h3>
            <div
              className="map-frame"
              style={{
                background: "#ccc",
                height: "150px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
              }}
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
            >
              {productImages.map((img, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: activeImageIndex === i ? '2.5px solid #38bdf8' : '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    background: 'white',
                    opacity: activeImageIndex === i ? 1 : 0.6,
                    padding: '4px',
                    transform: activeImageIndex === i ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
<<<<<<< HEAD
          )}
=======
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Công Ty TNHH CIOs - impossible is nothing. Giấy phép KD số: 0123456789.
>>>>>>> 083ad7c1a70f1fd081841d97908a4defe4ae5d96
        </div>
      )}
    </div>
  );
}