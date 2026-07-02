# Tài liệu ghi nhận thay đổi Cấu trúc API (API Refactoring Log)

**Ngày thực hiện:** Tháng 6/2026
**Mục tiêu:** Gom nhóm các API trùng lặp, chia nhỏ không hợp lý thành các API chuẩn RESTful, giúp hệ thống ổn định, dễ maintain và bảo mật hơn.

Tài liệu này dùng để đối soát sự thay đổi của Source Code Backend (`DiaryTechBE`) so với bản cũ.

---

## 1. Nhóm API Quản lý Trang trại (Farm API)

### 1.1 Trước khi thay đổi (Before)

Các API lấy danh sách Farm bị chia nhỏ theo role và nằm rải rác:

- `GET /api/farm/byUser` (Dùng cho farmer)
- `GET /api/farm/byOwner` (Dùng cho owner)
- `GET /api/farm/get-farm/:userId` (Dùng cho Admin)

### 1.2 Sau khi thay đổi (After)

Gom chung thành 1 API duy nhất:

- `GET /api/farm`
  - **Logic hoạt động:** Controller đọc role từ `req.user.role`.
    - Nếu là `owner`, truy vấn farm thuộc sở hữu (`owner_id = user._id`).
    - Nếu là `farmer`, truy vấn farm được cấp quyền (`user_id = user._id`).
    - Nếu là `superadmin` và có truyền query `?user_id=...`, truy vấn farm thuộc về user đó. Ngược lại, lấy danh sách farm do chính superadmin quản lý (giống hệt logic của `owner`).

### 1.3 Lưu ý đối soát (Notes)

- Ở lớp Proxy Next.js (FE), cần gọi đến URL `/api/farm` thay vì gọi rải rác như trước đây.

---

## 2. Nhóm API Nhật ký Sản xuất (Production Logs API)

### 2.1 Trước khi thay đổi (Before)

Nhiều endpoint cùng chung chức năng lấy danh sách Logs:

- `GET /api/productionLogs`
- `GET /api/productionLogs/farm/:farm_id`
- `GET /api/productionLogs/recent`
- `GET /api/productionLogs/owner`
- `GET /api/productionLogs/owner/logs/recent`

### 2.2 Sau khi thay đổi (After)

Gom về 1 API duy nhất với Query Parameters:

- `GET /api/productionLogs`
  - **Logic lọc (Filters):**
    - Truyền `?farm_id=abc`: Lọc log theo 1 trang trại cụ thể.
    - Truyền `?scope=owner`: Owner lấy tất cả log của các farm mình quản lý.
    - Truyền `?limit=5&sort=-created_at`: Để lấy log gần đây (recent).

### 2.3 Lưu ý đối soát (Notes)

- Frontend phải truyền đúng query params thay vì chèn trực tiếp id vào URL path. (Ví dụ thay `/farm/123` bằng `?farm_id=123`).

---

## 3. Nhóm API Người dùng và Xác thực (Auth & User Profile API)

### 3.1 Trước khi thay đổi (Before)

Profile bị phân mảnh ở 2 Route khác nhau:

- Lấy thông tin: `GET /api/auth/profile`
- Cập nhật thông tin: `PUT /api/users/profile`
- Đổi mật khẩu: `PUT /api/users/profile/password`

### 3.2 Sau khi thay đổi (After)

Dời toàn bộ xử lý thông tin cá nhân về chuẩn RESTful thuộc `user.route.ts`:

- Lấy thông tin cá nhân: `GET /api/users/me`
- Cập nhật thông tin: `PUT /api/users/me`
- Đổi mật khẩu: `PUT /api/users/me/password`

### 3.3 Lưu ý đối soát (Notes)

- Route `auth` từ nay chỉ còn chịu trách nhiệm Đăng nhập (`login`), Đăng ký (`register`) và Đăng xuất/Refresh Token nếu có.
- Mọi thao tác cá nhân đều gọi qua `/api/users/me`.

---

> **Khuyến nghị chung khi có lỗi xảy ra:**
>
> 1. Kiểm tra lại Frontend (Web/App) xem các URL ở thư mục `services/` đã đổi khớp với URL mới của BE chưa.
> 2. Kiểm tra xem Frontend có gửi thiếu Query Param hay không (đặc biệt là API Logs).
> 3. Kiểm tra JWT Token gửi lên BE xem có bị thiếu trường `role` hay không, vì logic mới dựa rất nhiều vào `req.user.role` để phân quyền linh hoạt.

---

## 4. Giai đoạn 2: Tối ưu Cấu trúc Proxy (Next.js - Web)

Các thay đổi tại thư mục `DiaryTechWeb/app/api/internal/`:

- Dời `auth/farm` về `farm` (Xóa bỏ `owner/farm`). Proxy Forward chung về `GET /api/farm`.
- Dời `diary/productionLogs` về `productionLogs`. Xóa các file nested dư thừa như `[farmId]`, `owner`, `recent`. Proxy Forward chung về `GET /api/productionLogs`.
- Dời `auth/profile` về `users/me` và `user/password` về `users/me/password`. Các proxy tự động Forward Query String để đồng bộ hoàn toàn với BE.

## 5. Giai đoạn 3: Cập nhật Services (Frontend Web & App)

- **Web (`DiaryTechWeb/services/`)**:
  - `farm.service.ts`: Gộp `getMyFarms` và `getFarmsByOwner` thành một hàm chung `getFarms(queryString)`. Trả về Array của Farm.
  - `diary.service.ts`: Toàn bộ lời gọi được quy hoạch về gọi Route chính (`/productionLogs`) của Proxy với Params phù hợp.
  - `auth.service.ts`: Chuyển endpoint lấy Profile thành `/users/me`.
- **App (`DiaryTechApp/src/api/`)**:
  - Cập nhật thư mục `api/farm/index.ts`: Thay vì gọi `/byOwner` hay `/byUser`, gọi trực tiếp về `/farm`.
  - Cập nhật `api/productionLog/index.ts`: Sử dụng chung endpoint `productionLogs` kết hợp truyền params filter.
  - Cập nhật hàm bóc tách dữ liệu mảng (Array) thay vì Object đơn thuần vì backend đã chuẩn hoá trả về danh sách đối tượng (VD: `res.data[0]`).

## 6. Giai đoạn 4: Bug Fixes & Tối ưu (Post-Refactor)

- **Sửa lỗi Hydration Mismatch (Web)**: Thêm `instanceId` cố định vào các component `react-select` trong `OwnerDiaryContent.tsx` để ngăn ID tự sinh ở Client và Server lệch nhau.
- **Sửa lỗi Infinite Redirect Loop (Web)**: Chỉnh sửa lại `configs/appRoute.ts` để gán chính xác `API_URL.getProfile = "api/users/me"` và `API_URL.getFarm = "api/farm"`, đồng thời đổi map proxy thành `API_URL.getFarmMap = "api/map/getFarm"` để Middleware không bị crash do nhận lỗi 401/404 rồi đá qua lại giữa `/login` và `/home`.
- **Sửa lỗi Mongoose StrictPopulate (Backend)**: Đổi `.populate('user_id')` thành `.populate('created_by')` trong `getProductionLogs` tại `productionLogs.controller.ts` vì schema gốc sử dụng `created_by`.
- **Sửa lỗi Crash UI do sai cấu trúc dữ liệu (Web)**: Cập nhật `ListActivities.tsx` và `RecentActivities/index.tsx` để fallback giữa 2 chuẩn dữ liệu (cũ: `item.farm`, `item.user` vs mới: `item.farm_id`, `item.created_by`) và tạo `message` tự động thay vì dùng message fix cứng từ Backend.
- **Tối ưu Phân trang API `getProductionLogs` (Backend)**: Tích hợp Pagination (`page`, `limit`, `total`) vào `productionLogs.controller.ts` để API phục vụ song song cả "Widget hoạt động gần đây" (chỉ lấy limit) và "Danh sách nhật ký" (cần đếm total và tính skip).
- **Cập nhật API Lấy chi tiết Nhật ký `getProductionLogsByID` (Backend & Web)**: Bổ sung populate dữ liệu `ward` và `province` vào `farm_id` để trang chi tiết hiện đủ địa chỉ thay vì `"undefined, undefined"`. Đổi Route Handler của Next.js Proxy (`app/api/internal/productionLogs/[id]/route.ts`) sử dụng `Promise<{ id: string }>` cho params để tương thích chuẩn Next.js 16.
- **Sửa lỗi Nối chuỗi Query Param sai cú pháp (Web)**: Ở hàm `getProductionLogs` trong `diary.service.ts`, đã chuyển logic từ việc ghép chuỗi thủ công (`?farm_id=...` sau đó nối tiếp `?page=...`) sang việc sử dụng hoàn toàn `URLSearchParams.append("farm_id", farmId)`. Mục đích để chặn triệt để lỗi sinh ra cấu trúc sai định dạng `?farm_id=6a263...f?page=1` gây lỗi `CastError: Cast to ObjectId failed` nghiêm trọng ở phía Backend.

## 7. Giai đoạn 5: Chuẩn hóa System Configs & Master Data

- **Đồng bộ hóa Category và Unit Tồn kho**: Đã tạo file config cứng `src/config/inventory.config.ts` ở Backend và xuất ra qua API `GET /api/inventory/configs`. Mục đích để đồng bộ hoàn toàn danh sách danh mục vật tư (`categoryOptions`) và đơn vị tính (`unit`) giữa App và Web, dứt điểm tình trạng hardcode rải rác ở Frontend.
