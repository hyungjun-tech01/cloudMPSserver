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
