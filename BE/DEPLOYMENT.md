# 🚀 Deployment Guide - HopeHub Backend

## 📋 Tổng quan
Backend được deploy trên Render.com với URL: `https://swd392-g7-dupss.onrender.com`

## 🔧 Các endpoint đã được thêm

### 1. Health Check Endpoint
```
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 2. Auth Status Endpoint
```
GET /api/auth
```
**Response:**
```json
{
  "status": "auth_service_available",
  "endpoints": {
    "login": "POST /api/auth/login",
    "register": "POST /api/auth/register",
    "loginGoogle": "POST /api/auth/login-google",
    "checkOTP": "POST /api/auth/check-otp",
    "sendVerifyEmail": "POST /api/auth/send-new-verify-email",
    "sendResetPassword": "POST /api/auth/send-reset-password-email"
  }
}
```

## 🧪 Testing

### Chạy test local
```bash
cd BE
npm run test:deploy
```

### Chạy test manual
```bash
node deploy-test.js
```

## 🔍 Troubleshooting

### Lỗi 404 Auth endpoint
- **Nguyên nhân:** Không có GET route cho `/api/auth`
- **Giải pháp:** Đã thêm endpoint trả về thông tin auth service

### Lỗi 404 Health check
- **Nguyên nhân:** Không có `/api/health` endpoint
- **Giải pháp:** Đã thêm health check endpoint

### Lỗi 400 Login endpoint
- **Nguyên nhân:** Test với tài khoản không tồn tại
- **Giải pháp:** Đây là lỗi bình thường, endpoint hoạt động đúng

### Server cold start
- **Nguyên nhân:** Render.com free tier tắt server sau 15 phút không hoạt động
- **Giải pháp:** 
  - Frontend có pre-wake mechanism
  - Health check tự động wake server
  - Response time có thể chậm lần đầu (5-10 giây)

## 📊 Monitoring

### Frontend Health Monitor
- Tự động check server mỗi 5 phút
- Pre-wake server trước user action
- Hiển thị status real-time

### Backend Health
- Uptime tracking
- Environment info
- Timestamp logging

## 🔄 Deployment Process

1. **Push code to main branch**
2. **Render.com auto-deploy**
3. **Test endpoints:**
   ```bash
   node deploy-test.js
   ```
4. **Verify frontend connection**

## 📝 Logs

### Render.com Logs
- Access via Render.com dashboard
- Real-time log streaming
- Error tracking

### Application Logs
- Console logs in Render.com
- Database connection status
- API request logs

## 🚨 Common Issues

### 1. CORS Errors
- Backend đã cấu hình CORS cho tất cả origins
- Credentials disabled cho wildcard origin

### 2. Database Connection
- MongoDB Atlas connection
- Environment variables required
- Connection pooling enabled

### 3. File Upload
- Cloudinary integration
- Image processing
- File size limits

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra Render.com logs
2. Chạy `deploy-test.js`
3. Verify environment variables
4. Check database connection 