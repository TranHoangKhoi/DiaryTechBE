Phân Tích & Đề Xuất API cho Trang Home (Role Owner)
Dựa vào tài liệu Backend API (
BeOverview.md
,
DatabaseModels.md
) và yêu cầu giao diện của Frontend (
HomeOverview.md
), dưới đây là phân tích và danh sách các API cần thêm mới hoặc chỉnh sửa để đáp ứng nhu cầu một Dashboard Tổng quan cho Owner.

1. Đánh giá chung
   Màn hình Home của Owner không tập trung vào 1 Nông trại chi tiết mà mang tính bao quát, cung cấp số liệu tổng hợp của TẤT CẢ các hạng mục (Sub-accounts, Farms, Logs) mà Owner này đang quản lý.

Các model chính sẽ được sử dụng để tổng hợp dữ liệu bao gồm:

User: (Role = sub_account, owner_id = ID của Owner).
Farm: (Nông trại có owner_id = ID của Owner).
FarmCrop & Crop: (Để thống kê cơ cấu cây trồng nông lý).
ProductionLog & Activities: (Để lấy hoạt động gần đây chung của toàn bộ farm/hộ dân). 2. Các API cần thêm mới (New APIs)
Frontend đang hardcode các báo cáo thống kê. Để thay thế, chúng ta cần bổ sung 1 API chuyên biệt để phục vụ riêng cho Khối Báo Cáo Thống Kê Tổng Hợp.

[NEW API] GET /api/owner/dashboard/statistics hoặc GET /api/statistics/owner
Mục đích: API tổng hợp tất cả các chỉ số (Metrics) để hiển thị ngay trên cùng màn hình Home. Việc tổng hợp ở Backend sẽ giúp FE không phải tải xuống lượng dữ liệu khổng lồ (N+1 query problem).

Logic xử lý Backend:

Tổng số hộ dân (SubAccounts):
Query model User: countDocuments({ role: 'sub_account', owner_id: req.user.\_id }).
Tổng diện tích canh tác:
Query model Farm: Tính tổng hợp field area (cộng dồn) cho tất cả Farm thuộc owner_id: req.user.\_id. Lấy chuẩn quy đổi unit (ví dụ tất cả phải quy ra ha).
Cơ cấu cây trồng chính:
Lấy list farm_id thuộc Owner.
Query model FarmCrop với điều kiện is_primary: true và $in: list_farm_id.
Nhóm $group theo crop_id và populate tên hạt giống từ model Crop để trả ra mảng phần trăm (VD: [{ name: 'Sầu riêng', percentage: 60, total_area: 100 }, ...]).
Tỷ lệ hoạt động:
Đếm số Farm (trong số Farm của Owner) có sinh ra ít nhất 1 ProductionLog mới trong vòng 30 ngày qua (Active Farms), chia cho tổng số Farm của Owner.
Đề xuất Payload Response:

json
{
"totalSubAccounts": 60,
"totalFarms": 65,
"totalArea": { "value": 143.0, "unit": "ha" },
"cropStructure": [
{ "cropId": "...", "cropName": "Sầu riêng", "percentage": 60, "totalFarmsCount": 39 },
{ "cropId": "...", "cropName": "Bưởi", "percentage": 40, "totalFarmsCount": 26 }
],
"activeRate": 85.5 // (%)
} 3. Các API cần chỉnh sửa (Modify Existing APIs)
Để phục vụ các Widget như: Timeline Hoạt động gần đây và Bản đồ Nông nghiệp trên trang Home, các API hiện có cần được hỗ trợ thêm tham số (query variables) hoặc Populate dữ liệu.

[MODIFY] GET /api/productionLogsRecent (Timeline Hoạt Động Của Owner)
API hiện tại thường lấy log dựa theo 1 farm_id. Đối với Owner, Timeline phải phủ rộng ra Tất cả các Farm thuộc quyền quản lý.

Yêu cầu tinh chỉnh:
Thêm query parameteter ?owner_id=... (hoặc Backend tự lấy từ req.user nếu check thấy role là owner).
Query: Tìm tất cả Farm mà owner_id = req.user.\_id -> Lấy mảng farm_ids. Sau đó query ProductionLog với điều kiện farm_id: { $in: farm_ids }.
Sort theo thời gian mới nhất (Limit: 10-20 record).
Populate Required: Cần populate farm_id (để lấy farm_name - tên hộ) và populate activity_id (để lấy danh xưng của loại công việc: "Tưới nước", "Bón phân"). Cấu trúc chuỗi trả về FE sẽ hiển thị: [Tên hộ] đã thực hiện [Hoạt động] vào lúc [Thời gian].
