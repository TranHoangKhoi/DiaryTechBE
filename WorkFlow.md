# API_CODE_FLOW.md

## 1. Tổng quan source API
- Backend dùng framework gì: **Express.js** chạy trên môi trường **Node.js**.
- Ngôn ngữ đang dùng: **TypeScript** (được build ra JavaScript qua `tsc` và `tsc-alias`).
- Entry point chính: `src/index.ts`.
- App/server được khởi tạo ở file: `src/app.ts`.
- Port lấy từ đâu: Thông qua biến môi trường `process.env.PORT`, nếu không có sẽ dùng mặc định là `3000`.
- Database đang dùng là gì: **MongoDB** thông qua thư viện ODM **Mongoose**.
- Vai trò của source API: Cung cấp hệ thống RESTful API đóng vai trò xử lý logic nghiệp vụ trung tâm, tương tác với Database để lưu trữ dữ liệu, xác thực, và cung cấp dữ liệu JSON cho các frontend (Web/Mobile) của dự án FullstackDiary.
- Các package quan trọng đang dùng:
  - `express`: Framework server chính.
  - `mongoose`: Giao tiếp với MongoDB.
  - `jsonwebtoken` & `bcrypt`: Dùng cho xác thực (Authentication).
  - `zod`: Dùng để validate dữ liệu đầu vào (Request body, query).
  - `multer` & `cloudinary`: Xử lý upload file và lưu trữ ảnh trên mây.
  - `helmet`, `cors`, `express-rate-limit`: Security, chống spam và bảo mật headers.

## 2. Flow khởi chạy server
Phân tích từ lúc gõ lệnh:
```text
npm run dev (hoặc npm start)
 -> Chạy file src/index.ts
 -> Gọi thư viện dotenv để load env từ .env.local / .env.production
 -> Gọi hàm connectDB() (import từ src/config/db.ts) để kết nối Database
 -> Khởi tạo Express app bằng cách import từ src/app.ts
 -> File src/app.ts sẽ gắn Global Middleware (helmet, cors, rateLimit, express.json)
 -> File src/app.ts tiếp tục register các Routes chính (VD: app.use('/api/auth', authRoutes))
 -> Gọi lệnh app.listen(PORT) chạy HTTP Server
```
- **Xử lý lỗi khởi chạy**: Tại `src/index.ts`, hàm `connectDB()` được wrap bằng Promise. Lỗi sẽ rơi vào khối `.catch()`, in ra log `❌ Failed to connect to DB: [Lỗi]` và sau đó đóng luôn server bằng lệnh `process.exit(1)`.

## 3. Cấu trúc thư mục quan trọng
- **`src/index.ts`**: Entry point thực thi kết nối DB và listen port.
- **`src/app.ts`**: Cấu hình Express app, định nghĩa middleware global và tổng hợp endpoint từ thư mục routes. Khi cần thêm gốc API module mới thì bổ sung tại đây.
- **`src/routes/`**: Chứa các file định nghĩa HTTP endpoints (method, url) và gán middleware, controller tương ứng (VD: `auth.route.ts`).
- **`src/controllers/`**: Là nơi xử lý request HTTP thực tế. Nhận request, validate dữ liệu thông qua Zod, gọi models hoặc services, sau đó trả Response. Codex bắt đầu từ đây để sửa logic API.
- **`src/models/`**: Nơi chứa cấu trúc Schema MongoDB (Mongoose Schema) kèm theo TypeScript Interfaces. Khi thêm bảng hoặc trường CSDL thì sửa ở đây.
- **`src/services/`**: Nơi tập hợp các function chứa business logic dùng chung, gọi DB phức tạp để Controller tái sử dụng (VD: `subscriptionAccess.service.ts`).
- **`src/middleware/`**: Chứa các hàm middleware kiểm tra token, kiểm tra role hoặc xử lý upload (VD: `auth.midleware.ts`, `upload.midleware.ts`).
- **`src/config/`**: Lưu trữ các file cấu hình như kết nối CSDL `db.ts` hoặc config của thư viện bên thứ 3.
- **`farmseed/`**: Thư mục chứa các script chạy một lần, migrate hoặc seed dữ liệu mẫu vào DB.

## 4. Config và environment
- File cấu hình: Biến môi trường được đọc từ `.env.local` (nếu chạy local dev) và `.env.production` (khi build cho production) do setup trong `src/index.ts`.

| Biến môi trường | File sử dụng | Mục đích | Bắt buộc |
|-----------------|-------------|----------|----------|
| `PORT` | `src/index.ts` | Port mà HTTP server sẽ khởi chạy | Không (mặc định 3000) |
| `NODE_ENV` | `src/index.ts` | Switch cấu hình load env cho dev hay production | Không |
| `MONGO_URI` | `src/config/db.ts` | Connection string kết nối Database MongoDB | Có |
| `JWT_SECRET` | `src/middleware/auth.midleware.ts`, `auth.controller.ts` | Khóa bí mật dùng để sign và verify JWT Token | Có |
*(Lưu ý: Không liệt kê giá trị thật để đảm bảo an toàn bảo mật, các biến trên chỉ mang tính khai báo cấu trúc)*

## 5. Database connection
- File xử lý: Kết nối được cấu hình tại `src/config/db.ts`.
- Thư viện: Sử dụng **MongoDB** thông qua Object Data Modeling (ODM) là **Mongoose**.
- Nguồn URI: Chuỗi URI lấy từ biến môi trường `process.env.MONGO_URI`.
- Xử lý lỗi: Sử dụng Try/Catch, nếu `mongoose.connect()` lỗi sẽ báo ra Terminal `MongoDB connection error: ...` và thực hiện `process.exit(1)`.
- Seed/Migration: Có hỗ trợ các script như `farmseed/seedMapAssistantContents.ts` hay `farmseed/normalizeInventoryData.ts`, chạy thủ công thông qua scripts trong `package.json`.

## 6. Model / Schema
### Model: User
- File: `src/models/User.model.ts`
- Collection/Table: `users` (tên tự động số nhiều).
- Field chính: `phone` (unique), `password`, `name`, `external_id` (unique), `role`, `status`, `allowed_modules`, `owner_id`.
- Quan hệ: Liên kết chính nó qua `owner_id` (áp dụng cho dạng tài khoản phụ thuộc `sub_account`).
- Middleware/hook:
  - `pre('validate')`: Kiểm tra role, random tự động chuỗi `external_id` duy nhất.
  - `pre('save')`: Hash cột mật khẩu tự động bằng hàm của `bcrypt` (kèm genSalt 10).
- Được sử dụng ở: `auth.controller.ts`, `user.controller.ts`.
- Ghi chú: Kèm theo Type interface `IUser` cho Typescript và hàm helper `comparePassword()` để verify mật khẩu.

*(Hệ thống còn các Model nghiệp vụ Farm, ProductionLogs, Inventory, Map... sử dụng cú pháp Mongoose Schema tương tự).*

## 7. Route overview
Đây là một số endpoint đại diện điển hình phân tích từ source:

| Method | Endpoint | Route file | Controller/function | Middleware | Auth required | Mục đích |
|--------|----------|------------|---------------------|------------|---------------|----------|
| POST | `/api/auth/login` | `auth.route.ts` | `auth.controller.login` | Không | Không | Kiểm tra sđt/pass và trả về JWT |
| POST | `/api/auth/register` | `auth.route.ts` | `auth.controller.register` | (Optional Auth) | Tùy role | Đăng ký tài khoản hệ thống |
| GET | `/api/auth/profile` | `auth.route.ts` | `auth.controller.getUserProfile`| `auth` | Có | Đọc JWT lấy profile user hiện hành |
| GET | `/api/checkHeath` | `app.ts` | (Inline) | Không | Không | Endpoint Ping check server uptime |
| GET/POST/PUT | `/api/users/*` | `user.route.ts` | `user.controller.*` | `auth`, `checkRole` | Có | API cho Admin quản lý tài khoản |
| GET/POST/PUT | `/api/farm/*` | `farm.route.ts` | `farm.controller.*` | `auth` | Có | API quản lý các Nông trại |
*(Các route liên tục được gắn prefix path thông qua cấu hình `app.use()` ở `app.ts`)*

## 8. Middleware flow
Toàn bộ middleware logic tự custom nằm trong `src/middleware/`:

- **Middleware `auth`** (`auth.midleware.ts`): Bóc tách token từ header `Authorization: Bearer <token>`, dùng `jwt.verify()` check xem hợp lệ không. Sau đó lấy user context (quyền, module truy cập thông qua Service `getAccessContextByUserId`) và gán vào Object `req.user`.
  - Output: Chạy lệnh `next()`.
  - Lỗi: Trả về HTTP `401 Unauthorized` hoặc `401 Invalid token`, nếu account bị ngưng trả `403 User is not active`.
- **Middleware `optionalAuth`** (`auth.midleware.ts`): Giống hệt `auth` nhưng nếu token không có thì vẫn cho pass qua (next) với `req.user = undefined`, không báo lỗi.
- **Middleware `checkRole(role)`**: Chặn theo enum role. Superadmin luôn được bỏ qua. Nếu request role không khớp thì trả lỗi `403 Forbidden`.
- **Middleware `requireModuleAccess(moduleKey)`**: Chặn theo phân quyền gói subscription. So khớp moduleKey cần vào với danh sách `req.user.accessibleModules`.
- **Global Middleware**: `helmet()` (Security Header), `cors({ origin: '*' })` (Mở CORS rộng), `express-rate-limit` (100 req/ 15 phút, nằm ở `app.ts`).

## 9. Authentication / Authorization flow
**Login Flow (Xác thực JWT):**
```text
Client gửi POST /api/auth/login (Body: phone, password)
 -> Controller bắt Request
 -> Zod validation (Đảm bảo số điện thoại và mật khẩu đủ chuẩn)
 -> Model truy vấn MongoDB: Mongoose `User.findOne({ phone })`
 -> Controller check trạng thái status user
 -> Gọi Model method `user.comparePassword(password)` mã hóa bcrypt compare
 -> Nếu khớp, gọi jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1y' })
 -> Lấy thêm thông tin quyền qua Helper `buildAuthResponse`
 -> Phản hồi JSON chứa { token, user: {...} }
 -> Web/Mobile Client nhận và lưu tự do token phục vụ cho API tiếp theo
```
**Authorization Flow (Phân quyền):**
Với token nhận được, client gắn vào header gửi lên. Middleware `auth` gắn role vào `req.user`. Middleware tiếp theo trên Route (`checkRole` hoặc `requireModuleAccess`) sẽ chốt hạ xem user đó có được đụng vô function nghiệp vụ này không.

## 10. Validation flow
- **Thư viện chính**: Sử dụng cấu trúc schema của thư viện **Zod** (`z`).
- **Nơi đặt schema**: Trong backend này, thay vì tách ra thư mục Schema riêng, lập trình viên đang nhét trực tiếp các khối `z.object({ ... })` lên trên cùng của file Controller (Ví dụ: `loginSchema`, `registerSchema` định nghĩa bên trong `auth.controller.ts`).
- **Luồng validate**: Tại đầu API Controller, gọi thẳng câu lệnh `schema.parse(req.body)`. Nếu data chuẩn, chạy tiếp code. Nếu data sai, zod tự văng lỗi `ZodError` rơi thẳng vào khối `catch(error)`.
- **Phản hồi lỗi**: Trả về `400 Validation error` kèm danh sách mảng lỗi cụ thể theo field. Message tiếng Việt hoặc tiếng Anh định nghĩa cứng trong Zod.

## 11. Controller flow
### Controller: authController.login
- Route: HTTP POST `/api/auth/login`
- Input: `req.body` chứa `phone` và `password`.
- Xử lý: Parse body qua schema -> Query User DB -> Check Hash Pass -> Generate Token -> Gen Response.
- Gọi Model/Service: Gọi tới Model `User` và service module quyền (`getAccessContextByUserId`).
- Response success: HTTP 200 JSON `{ token, user: {...} }`.
- Response error: HTTP 400 nếu sai pass/validation, 403 bị khoá, 500 lỗi catch nhánh khác.

## 12. Service / Business logic flow
- Backend có áp dụng Service Layer cho những tính năng xâu chuỗi thông tin phức tạp.
- Các Function nằm ở thư mục `src/services/` (VD: `subscriptionAccess.service.ts`).
- Business logic như gói module trả phí (Subscription), tính toán user sub-account được thừa hưởng quyền từ owner sẽ dồn qua service xử lý để Controller trông sạch gọn hơn. Controller nhận tham số và chuyển cho Service, Service chạy lệnh query DB trả giá trị Boolean hoặc Mảng cho Controller if/else phản hồi.

## 13. API response format
Backend trả về Data dạng JSON trực tiếp thông qua hàm `res.json()` của Express.

| Loại response | Format | Ghi chú / File |
|---------------|--------|-----------------------|
| Success | Trả về `{ success: true, message: "...", data: object }` hoặc trả thẳng Object Data (tuỳ API). | Dựa trên code từng controller. |
| Error Catch | `{ message: string, errors?: [] }` | Code rẽ vào khối catch trả error |
| Pagination | Dùng query `page` & `limit` truyền vào hàm mongoose | Không có helper phân trang chuẩn chung bắt buộc |

Format message đang dùng Tiếng Việt (Ví dụ: "Số điện thoại hoặc mật khẩu không đúng") trộn lẫn với Tiếng Anh ("Server error" hay "Validation error").

## 14. Flow CRUD chính
### Quản lý Nhật ký sản xuất (ProductionLogs)
Routes: CRUD API dạng `/api/productionLogs/`

Flow tiêu chuẩn:
```text
Client request API Lấy/Thêm/Sửa Nhật ký
 -> Route gắn Middleware Auth -> req.user
 -> Controller (productionLogs.controller.ts)
 -> Kiểm tra dữ liệu (Query filter, Payload body bằng Zod nếu có)
 -> Thao tác Mongoose Model: ProductionLogs.find( { farm_id: ... } )
 -> Thao tác DB MongoDB
 -> Nhận Array records về Controller
 -> Express Router Response (res.status(200).json(...))
```
- **Lưu ý nghiệp vụ**: Dữ liệu có tính Multi-tenant (Farm). Controller thường phải kẹp theo ID của farm hoặc owner để đảm bảo tính cô lập, không lấy lộn data nhật ký người khác (Bảo mật).

## 15. Upload/file/static flow nếu có
- **API có Upload**: Có hỗ trợ. Nằm ở router `file.route.ts` gọi đến `file.controller.ts`.
- **Thư viện sử dụng**: `multer` để xử lý FormData stream trên Express, và đẩy vào SDK `cloudinary` để lưu thẳng file lên Cloud, không lưu ảnh xuống Ổ đĩa vật lý của Server dài hạn.
- **Config**: Setup Cloudinary cấu hình giấu trong config riêng lấy keys từ env (`cloudinary.ts` nằm ở `src/config/`).

## 16. Realtime/socket/notification nếu có
- "Chưa xác định từ code API hiện tại": Mã nguồn API hiện tại thuần thiết kế RESTful thông qua Express Route, không có thiết lập `socket.io` hay `ws` socket trên server, không có code lắng nghe WebSockets cho Notifications Realtime.

## 17. Error handling flow
- **Luồng xử lý lỗi**: Không áp dụng pattern Global Error Handling Middleware ở `app.ts`. Thay vào đó, backend dùng trực tiếp block `try/catch` ở phía trong từng phương thức của Controller.
- Nếu có lỗi sẽ tự in ra `console.log(error)` và trả tay response `res.status(500).json({ message: 'Server error' })`. Lỗi validation Zod trả `400`.
- Có thể crash server: Lỗi nặng nhất nếu sai DB connection URI khi Boot server, code sẽ in log và `process.exit(1)`.

## 18. Security notes
- **CORS**: File `app.ts` đang set `cors({ origin: '*' })` cho phép bất kì thiết bị web nào cũng gọi được API (Thuận tiện lúc Dev, nhưng cần chú ý nếu release lên Prod).
- **Phòng chống dò pass/DDOS**: Có gắn `helmet()` bảo vệ HTTP response headers, và `express-rate-limit` chặn 100 requests / 15 phút chống spam flood API.
- **Password / JWT**: Hash bằng `bcrypt` an toàn. Token xài thuật toán chuẩn sign bằng secret từ biến môi trường, không hardcode.

## 19. Performance / database notes
- Index Database: File Model đã được chú trọng khai báo `index: true` hoặc `Schema.index(...)` tại các trường quan trọng phục vụ sort hay query lớn (VD: `created_at`, `external_id`).
- Có phân trang ở các Controller Listing qua hàm `skip()` / `limit()` của Mongoose.

## 20. Quy ước code backend
- Đặt tên File:
  - Route: `[tên].route.ts` (camelCase)
  - Controller: `[tên].controller.ts`
  - Model: `[TênModel].model.ts` (PascalCase cho model, VD: `User.model.ts`)
- Code Style: Function dạng Arrow Function `const xyz = async (req: Request, res: Response) => {}`. Sử dụng chuẩn ES Module `export const...`.
- Tổ chức Validation: Ném trực tiếp schema Zod lên phía trên các hàm Controller thay vì tách folder riêng.

## 21. Những điểm Codex cần lưu ý khi sửa API
- **Khi thêm model CSDL mới**: Hãy vào thư mục `src/models/`, tạo file Schema Mongoose mới và khai báo TS Interfaces, sau đó kiểm tra thiết lập Index phù hợp.
- **Khi sửa validation**: Kiểm tra và tìm sửa ở ngay trong file `[name].controller.ts` của controller đó vì code dự án này không tách schema riêng biệt.
- **Khi thêm Endpoint API mới**: Bắt buộc phải thêm Route vào `src/routes/` và phải đăng ký nhánh router con đó trong `src/app.ts` (`app.use()`) thì API mới chạy. Nhớ chèn middleware `auth` nếu cần xác thực token.
- **Khi sửa Auth**: Logic check Quyền / Token tập trung 100% tại `src/middleware/auth.midleware.ts`. Hạn chế xóa hoặc bypass logic trong đây trừ khi hiểu rõ ảnh hưởng an ninh.

## 22. Sơ đồ workflow tổng API
```text
Client Web/Mobile
 -> HTTP Request gửi đến Server
 -> Express App Engine (src/app.ts)
 -> Global Middleware xử lý bảo mật, phân tích JSON Body
 -> Route Router (Nhánh URL định nghĩa trong src/routes/*.route.ts)
 -> Authentication Middleware (Parse JWT Token => req.user)
 -> Route Middleware Quyền truy cập (Ví dụ: checkRole)
 -> Lọt vào hàm Controller (Validate Input + Thao tác Service/Model)
 -> Mongoose ORM Model Query Request
 -> Tương tác dữ liệu MongoDB Database
 -> Query thành công trả data về Model/Controller
 -> Controller wrap Response gửi lại JSON cho Express
 -> Response JSON
 -> Client Web/Mobile nhận dữ liệu
```

## 23. Mapping Web/Mobile với API nếu xác định được
| Endpoint | Dùng cho màn hình/flow | Ghi chú |
|----------|------------------------|---------|
| `/api/auth/login` | Màn hình đăng nhập | Xử lý Login, sinh Token API chung cho cả App và Web |
| `/api/auth/profile` | Dùng ở Context Hook trên frontend (Web) | Gán user context sau khi login |
| `/api/farm` | Tải danh sách Nông Trại thuộc về user | App/Web dùng chung cho Multi-tenant |
| `/api/productionLogs` | Hiển thị bảng/lịch sử nhật ký sản xuất | Thường có pagination/filter kèm theo |

## 24. Checklist nhanh cho Codex khi nhận task API mới
- [ ] Task liên quan Route: Nhớ mở thư mục `src/routes/` kết nối đến file Controller, sau đó verify config ở `src/app.ts`.
- [ ] Task liên quan Controller: Mở `src/controllers/`, xử lý validation Zod + Catch lỗi cẩn thận.
- [ ] Task liên quan Model Database: Vào `src/models/`, khai báo thêm trường thì nhớ thêm vào cả TypeScript Interface bên trong file để tránh lỗi type hint.
- [ ] Task liên quan Auth/Role: Kiểm tra thư mục `src/middleware/` và gắn `auth`, `checkRole` vào URL Router chuẩn bị tạo.
- [ ] Task Upload/File: Mở API file config hoặc router gọi Middleware file `upload.midleware.ts` và controller `file.controller.ts`.
