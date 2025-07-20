# API Quiz Results Documentation

## Tổng quan

API Quiz Results cung cấp các endpoint để quản lý kết quả làm bài quiz của người dùng.

## Endpoints

### 1. Submit Quiz Result

**POST** `/api/quizzes/quiz-results`

Submit kết quả làm bài quiz.

#### Request Body:

```json
{
  "quizId": "assist",
  "userId": "507f1f77bcf86cd799439011", // Optional
  "sessionId": "session_123456789", // Optional (for anonymous users)
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439012",
      "selectedOption": 0
    }
  ]
}
```

#### Response:

```json
{
  "success": true,
  "data": {
    "resultId": "507f1f77bcf86cd799439013",
    "totalScore": 15,
    "maxScore": 20,
    "percentage": 75,
    "riskLevel": "critical",
    "riskLevelDescription": "Nguy cơ rất cao - Khuyến khích tìm kiếm sự hỗ trợ chuyên môn",
    "suggestedAction": "Khuyến khích tìm kiếm sự hỗ trợ chuyên môn ngay lập tức",
    "shouldSeeConsultant": true,
    "takenAt": "2025-07-10T20:55:47.411Z"
  }
}
```

### 2. Get User Quiz Results

**GET** `/api/quizzes/quiz-results/:userId`

Lấy lịch sử kết quả làm bài của user.

#### Query Parameters:

- `limit` (optional): Số lượng kết quả trả về (default: 10)
- `page` (optional): Trang hiện tại (default: 1)

#### Response:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "quizId": {
          "_id": "assist",
          "title": "Bài đánh giá ASSIST",
          "description": "Đánh giá nguy cơ sử dụng chất"
        },
        "totalScore": 15,
        "riskLevel": "critical",
        "suggestedAction": "Khuyến khích tìm kiếm sự hỗ trợ chuyên môn ngay lập tức",
        "takenAt": "2025-07-10T20:55:47.411Z"
      }
    ],
    "pagination": {
      "current": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 3. Get Quiz Result Detail

**GET** `/api/quizzes/quiz-results/result/:resultId`

Lấy chi tiết một kết quả quiz.

#### Response:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com"
    },
    "quizId": {
      "_id": "assist",
      "title": "Bài đánh giá ASSIST",
      "description": "Đánh giá nguy cơ sử dụng chất",
      "maxScore": 20
    },
    "answers": [
      {
        "questionId": {
          "_id": "507f1f77bcf86cd799439012",
          "text": "Bạn đã từng sử dụng chất kích thích nào chưa?",
          "options": [
            { "text": "Chưa từng", "score": 0 },
            { "text": "Một lần", "score": 1 },
            { "text": "Nhiều lần", "score": 3 }
          ]
        },
        "selectedOption": 2,
        "score": 3
      }
    ],
    "totalScore": 15,
    "riskLevel": "critical",
    "suggestedAction": "Khuyến khích tìm kiếm sự hỗ trợ chuyên môn ngay lập tức",
    "takenAt": "2025-07-10T20:55:47.411Z"
  }
}
```

### 4. Get All Quiz Results (Admin)

**GET** `/api/quizzes/quiz-results/all`

Lấy toàn bộ kết quả quiz với filter và phân trang.

#### Query Parameters:

- `quizId` (optional): Filter theo quiz ID
- `userId` (optional): Filter theo user ID hoặc email
- `riskLevel` (optional): Filter theo risk level (low, moderate, high, critical)
- `from` (optional): Filter từ ngày (ISO date string)
- `to` (optional): Filter đến ngày (ISO date string)
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng kết quả (default: 20, max: 100)

#### Response:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "fullName": "Nguyễn Văn A",
          "email": "user@example.com"
        },
        "quizId": {
          "_id": "assist",
          "title": "Bài đánh giá ASSIST"
        },
        "totalScore": 15,
        "riskLevel": "critical",
        "takenAt": "2025-07-10T20:55:47.411Z"
      }
    ],
    "pagination": {
      "current": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 5. Get Quiz Results Statistics (Admin)

**GET** `/api/quizzes/quiz-results/stats`

Lấy thống kê kết quả quiz.

#### Query Parameters:

- `quizId` (optional): Filter theo quiz ID
- `from` (optional): Filter từ ngày (ISO date string)
- `to` (optional): Filter đến ngày (ISO date string)

#### Response:

```json
{
  "success": true,
  "data": {
    "totalResults": 100,
    "riskLevelDistribution": [
      {
        "_id": "low",
        "count": 40,
        "avgScore": 5.2
      },
      {
        "_id": "moderate",
        "count": 30,
        "avgScore": 12.5
      },
      {
        "_id": "high",
        "count": 20,
        "avgScore": 18.3
      },
      {
        "_id": "critical",
        "count": 10,
        "avgScore": 25.7
      }
    ],
    "quizDistribution": [
      {
        "_id": "assist",
        "count": 50,
        "avgScore": 12.3
      },
      {
        "_id": "crafft",
        "count": 30,
        "avgScore": 8.7
      },
      {
        "_id": "parent-awareness",
        "count": 20,
        "avgScore": 15.2
      }
    ],
    "recentResults": 15,
    "scoreStats": {
      "average": 12.5,
      "min": 0,
      "max": 30
    }
  }
}
```

### 6. Get User Quiz History

**GET** `/api/quizzes/history/:userId`

Lấy lịch sử làm bài của user (simplified version).

#### Response:

```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "quizId": "assist",
    "totalScore": 15,
    "riskLevel": "critical",
    "suggestedAction": "Khuyến khích tìm kiếm sự hỗ trợ chuyên môn ngay lập tức",
    "takenAt": "2025-07-10T20:55:47.411Z"
  }
]
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc (quizId, answers)"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Không tìm thấy quiz"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Lỗi server khi lưu kết quả quiz"
}
```

## Risk Level Calculation

Risk level được tính dựa trên percentage của totalScore so với maxScore:

- **Critical**: ≥ 75%
- **High**: ≥ 50%
- **Moderate**: ≥ 25%
- **Low**: < 25%

## Validation Rules

1. **quizId**: Phải tồn tại và active
2. **userId**: Phải là valid ObjectId hoặc email
3. **sessionId**: Chỉ cần thiết cho anonymous users
4. **answers**: Phải là array không rỗng
5. **questionId**: Phải là valid ObjectId
6. **selectedOption**: Phải là số >= 0 và < số options của question
7. **Date ranges**: Phải là valid ISO date strings
8. **Pagination**: page >= 1, limit >= 1 và <= 100

## Database Schema

### QuizResult Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Optional for anonymous users
  sessionId: String, // For anonymous users
  quizId: String,
  takenAt: Date,
  answers: [
    {
      questionId: ObjectId,
      selectedOption: Number,
      score: Number
    }
  ],
  totalScore: Number,
  riskLevel: String, // "low", "moderate", "high", "critical"
  suggestedAction: String,
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

- `{ userId: 1, takenAt: -1 }`
- `{ quizId: 1, takenAt: -1 }`
- `{ riskLevel: 1, takenAt: -1 }`
- `{ sessionId: 1 }`
