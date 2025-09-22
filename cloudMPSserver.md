# 1. 로그인 API

## Endpoint
- **POST** `/api/users/login`

## Request
### Headers
- `Content-Type: application/json`

### Body
```json
{
  "user_name": "string",
  "password": "string",
  "ip_address": "string"
}
```

## Response
### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "token": "jwt_token_string"
}
```

### Failure (401 Unauthorized)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "Invalid userName or password"
}
```

## Process Flow
1. 사용자 존재하지 않으면 `Invalid userName or password` 에러 반환
2. 비밀번호 불일치하면 `Invalid userName or password` 에러 반환
3. 일치하면 `JWT Token` 생성 후 반환

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "testuser",
    "password": "mypassword",
    "ip_address": "10.15.56.135"
  }'
```

# 2. Get User Info API

## 개요
사용자의 기본 정보를 조회하는 API입니다.  
요청 시 **Request Header**에 반드시 `session_token`이 포함되어야 하며,  
토큰이 없거나 만료되면 에러를 반환합니다.

---


## 요청 (Request)

### URL
```
POST /api/users/getuserinfo
```

### Headers
| Key            | Value                  | 필수 여부 | 설명 |
|----------------|------------------------|-----------|------|
| `Content-Type` | `application/json`     | ✅        | 요청 본문 형식 |
| `session_token`| 발급받은 JWT 토큰 값   | ✅        | 로그인 시 발급된 토큰 |

### Body (JSON)
```json
{
  "user_name": "admin",
  "ip_address": "127.0.0.1"
}
```


| 필드        | 타입   | 필수 여부 | 설명                |
|-------------|--------|-----------|---------------------|
| user_name   | string | ✅        | 조회할 사용자 계정명 |
| ip_address  | string | ✅        | 요청자 IP 주소       |

---

## 응답 (Response)

### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "user": {
    "user_id": 1,
    "user_name": "admin",
    "external_user_name": "관리자",
    "full_name": "Admin User",
    "email": "admin@example.com",
    "notes": "System administrator",
    "total_jobs": 100,
    "total_pages": 2000,
    "reset_by": null,
    "reset_date": null,
    "schedule_period": null,
    "schedule_amount": null,
    "schedule_start": null,
    "deleted": false,
    "deleted_date": null,
    "created_date": "2025-09-21T12:00:00.000Z",
    "created_by": "system",
    "user_source_type": "LOCAL",
    "modified": "2025-09-22T09:00:00.000Z"
  }
}
```

### Failure

#### 1. 토큰 없음
```json
{
  "ResultCode": "3",
  "ErrorMessage": "No session provided"
}
```

#### 2. 토큰 만료 또는 위조됨
```json
{
  "ResultCode": "3",
  "ErrorMessage": "Session expired"
}
```

#### 3. DB 조회 실패 등 기타 에러
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 상세 메시지"
}
```

---

## 비고
- `session_token`은 **로그인 API**를 통해 발급됩니다.  
- 모든 보안 요청 시 반드시 `session_token`을 포함해야 합니다.  
- `session_token`이 만료된 경우, 새로 로그인하여 재발급 받아야 합니다.  
