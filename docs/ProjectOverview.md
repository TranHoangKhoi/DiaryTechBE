# Tài liệu Tổng quan Dự án DiaryTechBE

## 1. Giới thiệu
**DiaryTechBE** là một hệ thống Backend được xây dựng trên nền tảng **Node.js, Express và TypeScript**. Dự án này cung cấp các API RESTful phục vụ cho các nghiệp vụ quản lý nông trại, ghi chép nhật ký sản xuất, bản đồ, quản lý người dùng, phân quyền và các gói đăng ký dịch vụ (Subscription).

*(Lưu ý: Đây là dự án Backend thuần, không bao gồm giao diện người dùng (UI), phần Frontend có thể nằm ở một repository hoặc thư mục khác)*.

## 2. Các Thư viện & Công nghệ Chính (Dependencies)
Dựa theo `package.json`, dưới đây là các công nghệ và thư viện lõi đã được sử dụng:
- **Ngôn ngữ & Framework**: `typescript`, `express`, `node.js`
- **Cơ sở dữ liệu**: `mongoose` (trình bao bọc MongoDB, dùng để định nghĩa Models, kết nối CSDL).
- **Bảo mật & Xác thực**: `bcrypt` (mã hoá mật khẩu), `jsonwebtoken` (tạo và kiểm tra JWT Token), `helmet` (bảo vệ HTTP headers bảo mật), `cors` (quản lý truy cập chéo miền - Cross Origin).
- **Validation**: `zod` (Xác thực dữ liệu đầu vào mạnh mẽ).
- **Xử lý File/Media**: `multer` (Upload file form-data), `cloudinary` (Lưu trữ và quản lý ảnh/video trên Cloud).
- **Utilities**: `dotenv` (quản lý biến môi trường), `express-rate-limit` (giới hạn Request, chống Spam/DDoS).

## 3. Cấu trúc Thư mục Hệ thống (Project Structure)
Dự án được cấu trúc theo mô hình **MVC (Models - Controllers - Routes)** chia tách logic rất rõ ràng:

```text
DiaryTechBE/
├── dist/                  # Thư mục build (chứa code JS đã được compile từ TS)
├── docs/                  # Thư mục chứa tài liệu (Md files)
├── src/                   # Thư mục mã nguồn chính
│   ├── addressConvert/    # Các tiện ích/hàm chuyển đổi địa chỉ thành tọa độ hoặc ngược lại
│   ├── config/            # Cấu hình hệ thống (như kết nối DB - db.ts)
│   ├── controllers/       # Nơi chứa toàn bộ logic xử lý request/response cho từng API
│   ├── middleware/        # Chứa các middleware (auth, upload, rate limit,...)
│   ├── models/            # Schema định nghĩa cấu trúc dữ liệu MongoDB (Mongoose Schema)
│   ├── routes/            # Định nghĩa các endpoint (URL route)
│   ├── types/             # Định nghĩa Type/Interface tĩnh của TypeScript
│   ├── app.ts             # Khởi tạo Express app, gắn các global Middleware & tổng hợp Routes
│   └── index.ts           # Điểm đầu vào (Entry point), load biến môi trường, kết nối DB & Start Server
├── .env.local             # Biến môi trường chạy local
├── .env.production        # Biến môi trường chạy production
├── package.json           # Danh sách các thư viện và các scripts run/build
└── tsconfig.json          # Cấu hình cho TypeScript
```

## 4. Danh sách các API Routes & Controllers
Hệ thống API được tổ chức xoay quanh các đối tượng nghiệp vụ chính yếu của hệ sinh thái Nông nghiệp / Nhật ký sản xuất. Tại `src/app.ts`, các route được đăng ký qua tiền tố gốc `/api/...`

### 4.1. Hệ thống User & Xác thực (Authentication)
- **`/api/auth`**: Liên kết tới `auth.route.ts` & `auth.controller.ts`. Chứa các API Đăng nhập, Đăng ký, Quên mật khẩu.
- **`/api/users`**: Liên kết tới `user.route.ts` & `user.controller.ts`. Các API lấy thông tin người dùng, cập nhật profile...
- **`/api/owner`**: Liên kết tới `owner.route.ts`. API riêng biệt thao tác nội bộ liên quan đến chủ sở hữu hệ thống.

### 4.2. Hệ thống Nông trại (Farm System)
- **`/api/farm`**: Xử lý tạo, sửa, xoá và lấy danh sách nông trại (`farm.controller.ts`).
- **`/api/farmtype`**: Các loại hình nông trại (Trồng trọt, chăn nuôi, thuỷ sản...).
- **`/api/farmtypeConfig`**: API cấu hình chuyên sâu cho từng loại hình nông trại.
- **Thực thể liên quan**: `FarmCrop` (Mùa vụ/Cây trồng), `FarmMedia` (Hình ảnh/Video nông trại).

### 4.3. Nhật ký & Vận hành Sản xuất (Production & Logs)
- **`/api/productionBook`**: Quản lý Sổ tay sản xuất / Nhật ký ghi lại các đợt canh tác (`productionBook.controller.ts`).
- **`/api/productionLogs`**: API lưu trữ các "Log" hằng ngày, báo cáo của từng đợt sản xuất/canh tác.
- **`/api/activity`**: Danh mục các hoạt động tác động trên nông trại (như: bón phân, tưới nước, xịt thuốc...).
- **`/api/crop`**: API quản lý các Hạng mục Cây trồng (`cropCategories.route.ts`).
- **Báo cáo**: `productionReport.controller.ts` để tổng hợp số liệu báo cáo sản xuất.

### 4.4. Hệ thống Gói đăng ký (Subscription Modules)
- **`/api/subscriptionPackage`**: Các gói đăng ký (Free, Pro, Enterprise,...).
- **`/api/userSubscription`**: API quản lý thông tin mà một người dùng đang đăng ký.
- **`/api/serviceModule`**: Quản lý các module dịch vụ con đi kèm trong từng gói đăng ký (Ví dụ: Module bản đồ, Module nhật ký,...).

### 4.5. Map (Bản đồ)
- **`/api/map`**: Lấy thông tin vùng miền, đo đạc, tạo lớp phủ hiển thị trạng thái của khu đất trên bản đồ GIS/Google Map.

## 5. Danh sách các Models (Database Schema)
Các schema Mongoose nằm trong `src/models/`, xác định cấu trúc DB của dự án:
1. **User.model.ts**: Tài khoản hệ thống (Email, pass, role).
2. **Farm.model.ts**: Lưu trữ vị trí, chủ sở hữu, thông tin nông trại.
3. **Farmtype.model.ts** & **FarmTypeConfig.model.ts**: Hệ sinh thái các loại hình canh tác.
4. **FarmCrop.model.ts** & **CropCategories.ts**: Loại cây trồng và mùa vụ canh tác.
5. **FarmMedia.ts**: Liên kết file/hình ảnh tải lên cho Farm.
6. **ProductionBook.model.ts** & **ProductionLogs.model.ts**: Các quyển sổ sản xuất và các bản ghi nhật ký.
7. **Activities.model.ts**: Từng hoạt động thao tác chăm sóc.
8. **SubscriptionPackage.model.ts** & **UserSubscription.model.ts** & **PackageSubscription.model.ts** & **ServiceModule.model.ts**: Kiến trúc Bán dịch vụ SaaS (Software as a Service) của dự án.
9. **ProductionReport.ts**: Lưu trữ báo cáo tóm tắt.

## 6. Các Middleware Quan Trọng
1. **`auth.midleware.ts`**:
   - Thường lấy Token từ Header (`Authorization: Bearer <token>`).
   - Sử dụng `jsonwebtoken` để verify tính hợp lệ.
   - Attach thông tin user (`req.user`) để các Controller mượn quyền truy xuất.
2. **`upload.midleware.ts`**:
   - Sử dụng `multer` hứng file (form-data).
   - Có thể tích hợp đẩy thẳng trực tiếp lên Cloud (ví dụ `cloudinary`) thông qua custom storage.

## 7. Quy trình Chạy & Develop (Run Scripts)
Trong `package.json` đã được setup các lệnh chính:
- **`npm run dev`**: Chạy môi trường local với `nodemon` để auto-reload mỗi khi file thay đổi.
- **`npm run build`**: Xóa tệp `dist/` cũ (`rimraf`), dùng `tsc` để biên dịch sang thư mục `dist`.
- **`npm start`**: Lấy code từ thư mục `dist/index.js` chạy trên production.
- **`npm run lint` / `prettier`**: Check và fix chuẩn format code theo ESLint và Prettier.

---
**Tổng kết:**
Dự án **DiaryTechBE** là một hệ thống Backend hoàn thiện, kiến trúc tốt với tư duy **SaaS** rõ nét, chia nhỏ thành phần rõ ràng: Hệ thống Core Farm, Nhật ký sản xuất, Bản đồ (GIS), và Monetization/Subscription (kiếm tiền qua các gói cước). Việc theo sát MVC sẽ giúp bạn dễ dàng maintain bảo trì, phát triển thêm các module API mới tại các folder tương ứng của `src`.
