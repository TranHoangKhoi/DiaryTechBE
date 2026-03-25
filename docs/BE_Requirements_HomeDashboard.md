# Yêu Cầu API Backend — Home Dashboard (Role Owner)

**Người yêu cầu:** Frontend Team  
**Ngày:** 24/03/2026  
**Phạm vi ảnh hưởng:** `owner.controller.ts`, `productionLogs.controller.ts`

---

## Tổng quan

Trang Home Dashboard của Owner gồm 3 widget chính phía dưới. Hiện tại các widget này đang hiển thị **dữ liệu cứng (hardcode)**. FE cần BE điều chỉnh / bổ sung để các widget có thể lấy dữ liệu thực.

**Không cần tạo endpoint mới.** Toàn bộ yêu cầu là:

1. Mở rộng response của `GET /api/owner/dashboard/statistics` (đang có).
2. Xác nhận API `GET /api/productionLogs/owner/logs/recent` đang populate đúng.

---

## 1. API `GET /api/owner/dashboard/statistics`

### 1.1. Yêu cầu bổ sung `color` vào `cropStructure[]`

**Widget liên quan:** `CropStatisticCard` — Biểu đồ cột thống kê cây trồng.

**Vấn đề hiện tại:**  
Mỗi item trong mảng `cropStructure[]` đang thiếu trường `color`. FE đang dùng `chart.js` để vẽ biểu đồ Bar Chart và cần màu sắc riêng của từng loại cây trồng để tô từng cột. Màu này đã có sẵn trong model `Crop` (field `color`).

**Yêu cầu:**  
Trong bước `$lookup` / populate khi tổng hợp `cropStructure`, hãy thêm field `color` từ model `Crop` vào mỗi item.

**Response hiện tại:**

```json
"cropStructure": [
  {
    "cropId": "...",
    "cropName": "Sầu riêng",
    "percentage": 60.0,
    "totalArea": 36.5,
    "totalFarmsCount": 12
  }
]
```

**Response mong muốn:**

```json
"cropStructure": [
  {
    "cropId": "...",
    "cropName": "Sầu riêng",
    "percentage": 60.0,
    "totalArea": 36.5,
    "totalFarmsCount": 12,
    "color": "#4CAF50"
  }
]
```

---

### 1.2. Yêu cầu bổ sung block `todayInsights`

**Widget liên quan:** `InsightTodayCard` — "Tình trạng hôm nay".

**Vấn đề hiện tại:**  
Widget đang hiển thị các chỉ số như "Nguy cơ sâu bệnh", "Đến hạn chăm sóc" nhưng BE chưa có module AI/lịch nhắc việc. FE đề xuất thay bằng 3 chỉ số **có thể tính được trực tiếp từ DB**:

| Chỉ số               | Mô tả                                               | Cách tính                                                                              |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `logsCreatedToday`   | Số nhật ký được tạo **hôm nay**                     | Đếm `ProductionLog` có `createdAt >= startOfToday` và `farm_id` thuộc Owner            |
| `inactiveFarmsCount` | Số Farm **chưa cập nhật** nhật ký trong 30 ngày qua | Đếm `Farm` thuộc Owner mà **không có** `ProductionLog` nào trong vòng 30 ngày gần nhất |
| `activeFarmsCount`   | Số Farm **đang hoạt động** (có log trong 30 ngày)   | `totalFarms - inactiveFarmsCount`                                                      |

**Yêu cầu:**  
Thêm object `todayInsights` vào response của `GET /api/owner/dashboard/statistics`.

**Response mong muốn:**

```json
{
  "success": true,
  "data": {
    "totalSubAccounts": 65,
    "totalFarms": 65,
    "totalArea": { "value": 28589.3, "unit": "ha" },
    "cropStructure": [ ... ],
    "activeRate": 1.54,
    "todayInsights": {
      "logsCreatedToday": 8,
      "inactiveFarmsCount": 5,
      "activeFarmsCount": 60
    }
  }
}
```

---

## 2. API `GET /api/productionLogs/owner/logs/recent`

**Widget liên quan:** `UpcomingTaskCard` — "Hoạt động gần đây" (FE sẽ đổi tên card từ "Việc sắp tới" thành "Hoạt động gần đây" cho khớp với dữ liệu thực).

**Yêu cầu:**  
API này đã tồn tại. FE chỉ cần đảm bảo response trả về **đủ 4 trường** sau để render UI:

| Trường                      | Từ model nào    | Ghi chú                                |
| --------------------------- | --------------- | -------------------------------------- |
| `farm_id.farm_name`         | `Farm`          | Tên hộ để hiển thị                     |
| `activity_id.activity_name` | `Activities`    | Tên hoạt động (Bón phân, Tưới nước...) |
| `createdAt`                 | `ProductionLog` | Thời gian tạo log                      |
| `created_by.name`           | `User`          | (Tuỳ chọn) Người thực hiện             |

**Kiểm tra populate:**  
Hãy đảm bảo `productionLogs.controller.ts` (function `getProductionLogsRecentByOwner` hoặc tương đương) đang `.populate('farm_id', 'farm_name')` và `.populate('activity_id', 'activity_name')`.

**Response mong muốn:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "farm_id": { "_id": "...", "farm_name": "Hộ Nguyễn Văn An" },
      "activity_id": { "_id": "...", "activity_name": "Bón phân đợt 2" },
      "createdAt": "2026-03-24T08:30:00.000Z"
    }
  ]
}
```

**Query params FE sẽ truyền:**

- `limit=5` — Chỉ lấy 5 bản ghi gần nhất.

---

## 3. Tóm tắt Checklist cho BE

- [ ] `GET /api/owner/dashboard/statistics` — Thêm `color` vào từng item trong `cropStructure[]` (populate từ `Crop.color`).
- [ ] `GET /api/owner/dashboard/statistics` — Thêm object `todayInsights` vào `data` với 3 trường: `logsCreatedToday`, `inactiveFarmsCount`, `activeFarmsCount`.
- [ ] `GET /api/productionLogs/owner/logs/recent` — Xác nhận đang populate `farm_id` (lấy `farm_name`) và `activity_id` (lấy `activity_name`). Hỗ trợ query param `limit`.

---

_Tài liệu tạo: 24/03/2026 — Liên hệ FE nếu cần làm rõ hơn về cấu trúc response._
