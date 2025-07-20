# Quản lý Kết quả Trắc nghiệm - Hướng dẫn sử dụng

## Tổng quan

Tính năng quản lý kết quả trắc nghiệm cho phép admin xem, lọc và phân tích các kết quả quiz của người dùng.

## Tính năng chính

### 1. Thống kê tổng quan

- **Tổng kết quả**: Số lượng kết quả quiz trong hệ thống
- **7 ngày qua**: Số kết quả trong 7 ngày gần nhất
- **Điểm trung bình**: Điểm trung bình của tất cả kết quả
- **Phân bố mức rủi ro**: Thống kê theo từng mức rủi ro

### 2. Bộ lọc nâng cao

- **Bài đánh giá**: Lọc theo quiz cụ thể
- **Người dùng**: Tìm kiếm theo ID hoặc email
- **Mức rủi ro**: Lọc theo mức rủi ro (Thấp/Trung bình/Cao/Nguy hiểm)
- **Khoảng thời gian**: Lọc theo từ ngày đến ngày

### 3. Hiển thị kết quả

- **Phân trang**: Hiển thị 20 kết quả mỗi trang
- **Nhóm theo quiz**: Kết quả được nhóm theo tên bài quiz
- **Thông tin chi tiết**: Người dùng, thời gian, điểm số, mức rủi ro
- **Xem chi tiết**: Modal hiển thị đầy đủ thông tin kết quả

### 4. Modal chi tiết kết quả

- **Thông tin tổng quan**: Người làm bài, thời gian, điểm số, mức rủi ro
- **Chi tiết câu trả lời**: Từng câu hỏi và đáp án đã chọn
- **Phân tích mức ảnh hưởng**: Đánh giá mức độ ảnh hưởng của từng câu trả lời
- **Tóm tắt**: Tổng điểm, tỷ lệ hoàn thành, số câu trả lời

## Cách sử dụng

### Xem thống kê

1. Click nút "Xem thống kê" ở góc trên bên phải
2. Thống kê sẽ hiển thị với 4 chỉ số chính
3. Phân bố mức rủi ro được hiển thị bên dưới

### Lọc kết quả

1. Chọn bài đánh giá từ dropdown (hoặc để "Tất cả")
2. Nhập ID/email người dùng (tùy chọn)
3. Chọn mức rủi ro (tùy chọn)
4. Chọn khoảng thời gian (tùy chọn)
5. Kết quả sẽ tự động cập nhật

### Xem chi tiết kết quả

1. Click "Xem chi tiết" trong bảng kết quả
2. Modal sẽ hiển thị thông tin đầy đủ
3. Xem từng câu trả lời và mức ảnh hưởng
4. Click "Đóng" để thoát

### Phân trang

- Sử dụng nút "Trước"/"Sau" để di chuyển giữa các trang
- Click số trang để chuyển trực tiếp
- Thông tin hiển thị số kết quả hiện tại và tổng số

## Mức rủi ro

### Phân loại

- **Thấp** (low): Điểm 0-3, màu xanh lá
- **Trung bình** (moderate): Điểm 4-7, màu vàng
- **Cao** (high): Điểm 8-11, màu cam
- **Nguy hiểm** (critical): Điểm 12+, màu đỏ

### Mức ảnh hưởng câu trả lời

- **Thấp**: Điểm 0, màu xanh lá
- **Trung bình**: Điểm 2, màu vàng
- **Cao**: Điểm 4, màu đỏ

## API Endpoints sử dụng

### Backend

- `GET /api/quizzes/quiz-results/all` - Lấy danh sách kết quả (có filter, pagination)
- `GET /api/quizzes/quiz-results/stats` - Lấy thống kê
- `GET /api/quizzes/quiz-results/result/:resultId` - Lấy chi tiết kết quả
- `GET /api/quizzes` - Lấy danh sách quiz

### Parameters

- `quizId`: ID bài quiz
- `userId`: ID hoặc email người dùng
- `riskLevel`: Mức rủi ro (low/moderate/high/critical)
- `from`: Từ ngày (YYYY-MM-DD)
- `to`: Đến ngày (YYYY-MM-DD)
- `page`: Số trang
- `limit`: Số kết quả mỗi trang

## Cải tiến so với phiên bản cũ

### 1. Backend

- ✅ Thêm validation và error handling
- ✅ Cải thiện route order để tránh conflict
- ✅ Thêm API stats với thống kê chi tiết
- ✅ Hỗ trợ pagination và filtering
- ✅ Cải thiện response format

### 2. Frontend

- ✅ UI/UX hiện đại với Tailwind CSS
- ✅ Modal chi tiết kết quả
- ✅ Thống kê trực quan
- ✅ Bộ lọc nâng cao
- ✅ Phân trang
- ✅ Loading states
- ✅ Error handling
- ✅ TypeScript interfaces đầy đủ

### 3. Tính năng mới

- ✅ Thống kê real-time
- ✅ Phân tích mức ảnh hưởng
- ✅ Export/Import (có thể thêm sau)
- ✅ Notifications (có thể thêm sau)

## Troubleshooting

### Lỗi thường gặp

1. **Không tải được kết quả**: Kiểm tra kết nối API
2. **Modal không hiển thị**: Kiểm tra console errors
3. **Filter không hoạt động**: Kiểm tra format ngày tháng

### Debug

- Mở Developer Tools (F12)
- Xem tab Console để kiểm tra errors
- Xem tab Network để kiểm tra API calls

## Tương lai

### Tính năng có thể thêm

- Export kết quả ra Excel/PDF
- Gửi email thông báo kết quả
- Dashboard với biểu đồ
- So sánh kết quả theo thời gian
- Phân tích xu hướng
- Tích hợp với hệ thống tư vấn
