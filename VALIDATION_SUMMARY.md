# Quy Tắc Nghiệp Vụ Hệ Thống

## 1. Quản Lý Người Dùng
### Phân Quyền
- Admin: Quản lý toàn bộ hệ thống
- Consultant: Quản lý lịch, tư vấn, báo cáo
- User: Đặt lịch, xem dịch vụ, feedback

### Tài Khoản
- Email xác thực bắt buộc
- Mật khẩu: ≥ 8 ký tự, có chữ hoa, số
- Avatar: ≤ 5MB, jpg/png
- Thông tin cá nhân bắt buộc: Họ tên, SĐT

## 2. Quản Lý Slot
### Trạng Thái
- Available → Booked → Completed/Cancelled
- Deleted: Ẩn khỏi hệ thống
- Chỉ đặt slot trống

### Cơ Chế Giữ Chỗ
- Thời gian: 2 phút
- Mỗi user chỉ giữ 1 slot
- Hết giờ: Trả slot + quay lại bước 2
- Chỉ người giữ được thanh toán

## 3. Quy Trình Đặt Lịch
### Bước 1: Chọn Dịch Vụ
- Chỉ dịch vụ đang hoạt động
- Phải có giá niêm yết

### Bước 2: Chọn Thời Gian
- Chỉ xem tuần này + tuần sau
- Không chọn quá khứ

### Bước 3: Chọn Chuyên Gia
- Hiển thị chuyên gia rảnh
- Khớp với slot đã chọn

### Bước 4: Thông Tin
- SĐT: Bắt buộc, định dạng VN
- Lý do: 10-500 ký tự
- Ghi chú: Tùy chọn

### Bước 5: Thanh Toán
- Timeout: 60 giây
- Hết giờ: Hủy + Trả slot

## 4. Quản Lý Cuộc Hẹn
### Tạo Mới
- Trạng thái: pending → confirmed/cancelled
- Thông tin bắt buộc:
  + ID: User, Chuyên gia, Dịch vụ
  + ID Slot
  + Lý do
  + Thời gian đặt

### Cập Nhật
- Đổi lịch: Chỉ sang slot trống
- Hủy: Trả slot + xóa người giữ

## 5. Quản Lý Thanh Toán
### Phương Thức
- PayPal/VNPay/Momo
- Timeout: 60 giây

### Trạng Thái
- Thành công: Xác nhận cuộc hẹn
- Thất bại: Hủy + trả slot

## 6. Quản Lý Blog
### Bài Viết
- Duyệt trước khi đăng
- Có thể lên lịch đăng
- Cho phép ẩn/hiện

### Nội Dung
- Tiêu đề: 10-200 ký tự
- Nội dung: ≤ 10000 ký tự
- Ảnh: ≤ 5MB, tối đa 10 ảnh

## 7. Quản Lý Sự Kiện
### Tạo Sự Kiện
- Thời gian đăng ký < Thời gian diễn ra
- Sức chứa: 1-10000 người
- Địa điểm bắt buộc

### Đăng Ký
- Trong thời hạn đăng ký
- Không vượt quá sức chứa
- Có thể hủy trước sự kiện

## 8. Quản Lý Feedback
### Đánh Giá
- Chỉ sau khi hoàn thành dịch vụ
- Sao: 1-5
- Comment: ≤ 500 ký tự

### Hiển Thị
- Admin duyệt trước
- Ẩn thông tin nhạy cảm
- Cho phép reply

## 9. Bảo Mật
### Xác Thực
- JWT token
- Refresh token
- Session timeout: 24h

### Validation
- Kiểm tra đầu vào
- Giới hạn độ dài
- Chống SQL injection

## 10. Hiệu Suất
### Frontend
- Validate trước
- Phản hồi realtime
- Tối ưu loading

### Backend
- Cache dữ liệu
- Query hiệu quả
- Giới hạn tài nguyên

## 11. Xử Lý Lỗi
### Thông Báo
- Tiếng Việt
- Hướng dẫn rõ ràng
- Gợi ý khắc phục

### Ghi Log
- Chi tiết lỗi
- Ngữ cảnh user
- Stack trace 