# API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-09-22   | zagan kim | 최초 작성 및 로그인 / Get User Info API 문서 작성 |
| 2025-09-22   | zagan kim | Get User Info API 응답에 dept_name, full_dept_name, security_group_name 추가 |
| 2025-09-29   | zagan kim | 회원가입 요청 API, 로그인 (Verification Code 인증) API 추가 |
| 2025-09-30   | zagan kim | 로그인 API 에 회사코드 추가 |
| 2025-10-03   | zagan kim | 로그인 API return 에 user_role 추가, 회언가입 요청 API애 company_type 추가 |

## 목차
1. [로그인 API](#1-로그인-api)
2. [Get User Info API](#2-get-user-info-api)
3. [회원가입 요청 API](#3-회원가입-요청-api)
4. [로그인 (Verification Code 인증) API](#4-로그인-verification-code-인증-api)

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
  "company_code": "string", (optional)
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
3. 회사코드와 사용자가 맞지 않을 경우 경우도 `Invalid userName or password` 에러 반환
4. 회사코드가 없는 경우 `Invalid Company Code` 에러 반환
5. 일치하면 `JWT Token` 생성 후 반환

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "testuser",
    "password": "mypassword",
    "comapny_code": "100002",  (Optional)
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
  "user_name": "whmoon@naver.com",
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
    "user_name": "whmoon@naver.com",
    "external_user_name": "관리자",
    "full_name": "김형준",
    "email": "whmoon@naver.com",
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
    "modified": "2025-09-22T09:00:00.000Z",
    "user_role": "PARTNER",
    "dept_name": "Biz플랫폼부",
    "full_dept_name": "마이레이션 > 은행사업본부 > Biz플랫폼부",
    "security_group_name": "경영그룹"    
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

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/users/getuserinfo \
  -H "Content-Type: application/json" \
  -H "session_token: <your_session_token>" \
  -d '{
    "user_name": "whmoon@naver.com",
    "ip_address": "127.0.0.1"
  }'
```

# 3. 회원가입 요청 API

## Endpoint
- **POST** `/api/users/signup_request`

## Request

### Headers
- `Content-Type: application/json`
- (선택) `Authorization`: 필요 시 로컬체크 미들웨어(`localcheck`)에서 인증 처리

### Body Parameters

| 이름                      | 타입      | 필수 | 설명 |
|---------------------------|----------|------|------|
| `user_type`               | string   | ✅   | 회원 타입 (예: PERSON, COMPANY 등) |
| `company_type`            | string   | ✅   | 회사타입 PARTNER, GENERAL |
| `company_name`            | string   | ✅   | 회사명 |
| `business_registration_code` | string | ✅   | 사업자등록번호 |
| `company_code`            | string   | ❌   | 회사 코드 (없으면 DB에서 생성) |
| `deal_company_code`       | string   | ❌   | 거래처 코드 |
| `ceo_name`                | string   | ✅   | 대표자명 |
| `language`                | string   | ✅   | 언어 코드 (예: ko, en 등) |
| `time_zone`               | string   | ✅   | 시간대 (예: Asia/Seoul) |
| `currency_code`           | string   | ✅   | 통화 코드 (예: KRW, USD 등) |
| `country`                 | string   | ✅   | 국가 |
| `terms_of_service`        | boolean  | ✅   | 이용약관 동의 여부 |
| `privacy_policy`          | boolean  | ✅   | 개인정보 처리방침 동의 여부 |
| `location_information`    | boolean  | ❌   | 위치정보 동의 여부 |
| `notification_email`      | boolean  | ❌   | 메일 수신 동의 여부 |
| `full_name`               | string   | ✅   | 사용자 이름 |
| `e_mail_adress`           | string   | ✅   | 이메일 주소 |
| `password`                | string   | ✅   | 비밀번호 (서버에서 bcrypt 해시 처리) |
| `ip_address`              | string   | ❌   | 접속 IP 주소 |

 - COMPANY 타입일 경우 회사코드가 들어오면 해당 회사의 사용자를 등록하고 
 - 회사코드가 들어 오지 않으면 회사를 생성하여 회사코드를 리턴해 준다. 
 - PERSON 타입을 경우 회사정보는 들어올 필요 없다.
### Example (Request)
```json
{
  "user_type": "company",
  "company_name": "테스트 주식회사",
  "company_type": "PARTNER",
  "business_registration_code": "123-45-67890",
  "company_code": null,
  "deal_company_code": null,
  "ceo_name": "홍길동",
  "language": "ko",
  "time_zone": "Asia/Seoul",
  "currency_code": "KRW",
  "country": "KR",
  "terms_of_service": "Y",
  "privacy_policy": "Y",
  "location_information": "Y",
  "notification_email": "N",
  "full_name": "홍길동",
  "e_mail_adress": "hong@test.com",
  "password": "mypassword",
  "ip_address": "127.0.0.1"
}
```

---

## Response

### 성공 (200 OK)

```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "verification_code": "123456",
  "company_code": "100014"
}
```

- `verification_code`: 이메일 인증용 6자리 코드 (3시간 유효)
- `company_code`: 회원가입 시 부여된 회사 코드

사용자에게 이메일 발송됨:
- 제목: "마일레이션 클라우드MPS 회원 가입의 인증코드입니다."
- 내용: 회사명, 이름, 이메일, 회사코드, 인증코드 안내

---

### 실패 (200 OK or 401)

```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 발생: 중복된 키 값이 \"tbl_user_info_pkey\" 고유 제약 조건을 위반함)"
}
```
tbl_user_info_pkey 는 email 입니다.

또는 서버 에러 발생 시:
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 상세"
}
```

---

## Notes
- 비밀번호는 서버에서 `bcrypt`로 해시 처리 후 저장.
- 인증 메일은 회원가입 성공 시 발송됨.
- 인증코드 유효기간은 **3시간**.


# 4. 로그인 (Verification Code 인증) API

## Endpoint
- **POST** `/api/users/login_vericode`

## 설명
회원가입 후 최초 로그인 시, 발급된 **Verification Code**와 함께 로그인합니다.  
로그인 성공 시 JWT 토큰을 발급받습니다.

---

## Request

### Headers
- `Content-Type: application/json`
- (선택) `Authorization`: 필요 시 로컬체크 미들웨어(`localcheck`)에서 인증 처리

### Body Parameters

| 이름               | 타입    | 필수 | 설명 |
|--------------------|--------|------|------|
| `user_name`        | string | ✅   | 사용자 아이디 |
| `password`         | string | ✅   | 비밀번호 |
| `verification_code`| string | ✅   | 회원가입 시 이메일로 받은 인증 코드 |
| `company_code`     | string | ❌   | 회사 코드 (존재하는 경우 검증) |
| `ip_address`       | string | ❌   | 접속 IP 주소 |

### Example (Request)
```json
{
  "user_name": "hong@test.com",
  "password": "mypassword",
  "verification_code": "V8taut",
  "company_code": "100007",
  "ip_address": "127.0.0.1"
}
```
 - user_name 은 회원 가입시 입력한 e-mail address 임.
 - password 는 회원 가입시 입력한  password 임.
 - verification_code  회원 가입시 리턴한 코드임. (메일로 전달되어야 하나 아직은 안됨)
 - company_code 회원 가입시 리턴한 회사 코드임. (메일로 전달되어야 하나 아직은 안됨)

---

## Response

### 성공 (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
}
```
- `token`: JWT 인증 토큰 (유효기간 8시간)

---

### 실패 (401 Unauthorized)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "Invalid userName or password or verification code"
}
```

또는 회사 코드가 잘못된 경우:
```json
{
  "ResultCode": "1",
  "ErrorMessage": "Invalid Company Code"
}
```

---

## Notes
- 로그인 시 비밀번호는 `bcrypt.compare`로 검증합니다.
- 인증코드(`verification_code`)는 회원가입 시 이메일로 전달된 값을 사용합니다.
- 성공 시 `tbl_user_info.user_status`가 `COMPLETE_AUTH`로 변경됩니다.
- JWT 토큰은 **8시간** 동안 유효합니다.
