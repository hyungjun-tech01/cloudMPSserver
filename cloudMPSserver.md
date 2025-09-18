# 로그인 API

## 1. API 정보

-   **설명**: 사용자 이름과 비밀번호를 이용하여 로그인을 처리하고, 성공 시 JWT 인증 토큰을 발급합니다.
-   **엔드포인트**: `/api/users/login`
-   **HTTP 메서드**: `POST`
-   **호스트**: `host:port`

## 2. 요청 (Request)

### 요청 형식
`application/json`

### 요청 본문

```json
{
  "user_name": "string",
  "password": "string"
}

요청 필드
필드명	타입	필수	설명
user_name	string	예	사용자의 고유 아이디 또는 이름
password	string	예	사용자 비밀번호
3. 응답 (Response)
3.1. 성공 응답 (Status Code: 200 OK)
로그인이 성공적으로 완료되었을 때 반환됩니다.
응답 본문
json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}

응답 필드
필드명	타입	설명
ResultCode	string	"0"은 성공을 의미합니다.
ErrorMessage	string	성공 시 빈 문자열입니다.
token	string	로그인에 성공한 사용자에게 발급되는 JWT 인증 토큰입니다.
3.2. 실패 응답 (Status Code: 401 Unauthorized)
사용자 이름 또는 비밀번호가 일치하지 않아 인증에 실패했을 때 반환됩니다.
응답 본문
json
{
  "ResultCode": "1",
  "ErrorMessage": "Invalid userName or password"
}

응답 필드
필드명	타입	설명
ResultCode	string	"1"은 실패를 의미합니다.
ErrorMessage	string	실패 원인을 설명하는 메시지입니다.