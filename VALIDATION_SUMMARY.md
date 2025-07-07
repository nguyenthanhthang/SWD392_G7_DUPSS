# Validation Summary - Event Creation

## Frontend Validation (EventManagement.tsx)

### 1. Required Fields Validation
- ✅ Tiêu đề (title): Bắt buộc
- ✅ Mô tả (description): Bắt buộc  
- ✅ Thời gian bắt đầu đăng ký (registrationStartDate): Bắt buộc
- ✅ Thời gian kết thúc đăng ký (registrationEndDate): Bắt buộc
- ✅ Thời gian bắt đầu sự kiện (startDate): Bắt buộc
- ✅ Thời gian kết thúc sự kiện (endDate): Bắt buộc
- ✅ Địa điểm (location): Bắt buộc
- ✅ Sức chứa (capacity): Bắt buộc

### 2. Length Validation
- ✅ Tiêu đề: 5-100 ký tự
- ✅ Mô tả: 10-1000 ký tự
- ✅ Địa điểm: ít nhất 3 ký tự

### 3. Capacity Validation
- ✅ Sức chứa > 0
- ✅ Sức chứa ≤ 10,000 người
- ✅ Khi cập nhật: Không thể giảm sức chứa xuống dưới số người đã đăng ký

### 4. Date/Time Validation
- ✅ Thời gian kết thúc sự kiện > thời gian bắt đầu sự kiện
- ✅ Thời gian kết thúc đăng ký > thời gian bắt đầu đăng ký
- ✅ Thời gian kết thúc đăng ký < thời gian bắt đầu sự kiện
- ✅ Thời gian bắt đầu đăng ký phải trong tương lai

### 5. URL Validation
- ✅ URL hình ảnh (nếu có): Phải là URL hợp lệ

## Backend Validation (eventController.ts)

### 1. Create Event Validation
- ✅ Tất cả validation tương tự frontend
- ✅ Thêm validation cho capacity > 10,000

### 2. Update Event Validation
- ✅ Kiểm tra sự kiện tồn tại
- ✅ Validation có điều kiện (chỉ validate các trường được cập nhật)
- ✅ Logic thời gian tương tự create event

### 3. Date Logic Validation
```javascript
// Logic hợp lệ:
regStart < regEnd <= eventStart < eventEnd
regStart > now (thời gian hiện tại)
```

## Model Validation (Event.ts)

### 1. Schema Validation
- ✅ Tất cả trường bắt buộc được định nghĩa
- ✅ Enum cho status: ["upcoming", "ongoing", "completed", "cancelled"]
- ✅ Timestamps tự động

### 2. Pre-save Middleware
- ✅ Tự động cập nhật status dựa trên thời gian:
  - `startDate > now` → "upcoming"
  - `endDate < now` → "completed"  
  - Còn lại → "ongoing"

## Error Messages

### Frontend (Toast Messages)
- "Vui lòng điền đầy đủ thông tin bắt buộc"
- "Tiêu đề phải có ít nhất 5 ký tự"
- "Tiêu đề không được vượt quá 100 ký tự"
- "Mô tả phải có ít nhất 10 ký tự"
- "Mô tả không được vượt quá 1000 ký tự"
- "Địa điểm phải có ít nhất 3 ký tự"
- "Sức chứa phải lớn hơn 0"
- "Sức chứa không được vượt quá 10,000 người"
- "Thời gian kết thúc sự kiện phải sau thời gian bắt đầu"
- "Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký"
- "Thời gian kết thúc đăng ký phải trước khi sự kiện bắt đầu"
- "Thời gian bắt đầu đăng ký phải trong tương lai"
- "URL hình ảnh không hợp lệ"

### Backend (JSON Response)
- Tương tự frontend nhưng trả về JSON với format: `{ message: "error message" }`

## Testing Scenarios

### Valid Cases
1. ✅ Tạo sự kiện với tất cả thông tin hợp lệ
2. ✅ Cập nhật một số trường của sự kiện
3. ✅ Tạo sự kiện với URL hình ảnh hợp lệ

### Invalid Cases
1. ❌ Thiếu thông tin bắt buộc
2. ❌ Tiêu đề quá ngắn/dài
3. ❌ Mô tả quá ngắn/dài
4. ❌ Sức chứa ≤ 0 hoặc > 10,000
5. ❌ Thời gian không hợp lệ
6. ❌ URL hình ảnh không hợp lệ
7. ❌ Giảm sức chứa xuống dưới số người đã đăng ký

## Security Considerations

1. ✅ Input sanitization (trim whitespace)
2. ✅ Length limits để tránh DoS
3. ✅ Date validation để tránh logic errors
4. ✅ Capacity limits để tránh resource exhaustion
5. ✅ URL validation để tránh XSS

## Performance Considerations

1. ✅ Validation được thực hiện ở cả frontend và backend
2. ✅ Frontend validation giảm tải cho server
3. ✅ Backend validation đảm bảo data integrity
4. ✅ Efficient date comparisons
5. ✅ Minimal database queries trong validation 