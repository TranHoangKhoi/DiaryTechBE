export const FARM_FAKE_DATA = [
  {
    id: 'farm-1',
    name: 'Hộ trồng Dâu',
    owner: 'Nguyễn Văn An',
    phone: '0901 111 111',
    cropId: 'dau',
    cropName: 'Dâu',
    cropType: 'fruit',
    area: 1.2,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Hộ trồng dâu quy mô nhỏ, năng suất ổn định.',
    reports: [
      { year: 2022, yield: 26 },
      { year: 2023, yield: 30 },
      { year: 2024, yield: 35 },
      { year: 2025, yield: 39 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, lên liếp mới' },
      { season: 'Hạ', year: 2023, result: 'Xuống giống, che mát gốc' },
      { season: 'Thu', year: 2023, result: 'Bón phân vi sinh định kỳ' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây thích nghi tốt với thổ nhưỡng'
      },

      { season: 'Xuân', year: 2024, result: 'Kích thích ra hoa tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái ổn định, ít rụng' },
      { season: 'Thu', year: 2024, result: 'Phòng trừ sâu bệnh sinh học' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch lứa sớm đạt chuẩn' },

      { season: 'Xuân', year: 2025, result: 'Phục hồi dinh dưỡng sau vụ' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đồng đều toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Trái to, vỏ đẹp' },
      { season: 'Đông', year: 2025, result: 'Sản lượng vượt kế hoạch' }
    ],
    updatedAt: '2026-01-10'
  },

  {
    id: 'farm-2',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Trần Thị Bích',
    phone: '0902 222 222',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 1.8,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Vườn sầu riêng đang cho trái ổn định.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-01-12'
  },

  {
    id: 'farm-3',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Lê Hoàng Minh',
    phone: '0903 333 333',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 2.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Hộ trồng măng cụt lâu năm.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-01-11'
  },

  {
    id: 'farm-4',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Phạm Thị Thu',
    phone: '0904 444 444',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 1.5,
    address: 'Phong Điền, Cần Thơ',
    status: 'warning',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Vườn chôm chôm cần cải tạo đất.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-01-05'
  },

  {
    id: 'farm-5',
    name: 'Hộ trồng Xoài',
    owner: 'Võ Văn Hùng',
    phone: '0905 555 555',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 1.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Vườn xoài canh tác theo chuẩn VietGAP.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-01-15'
  },

  {
    id: 'farm-6',
    name: 'Hộ trồng Dâu',
    owner: 'Nguyễn Thị Kim Ngân',
    phone: '0906 666 666',
    cropId: 'dau',
    cropName: 'Dâu',
    cropType: 'fruit',
    area: 1.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Vườn dâu canh tác sạch.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-01-09'
  },

  {
    id: 'farm-7',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Trần Quốc Khánh',
    phone: '0907 777 777',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 2.8,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Vườn sầu riêng diện tích lớn.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-01-18'
  },

  {
    id: 'farm-8',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Lê Thị Mỹ Linh',
    phone: '0908 888 888',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 1.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt đang vào mùa thu hoạch.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-01-20'
  },

  {
    id: 'farm-9',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Đặng Văn Phúc',
    phone: '0909 999 999',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 2.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Vườn chôm chôm sản lượng cao.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-01-22'
  },

  {
    id: 'farm-10',
    name: 'Hộ trồng Xoài',
    owner: 'Huỳnh Thị Diễm',
    phone: '0910 101 010',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Vườn xoài diện tích lớn.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-01-25'
  },

  {
    id: 'farm-11',
    name: 'Hộ trồng Dâu',
    owner: 'Nguyễn Thành Đạt',
    phone: '0911 111 111',
    cropId: 'dau',
    cropName: 'Dâu',
    cropType: 'fruit',
    area: 1.3,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Hộ trồng dâu ổn định.',
    reports: [
      { year: 2022, yield: 26 },
      { year: 2023, yield: 30 },
      { year: 2024, yield: 35 },
      { year: 2025, yield: 39 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, lên liếp mới' },
      { season: 'Hạ', year: 2023, result: 'Xuống giống, che mát gốc' },
      { season: 'Thu', year: 2023, result: 'Bón phân vi sinh định kỳ' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây thích nghi tốt với thổ nhưỡng'
      },

      { season: 'Xuân', year: 2024, result: 'Kích thích ra hoa tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái ổn định, ít rụng' },
      { season: 'Thu', year: 2024, result: 'Phòng trừ sâu bệnh sinh học' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch lứa sớm đạt chuẩn' },

      { season: 'Xuân', year: 2025, result: 'Phục hồi dinh dưỡng sau vụ' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đồng đều toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Trái to, vỏ đẹp' },
      { season: 'Đông', year: 2025, result: 'Sản lượng vượt kế hoạch' }
    ],
    updatedAt: '2026-01-13'
  },

  {
    id: 'farm-12',
    name: 'Hộ trồng Xoài',
    owner: 'Phạm Ngọc Hân',
    phone: '0912 121 212',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 2.2,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Vườn xoài thương phẩm.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-01-27'
  },

  {
    id: 'farm-13',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Trần Văn Tín',
    phone: '0913 131 313',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 3.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Vườn sầu riêng lâu năm.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-01-29'
  },

  {
    id: 'farm-14',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Lý Thị Thanh Thảo',
    phone: '0914 141 414',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 1.7,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt cho trái đều.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],

    updatedAt: '2026-01-30'
  },

  {
    id: 'farm-15',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Võ Minh Quân',
    phone: '0915 151 515',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 2.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Vườn chôm chôm thương phẩm.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-02-01'
  },

  {
    id: 'farm-16',
    name: 'Hộ trồng Xoài',
    owner: 'Nguyễn Thị Hồng Nhung',
    phone: '0916 161 616',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 2.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài canh tác theo hướng hữu cơ.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-02'
  },

  {
    id: 'farm-17',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Lê Quốc Bảo',
    phone: '0917 171 717',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 3.4,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Vườn sầu riêng diện tích rất lớn.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-03'
  },

  {
    id: 'farm-18',
    name: 'Hộ trồng Dâu',
    owner: 'Phan Thị Ánh Tuyết',
    phone: '0918 181 818',
    cropId: 'dau',
    cropName: 'Dâu',
    cropType: 'fruit',
    area: 1.4,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Vườn dâu áp dụng canh tác hữu cơ.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-04'
  },

  {
    id: 'farm-19',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Trần Đức Long',
    phone: '0919 191 919',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 1.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt phát triển tốt.',
    reports: [
      { year: 2022, yield: 26 },
      { year: 2023, yield: 30 },
      { year: 2024, yield: 35 },
      { year: 2025, yield: 39 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, lên liếp mới' },
      { season: 'Hạ', year: 2023, result: 'Xuống giống, che mát gốc' },
      { season: 'Thu', year: 2023, result: 'Bón phân vi sinh định kỳ' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây thích nghi tốt với thổ nhưỡng'
      },

      { season: 'Xuân', year: 2024, result: 'Kích thích ra hoa tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái ổn định, ít rụng' },
      { season: 'Thu', year: 2024, result: 'Phòng trừ sâu bệnh sinh học' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch lứa sớm đạt chuẩn' },

      { season: 'Xuân', year: 2025, result: 'Phục hồi dinh dưỡng sau vụ' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đồng đều toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Trái to, vỏ đẹp' },
      { season: 'Đông', year: 2025, result: 'Sản lượng vượt kế hoạch' }
    ],
    updatedAt: '2026-02-05'
  },

  {
    id: 'farm-20',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Bùi Thị Cẩm Vân',
    phone: '0920 202 020',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 2.3,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Vườn chôm chôm canh tác bài bản.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-06'
  },

  {
    id: 'farm-21',
    name: 'Hộ trồng Dâu',
    owner: 'Nguyễn Văn Trường',
    phone: '0921 212 121',
    cropId: 'dau',
    cropName: 'Dâu',
    cropType: 'fruit',
    area: 1.5,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Vườn dâu canh tác theo hướng hữu cơ.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-07'
  },

  {
    id: 'farm-22',
    name: 'Hộ trồng Xoài',
    owner: 'Võ Thị Thuỳ Dương',
    phone: '0922 222 222',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 2.4,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài thương phẩm chất lượng cao.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-08'
  },

  {
    id: 'farm-23',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Lê Anh Tuấn',
    phone: '0923 333 333',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 1.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm vào mùa thu hoạch.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-02-08'
  },

  {
    id: 'farm-24',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Đặng Thị Ngọc Mai',
    phone: '0924 444 444',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 2.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt cho trái ổn định.',
    reports: [
      { year: 2024, yield: 20 },
      { year: 2025, yield: 22 }
    ],
    seasons: [{ season: 'Hè', year: 2025, result: 'Tốt' }],
    updatedAt: '2026-02-09'
  },

  {
    id: 'farm-25',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Phạm Văn Sang',
    phone: '0925 555 555',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 3.2,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng năng suất cao.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },

  {
    id: 'farm-26',
    name: 'Hộ trồng Xoài',
    owner: 'Nguyễn Văn An',
    phone: '0912 111 111',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 2.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài cát trồng lâu năm, năng suất ổn định.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-27',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Trần Thị Bích',
    phone: '0933 222 222',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 1.8,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng Ri6, trái to, mùi vị đậm.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-28',
    name: 'Vườn Măng Cụt',
    owner: 'Lê Hoàng Minh',
    phone: '0907 333 333',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 2.4,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt vườn lâu năm, đất phù sa.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-29',
    name: 'Vườn Chôm Chôm',
    owner: 'Phạm Thị Thu',
    phone: '0977 444 444',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 1.5,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm trồng ven mương, trái sai.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-30',
    name: 'Vườn Dâu Hạ Châu',
    owner: 'Võ Văn Hùng',
    phone: '0988 555 555',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Dâu Hạ Châu đặc sản Phong Điền.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-31',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Nguyễn Thị Kim Ngân',
    phone: '0919 666 666',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 0.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng trồng xen canh, chăm sóc kỹ.',
    reports: [
      { year: 2024, yield: 10 },
      { year: 2025, yield: 12 }
    ],
    seasons: [{ season: 'Hè', year: 2025, result: 'Khá' }],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-32',
    name: 'Vườn Chôm Chôm',
    owner: 'Trần Quốc Khánh',
    phone: '0903 777 777',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 1.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm thu hoạch theo mùa.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-33',
    name: 'Vườn Măng Cụt',
    owner: 'Lê Thị Mỹ Linh',
    phone: '0966 888 888',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 0.8,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt vườn nhỏ, chất lượng cao.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-34',
    name: 'Vườn Dâu Hạ Châu',
    owner: 'Đặng Văn Phúc',
    phone: '0975 999 999',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.7,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Dâu Hạ Châu canh tác quy mô hộ gia đình.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-35',
    name: 'Hộ trồng Xoài',
    owner: 'Huỳnh Thị Diễm',
    phone: '0944 000 000',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài trồng tập trung, đầu ra ổn định.',
    reports: [
      { year: 2024, yield: 25 },
      { year: 2025, yield: 27 }
    ],
    seasons: [{ season: 'Xuân', year: 2025, result: 'Tốt' }],
    updatedAt: '2026-02-10'
  },

  {
    id: 'farm-36',
    name: 'Vườn Dâu Hạ Châu',
    owner: 'Nguyễn Văn Trường',
    phone: '0917 321 456',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.4,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Dâu Hạ Châu đặc sản Phong Điền, trái đều.',
    reports: [
      { year: 2022, yield: 26 },
      { year: 2023, yield: 30 },
      { year: 2024, yield: 35 },
      { year: 2025, yield: 39 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, lên liếp mới' },
      { season: 'Hạ', year: 2023, result: 'Xuống giống, che mát gốc' },
      { season: 'Thu', year: 2023, result: 'Bón phân vi sinh định kỳ' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây thích nghi tốt với thổ nhưỡng'
      },

      { season: 'Xuân', year: 2024, result: 'Kích thích ra hoa tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái ổn định, ít rụng' },
      { season: 'Thu', year: 2024, result: 'Phòng trừ sâu bệnh sinh học' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch lứa sớm đạt chuẩn' },

      { season: 'Xuân', year: 2025, result: 'Phục hồi dinh dưỡng sau vụ' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đồng đều toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Trái to, vỏ đẹp' },
      { season: 'Đông', year: 2025, result: 'Sản lượng vượt kế hoạch' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-37',
    name: 'Hộ trồng Xoài',
    owner: 'Trần Thị Cẩm Vân',
    phone: '0938 456 789',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài trồng tập trung, đầu ra ổn định.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-38',
    name: 'Vườn Măng Cụt',
    owner: 'Lê Quốc Bảo',
    phone: '0908 654 321',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 2.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: [],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt vườn lâu năm, chất lượng cao.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-39',
    name: 'Vườn Chôm Chôm',
    owner: 'Phan Thị Ánh Tuyết',
    phone: '0972 888 999',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 1.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm sai trái, thu hoạch theo mùa.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-40',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Bùi Văn Sang',
    phone: '0969 111 222',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 3.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng Ri6, năng suất cao.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],

    updatedAt: '2026-02-10'
  },

  {
    id: 'farm-41',
    name: 'Hộ trồng Dâu Hạ Châu',
    owner: 'Nguyễn Văn Tài',
    phone: '0912 410 041',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.4,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Dâu hạ châu trái đều, vị chua nhẹ.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-42',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Trần Văn Hưng',
    phone: '0939 420 042',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 3.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'GlobalGAP',
    certification: ['GlobalGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng Ri6 chất lượng cao.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-43',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Lê Thị Thanh Thúy',
    phone: '0908 430 043',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 3.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: ['Organic'],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt trồng theo hướng hữu cơ.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-44',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Phạm Văn Long',
    phone: '0975 440 044',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 2.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm vỏ đỏ, ngọt đậm.',
    reports: [
      { year: 2022, yield: 26 },
      { year: 2023, yield: 30 },
      { year: 2024, yield: 35 },
      { year: 2025, yield: 39 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, lên liếp mới' },
      { season: 'Hạ', year: 2023, result: 'Xuống giống, che mát gốc' },
      { season: 'Thu', year: 2023, result: 'Bón phân vi sinh định kỳ' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây thích nghi tốt với thổ nhưỡng'
      },

      { season: 'Xuân', year: 2024, result: 'Kích thích ra hoa tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái ổn định, ít rụng' },
      { season: 'Thu', year: 2024, result: 'Phòng trừ sâu bệnh sinh học' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch lứa sớm đạt chuẩn' },

      { season: 'Xuân', year: 2025, result: 'Phục hồi dinh dưỡng sau vụ' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đồng đều toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Trái to, vỏ đẹp' },
      { season: 'Đông', year: 2025, result: 'Sản lượng vượt kế hoạch' }
    ],

    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-45',
    name: 'Hộ trồng Xoài',
    owner: 'Nguyễn Thị Hồng Vân',
    phone: '0946 450 045',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.3,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài cát Hòa Lộc, thơm ngọt.',
    reports: [
      { year: 2024, yield: 28 },
      { year: 2025, yield: 30 }
    ],
    seasons: [{ season: 'Xuân', year: 2025, result: 'Rất tốt' }],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-46',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Đặng Văn Minh',
    phone: '0918 460 046',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 4.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng năng suất ổn định.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-47',
    name: 'Hộ trồng Dâu Hạ Châu',
    owner: 'Trần Thị Kim Ngân',
    phone: '0933 470 047',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.2,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: ['Organic'],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Dâu canh tác theo hướng sinh thái.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-48',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Võ Văn Lộc',
    phone: '0905 480 048',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 3.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm trái to, chín đều.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-49',
    name: 'Hộ trồng Xoài',
    owner: 'Lê Văn Dũng',
    phone: '0981 490 049',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.7,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'GlobalGAP',
    certification: ['GlobalGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài xuất khẩu, chất lượng cao.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-50',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Nguyễn Thị Bích Trâm',
    phone: '0926 500 050',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 3.2,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt trái lớn, ít sâu bệnh.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },

  // ===== FARM DETAILS 51 – 60 =====
  {
    id: 'farm-51',
    name: 'Hộ trồng Dâu Hạ Châu',
    owner: 'Nguyễn Văn Khánh',
    phone: '0918 451 051',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Vườn dâu hạ châu canh tác ổn định, trái đều.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-52',
    name: 'Hộ trồng Xoài',
    owner: 'Trần Thị Thu Hà',
    phone: '0936 452 052',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.5,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài trồng tập trung, đầu ra ổn định.',
    reports: [
      { year: 2024, yield: 26 },
      { year: 2025, yield: 28 }
    ],
    seasons: [{ season: 'Xuân', year: 2025, result: 'Tốt' }],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-53',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Lê Văn Tuấn',
    phone: '0907 453 053',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 4.2,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng sinh trưởng tốt, năng suất cao.',
    reports: [
      { year: 2022, yield: 27 },
      { year: 2023, yield: 31 },
      { year: 2024, yield: 36 },
      { year: 2025, yield: 41 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo hệ thống tưới tiêu' },
      {
        season: 'Hạ',
        year: 2023,
        result: 'Trồng cây con, theo dõi sinh trưởng'
      },
      { season: 'Thu', year: 2023, result: 'Bón phân khoáng kết hợp hữu cơ' },
      { season: 'Đông', year: 2023, result: 'Tán cây phát triển cân đối' },

      { season: 'Xuân', year: 2024, result: 'Điều chỉnh mật độ hoa' },
      { season: 'Hạ', year: 2024, result: 'Giữ trái đạt tỉ lệ cao' },
      { season: 'Thu', year: 2024, result: 'Kiểm soát nấm bệnh hiệu quả' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đúng thời điểm' },

      { season: 'Xuân', year: 2025, result: 'Tỉa cành tạo tán mới' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa tập trung theo kế hoạch' },
      { season: 'Thu', year: 2025, result: 'Chất lượng trái đồng đều' },
      { season: 'Đông', year: 2025, result: 'Giá bán cao, đầu ra tốt' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-54',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Phạm Thị Ngọc Anh',
    phone: '0945 454 054',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 3.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: ['Organic'],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt canh tác hữu cơ, trái đẹp.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-55',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Võ Văn Hùng',
    phone: '0972 455 055',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 2.9,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm ngọt, trái to.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-56',
    name: 'Hộ trồng Xoài',
    owner: 'Nguyễn Thị Mai',
    phone: '0915 456 056',
    cropId: 'xoai',
    cropName: 'Xoài',
    cropType: 'fruit',
    area: 3.8,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://cdn-i.vtcnews.vn/resize/1200x900//upload/2023/10/21/cay-xoai-1-21255441.jpg',
      'https://cdn3.ivivu.com/2023/10/v%C6%B0%E1%BB%9Dn-tr%C3%A1i-c%C3%A2y-%E1%BB%9F-Phong-%C4%90i%E1%BB%81n-ivivu-7.jpg',
      'https://images.baodantoc.vn/uploads/2024/Thang-5/Ngay-17/My-Thanh/Huong-dan-ky-thuat-trong-cay-xoai-dung-chuan-tu-A-Z-thich-hop-voi-nguoi-moi-2.jpg',
      'https://vnn-imgs-a1.vgcloud.vn/giadinh.mediacdn.vn/296230595582509056/2022/3/22/xoai2-164793445732553030718.jpg?width=260&s=cpVDh4gIrNhCt8FTrZGgOQ'
    ],
    description: 'Xoài canh tác theo tiêu chuẩn VietGAP.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-57',
    name: 'Hộ trồng Dâu Hạ Châu',
    owner: 'Trần Văn Phúc',
    phone: '0932 457 057',
    cropId: 'dau',
    cropName: 'Dâu Hạ Châu',
    cropType: 'fruit',
    area: 2.3,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Truyền thống',
    certification: [],
    images: [
      'https://statics.vinpearl.com/dau-ha-chau-3_1634056073.jpg',
      'https://statics.vinpearl.com/dac-san-da-chau-17_1634192926.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-6_1634056142.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-7_1634193930.jpg',
      'https://statics.vinpearl.com/dau-ha-chau-9_1634056304.jpg'
    ],
    description: 'Dâu trồng lâu năm, chất lượng ổn định.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-58',
    name: 'Hộ trồng Măng Cụt',
    owner: 'Lê Thị Cẩm Tú',
    phone: '0909 458 058',
    cropId: 'mang-cut',
    cropName: 'Măng cụt',
    cropType: 'fruit',
    area: 3.6,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'Hữu cơ',
    certification: ['Organic'],
    images: [
      'https://360fruit.vn/uploads/file/360%20fruit%20bai%20viet/mang-cut-2.jpg',
      'https://www.haithin.com/data/cms-image/AmThuc/Trai-Cay/hai-mang-cut3.jpg',
      'https://cdn.tgdd.vn/Files/2023/05/20/1530742/vuon-mang-cut-gan-nam-200-nam-tuoi-o-mien-tay-mo-cua-don-du-khach-202305201226240330.jpg',
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_9_28_638315291575947382_mang-cut-co-tac-dung-gi-0.jpg'
    ],
    description: 'Măng cụt trái to, vỏ mỏng.',
    reports: [
      { year: 2022, yield: 22 },
      { year: 2023, yield: 28 },
      { year: 2024, yield: 33 },
      { year: 2025, yield: 36 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Làm đất, xử lý mầm bệnh ban đầu' },
      { season: 'Hạ', year: 2023, result: 'Trồng cây giống, tưới giữ ẩm' },
      { season: 'Thu', year: 2023, result: 'Bón phân thúc sinh trưởng' },
      { season: 'Đông', year: 2023, result: 'Cây phát triển đồng đều' },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa theo lô' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái tốt, ít rụng sinh lý' },
      { season: 'Thu', year: 2024, result: 'Theo dõi sâu bệnh cuối vụ' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt sản lượng ổn định' },

      { season: 'Xuân', year: 2025, result: 'Bổ sung phân hữu cơ cải tạo đất' },
      { season: 'Hạ', year: 2025, result: 'Hoa ra đồng đều, khỏe mạnh' },
      { season: 'Thu', year: 2025, result: 'Trái chín đều, hương vị tốt' },
      { season: 'Đông', year: 2025, result: 'Doanh thu tăng so với năm trước' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-59',
    name: 'Hộ trồng Sầu Riêng',
    owner: 'Nguyễn Văn Đạt',
    phone: '0986 459 059',
    cropId: 'sau-rieng',
    cropName: 'Sầu riêng',
    cropType: 'fruit',
    area: 4.1,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://sofri.org.vn/uploads/tin-tuc/2021_06/sau-rieng-mang.jpg',
      'https://vaas.vn/sites/default/files/inline-images/IMG_20200603_111659_1.jpg',
      'https://vifood.com.vn/uploads/file/thumb1-1200x676-14.jpg',
      'https://vinatt.com/upload/product/sau-rieng-ri6-1-crop-1800.jpg'
    ],
    description: 'Sầu riêng Ri6, năng suất cao.',
    reports: [
      { year: 2022, yield: 25 },
      { year: 2023, yield: 33 },
      { year: 2024, yield: 37 },
      { year: 2025, yield: 42 }
    ],
    seasons: [
      {
        season: 'Xuân',
        year: 2023,
        result: 'Cải tạo vườn theo tiêu chuẩn VietGAP'
      },
      { season: 'Hạ', year: 2023, result: 'Theo dõi sinh trưởng từng cây' },
      { season: 'Thu', year: 2023, result: 'Bón phân cân đối NPK' },
      {
        season: 'Đông',
        year: 2023,
        result: 'Cây phát triển ổn định, khỏe mạnh'
      },

      { season: 'Xuân', year: 2024, result: 'Xử lý ra hoa có kiểm soát' },
      { season: 'Hạ', year: 2024, result: 'Tỉa trái, giữ mật độ hợp lý' },
      { season: 'Thu', year: 2024, result: 'Chăm sóc trái giai đoạn cuối' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt năng suất khá' },

      { season: 'Xuân', year: 2025, result: 'Dưỡng cây sau vụ thu hoạch' },
      { season: 'Hạ', year: 2025, result: 'Ra hoa đúng lịch canh tác' },
      { season: 'Thu', year: 2025, result: 'Trái đạt kích thước tiêu chuẩn' },
      { season: 'Đông', year: 2025, result: 'Hiệu quả kinh tế cao' }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'farm-60',
    name: 'Hộ trồng Chôm Chôm',
    owner: 'Phan Thị Thanh Hương',
    phone: '0941 460 060',
    cropId: 'chom-chom',
    cropName: 'Chôm chôm',
    cropType: 'fruit',
    area: 3.0,
    address: 'Phong Điền, Cần Thơ',
    status: 'active',
    farmingModel: 'VietGAP',
    certification: ['VietGAP'],
    images: [
      'https://vcdn1-suckhoe.vnecdn.net/2026/01/05/chomchom-1767600353-1767600371-3416-1767600388.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=mgGBMyVXnNScHqzDlYde9g',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-1-1024x683.jpg',
      'https://vietnga.vn/wp-content/uploads/2024/06/bon-phan-cay-chom-chom-4-1024x575.jpg'
    ],
    description: 'Chôm chôm canh tác tập trung.',
    reports: [
      { year: 2022, yield: 24 },
      { year: 2023, yield: 29 },
      { year: 2024, yield: 34 },
      { year: 2025, yield: 38 }
    ],
    seasons: [
      { season: 'Xuân', year: 2023, result: 'Cải tạo đất bằng phân chuồng ủ' },
      { season: 'Hạ', year: 2023, result: 'Ổn định cây giống sau trồng' },
      { season: 'Thu', year: 2023, result: 'Tăng cường vi lượng cho rễ' },
      { season: 'Đông', year: 2023, result: 'Sinh trưởng mạnh, ít sâu bệnh' },

      { season: 'Xuân', year: 2024, result: 'Ra hoa theo chu kỳ tự nhiên' },
      { season: 'Hạ', year: 2024, result: 'Đậu trái cao hơn vụ trước' },
      { season: 'Thu', year: 2024, result: 'Theo dõi độ lớn của trái' },
      { season: 'Đông', year: 2024, result: 'Thu hoạch đạt chuẩn xuất bán' },

      {
        season: 'Xuân',
        year: 2025,
        result: 'Bổ sung dinh dưỡng sau thu hoạch'
      },
      { season: 'Hạ', year: 2025, result: 'Hoa nở đồng loạt toàn vườn' },
      { season: 'Thu', year: 2025, result: 'Mẫu mã trái đẹp, ít hao hụt' },
      { season: 'Đông', year: 2025, result: 'Năng suất cao, ổn định' }
    ],
    updatedAt: '2026-02-10'
  }
];
