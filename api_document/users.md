# API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-09-22   | zagan kim | 최초 작성 및 로그인 / Get User Info API 문서 작성 |
| 2025-09-22   | zagan kim | Get User Info API 응답에 dept_name, full_dept_name, security_group_name 추가 |
| 2025-09-29   | zagan kim | 회원가입 요청 API, 로그인 (Verification Code 인증) API 추가 |
| 2025-09-30   | zagan kim | 로그인 API 에 회사코드 추가 |
| 2025-10-03   | zagan kim | 로그인 API return 에 user_role 추가, 회언가입 요청 API애 company_type 추가 |
| 2025-10-03   | zagan kim | 사용자 목록 조회 API |
| 2025-10-18   | zagan kim | 사용자 정보 수정 API, 비밀번호 변경 API 추가 |

## 목차
1. [로그인 API](#1-로그인-api)
2. [Get User Info API](#2-get-user-info-api)
3. [회원가입 요청 API](#3-회원가입-요청-api)
4. [로그인 (Verification Code 인증) API](#4-로그인-verification-code-인증-api)
5. [사용자 목록 조회 API](#5-사용자-목록-조회-api)
6. [사용자 정보 수정 API](#6-사용자-정보-수정-api)
7. [비밀번호 변경 API](#7-비밀번호-변경-api)

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
| `terms_of_service`        | string  | ✅   | 이용약관 동의 여부 Y/N|
| `privacy_policy`          | string  | ✅   | 개인정보 처리방침 동의 여부 Y/N|
| `location_information`    | string  | ✅   | 위치정보 동의 여부 Y/N|
| `notification_email`      | string  | ✅   | 메일 수신 동의 여부 Y/N|
| `full_name`               | string   | ✅   | 사용자 이름 |
| `e_mail_adress`           | string   | ✅   | 이메일 주소 |
| `password`                | string   | ✅   | 비밀번호 (서버에서 bcrypt 해시 처리) |
| `ip_address`              | string   | ✅   | 접속 IP 주소 |

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
| `company_code`     | string | ❌   | 회사 코드 (기업회원인 경우엔 입력) |
| `ip_address`       | string | ✅   | 접속 IP 주소 |

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

   
# 5. 사용자 목록 조회 API

## 개요
내 회사(`company_code`)에 속한 사용자 목록을 조회하는 API입니다.  
조회 시 사용자 정보 중 `password` 필드는 제거되어 응답됩니다.

---

## Endpoint
- **POST** `/api/users/getuserlist`

---

## Request

### Headers
| Key             | Value                  | 설명             |
|-----------------|------------------------|------------------|
| Content-Type    | application/json        | 요청 데이터 타입 |
| Authorization   | Bearer {token}          | JWT 인  증 토큰    |

### Body
```json
{
  "search_user_name": "",
  "search_full_name": "최",
  "search_email": "",
  "items_per_page" : 10, 
  "current_page" : 1, 
  "user_name": "string",
  "company_code": "string",
  "ip_address": "string"
}
```

| 필드명        | 타입    | 필수 | 설명                 |
|---------------|---------|------|----------------------|
| search_user_name     | string  | N    | 조회조건 user_name 이메일임 |
| search_full_name  | string  | N    | 조회조건 사용자 이름           |
| search_email    | string  | N    | 조회조건 이메일 |
| items_per_page     | int  | N    | 페이지당 아이템수   |
| current_page  | int  | Y    | 현재 페이지             |
| user_name     | string  | Y    | 현재 사용자명             |
| company_code  | string  | Y    | 회사 코드            |
| ip_address    | string  | Y    | 접속한 사용자 IP 주소 |

---

## Response

### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "totalPages": 1,
  "users": [
      {
            "user_id": "4c86fc3b-1316-43d3-97b5-b7d19733dad7",
            "user_name": "whmoon10@naver.com",
            "external_user_name": null,
            "full_name": "김형준",
            "email": "whmoon10@naver.com",
            "notes": null,
            "total_jobs": 0,
            "total_pages": 0,
            "reset_by": null,
            "reset_date": null,
            "schedule_period": null,
            "schedule_amount": null,
            "schedule_start": null,
            "deleted": "N",
            "deleted_date": null,
            "created_date": "2025-10-03T06:47:24.052Z",
            "created_by": "4c86fc3b-1316-43d3-97b5-b7d19733dad7",
            "user_source_type": null,
            "modified_date": null,
            "modified_by": null,
            "department": null,
            "office": null,
            "card_number": null,
            "card_number2": null,
            "disabled_printing": "N",
            "disabled_printing_until": null,
            "home_directory": null,
            "balance": 0,
            "sysadmin": null,
            "privilege": "ALL",
            "company_code": 100016,
            "user_type": "COMPANY",
            "user_status": "NEED_AUTH",
            "terms_of_service": "Y",
            "privacy_policy": "N",
            "location_information": "Y",
            "notification_email": "Y",
            "user_role": "PARTNER"
        },
        {
            "user_id": "1be31f33-7b48-473d-bd95-3bb6af2b6d5c",
            "user_name": "hyungseong@naver.com",
            "external_user_name": null,
            "full_name": "최형성",
            "email": "hyungseong@naver.com",
            "notes": null,
            "total_jobs": 0,
            "total_pages": 0,
            "reset_by": null,
            "reset_date": null,
            "schedule_period": null,
            "schedule_amount": null,
            "schedule_start": null,
            "deleted": "N",
            "deleted_date": null,
            "created_date": "2025-10-03T07:19:16.466Z",
            "created_by": "1be31f33-7b48-473d-bd95-3bb6af2b6d5c",
            "user_source_type": null,
            "modified_date": null,
            "modified_by": null,
            "department": null,
            "office": null,
            "card_number": null,
            "card_number2": null,
            "disabled_printing": "N",
            "disabled_printing_until": null,
            "home_directory": null,
            "balance": 0,
            "sysadmin": null,
            "privilege": "ALL",
            "company_code": 100016,
            "user_type": "COMPANY",
            "user_status": "COMPLETE_AUTH",
            "terms_of_service": "Y",
            "privacy_policy": "Y",
            "location_information": "Y",
            "notification_email": "Y",
            "user_role": ""
        }
  ]
}
```

| 필드명        | 타입    | 설명                            |
|---------------|---------|---------------------------------|
| ResultCode    | string  | 결과 코드 ("0" = 성공, "1" = 실패) |
| ErrorMessage  | string  | 에러 메시지 (성공 시 빈 문자열) |
| users         | array   | 사용자 목록 객체 배열            |

---

### Error (401 Unauthorized)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 상세"
}
```

---

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/users/getuserlist   -H "Content-Type: application/json"   -H "Authorization: Bearer {your_token}"   -d '{
    "user_name": "hyungseong@naver.com",
    "company_code": "1000016",
    "ip_address": "10.15.56.135"
  }'
```

---

# 6. 사용자 정보 수정 API

## 개요
사용자의 기본 정보를 수정하는 API입니다.  
**주의**: `user_id`, `user_name`, `email`, `password`는 변경할 수 없습니다.

---

## Endpoint
- **POST** `/api/users/modify`

---

## Request

### Headers
| Key             | Value                  | 필수 여부 | 설명             |
|-----------------|------------------------|-----------|------------------|
| Content-Type    | application/json        | ✅        | 요청 데이터 타입 |
| session_token   | 발급받은 JWT 토큰 값    | ✅        | 로그인 시 발급된 토큰 |

### Body Parameters
| 필드명                    | 타입    | 필수 | 설명                                    |
|---------------------------|---------|------|-----------------------------------------|
| user_id                   | string  | ✅   | 수정할 사용자의 UUID                     |
| external_user_name        | string  | ❌   | 외부 사용자명                           |
| full_name                 | string  | ❌   | 사용자 전체 이름                        |
| notes                     | string  | ❌   | 메모                                    |
| total_jobs                | integer | ❌   | 총 작업 수                              |
| total_pages               | integer | ❌   | 총 페이지 수                            |
| reset_by                  | string  | ❌   | 리셋한 사용자                           |
| reset_date                | string  | ❌   | 리셋 날짜 (YYYY.MM.DD HH:mm:ss 형식)    |
| schedule_period           | string  | ❌   | 스케줄 주기                             |
| schedule_amount           | number  | ❌   | 스케줄 금액                             |
| schedule_start            | integer | ❌   | 스케줄 시작                             |
| deleted                   | string  | ❌   | 삭제 여부 (Y/N)                         |
| deleted_date              | string  | ❌   | 삭제 날짜 (YYYY.MM.DD HH:mm:ss 형식)    |
| user_source_type          | string  | ❌   | 사용자 소스 타입                        |
| department                | string  | ❌   | 부서                                    |
| office                    | string  | ❌   | 사무실                                  |
| card_number               | string  | ❌   | 카드 번호                               |
| card_number2              | string  | ❌   | 카드 번호2                              |
| disabled_printing         | string  | ❌   | 인쇄 비활성화 여부 (Y/N)                |
| disabled_printing_until   | string  | ❌   | 인쇄 비활성화 종료일 (YYYY.MM.DD HH:mm:ss 형식) |
| home_directory            | string  | ❌   | 홈 디렉토리                             |
| balance                   | integer | ❌   | 잔액                                    |
| privilege                 | string  | ❌   | 권한                                    |
| sysadmin                  | string  | ❌   | 시스템 관리자 여부                      |
| user_type                 | string  | ❌   | 사용자 타입                             |
| user_status               | string  | ❌   | 사용자 상태                             |
| terms_of_service          | string  | ❌   | 이용약관 동의 (Y/N)                     |
| privacy_policy            | string  | ❌   | 개인정보처리방침 동의 (Y/N)             |
| location_information      | string  | ❌   | 위치정보 동의 (Y/N)                     |
| notification_email        | string  | ❌   | 이메일 알림 동의 (Y/N)                  |
| user_role                 | string  | ❌   | 사용자 역할                             |
| user_name                 | string  | ✅   | 수정 작업을 수행하는 사용자명           |
| ip_address                | string  | ✅   | 요청자 IP 주소                          |

### Example (Request)
```json
{
  "user_id": "4c86fc3b-1316-43d3-97b5-b7d19733dad7",
  "full_name": "김형준",
  "department": "개발팀",
  "office": "서울사무소",
  "balance": 1000,
  "user_name": "admin@company.com",
  "ip_address": "127.0.0.1"
}
```

---

## Response

### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": ""
}
```

### Failure (401 Unauthorized)
```json
{
  "ResultCode": "3",
  "ErrorMessage": "undefined_foramt_reset_date"
}
```

또는 기타 에러:
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 상세"
}
```

---

## Notes
- 날짜 필드는 `YYYY.MM.DD HH:mm:ss` 형식이어야 합니다.
- 빈 문자열이나 null 값은 적절히 처리됩니다.
- 수정 작업자는 `modified_by`와 `modified_date`가 자동으로 기록됩니다.
- `user_id`, `user_name`, `email`, `password`는 변경할 수 없습니다.

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/users/modify \
  -H "Content-Type: application/json" \
  -H "session_token: <your_session_token>" \
  -d '{
    "user_id": "4c86fc3b-1316-43d3-97b5-b7d19733dad7",
    "full_name": "김형준",
    "department": "개발팀",
    "user_name": "admin@company.com",
    "ip_address": "127.0.0.1"
  }'
```


# 7. 비밀번호 변경 API

## 개요
사용자의 비밀번호를 변경하는 API입니다.  
기존 비밀번호 검증 후 새 비밀번호로 변경됩니다.

---

## Endpoint
- **POST** `/api/users/change_pass`

---

## Request

### Headers
| Key             | Value                  | 필수 여부 | 설명             |
|-----------------|------------------------|-----------|------------------|
| Content-Type    | application/json        | ✅        | 요청 데이터 타입 |
| session_token   | 발급받은 JWT 토큰 값    | ✅        | 로그인 시 발급된 토큰 |

### Body Parameters
| 필드명        | 타입   | 필수 | 설명                                    |
|---------------|--------|------|-----------------------------------------|
| user_id       | string | ✅   | 비밀번호를 변경할 사용자의 UUID         |
| user_name     | string | ✅   | 비밀번호 변경 작업을 수행하는 사용자명  |
| old_password  | string | ✅   | 기존 비밀번호                           |
| new_password  | string | ✅   | 새 비밀번호                             |
| ip_address    | string | ✅   | 요청자 IP 주소                          |

### Example (Request)
```json
{
  "user_id": "4c86fc3b-1316-43d3-97b5-b7d19733dad7",
  "user_name": "admin@company.com",
  "old_password": "oldpassword123",
  "new_password": "newpassword456",
  "ip_address": "127.0.0.1"
}
```

---

## Response

### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": ""
}
```

### Failure (401 Unauthorized)
### 1. 새 비밀번호가 비어있는 경우
```json
{
  "ResultCode": "2",
  "ErrorMessage": "new_password_is_not_null"
}
```

### 2. 기존 비밀번호가 일치하지 않는 경우
```json
{
  "ResultCode": "3",
  "ErrorMessage": "old_password_missmatch"
}
```

# 8. 비밀번호 분실 API

## 개요
사용자가 비밀번호를 분실했을 때 임시 비밀번호를 생성하고,  
6자리 인증 코드를 포함한 안내 메일을 발송하는 API입니다.  

이메일 주소와 이름을 입력하면  
임시 비밀번호와 인증 코드가 해당 이메일로 전송됩니다.  
응답으로는 사용자 유형(`user_type`)이 함께 반환됩니다.  

---

## Endpoint
- **POST** `/api/users/forgot_pass`

---

## Request

### Headers
| Key           | Value               | 필수 여부 | 설명               |
|----------------|---------------------|------------|--------------------|
| Content-Type   | application/json    | ✅         | 요청 데이터 타입   |

### Body Parameters
| 필드명          | 타입     | 필수 | 설명                                           |
|-----------------|----------|------|------------------------------------------------|
| e_mail_address  | string   | ✅   | 비밀번호를 분실한 사용자의 이메일 (user_name) |
| full_name       | string   | ✅   | 비밀번호를 분실한 사용자의 이름               |

### Example (Request)
```json
{
  "e_mail_address": "user@company.com",
  "full_name": "홍길동"
}

## Response

### ✅ Success (200 OK)  
임시 비밀번호와 인증 코드가 이메일로 전송되며, 사용자 유형(`user_type`)을 반환합니다.

```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "user_type": "COMPANY"
}
```

---

### 🔴 Failure (401 Unauthorized)

#### 1. 이메일 주소가 비어있는 경우
```json
{
  "ResultCode": "2",
  "ErrorMessage": "e_mail_address_is_not_null"
}
```

#### 2. 이름이 비어있는 경우
```json
{
  "ResultCode": "3",
  "ErrorMessage": "full_name_is_not_null"
}
```

#### 3. 해당 이메일의 사용자가 존재하지 않는 경우
```json
{
  "ResultCode": "4",
  "ErrorMessage": "no_user"
}
```

#### 4. 기타 서버 오류
```json
{
  "ResultCode": "1",
  "ErrorMessage": "Internal Server Error"
}
```

---

## 동작 흐름(간단)
1. `e_mail_address`, `full_name` 검증 (빈값 체크).  
2. 사용자 존재 여부 확인 (`tbl_user_info` 조회).  
3. 임시 비밀번호 생성 및 해시 저장 (`password` 변경, `user_status` = 'NEED_AUTH').  
4. 6자리 인증 코드 생성하여 `tbl_auth_info`에 저장(유효기간 3시간).  
5. 사용자 이메일로 인증 코드 + 임시 비밀번호 전송.  
6. 성공 응답: `ResultCode: "0"`, `user_type` 반환.  
   실패 시 적절한 `ResultCode`와 `ErrorMessage` 반환.

---

## 이메일 템플릿 예시

### 기업 사용자 (`user_type = COMPANY`)
```
안녕하세요, [회사명] 기업 고객 [홍길동] 님

마일레이션 클라우드 MPS 의 계정은 user@company.com 이고
회사 코드는 [company_code] 입니다.

아래 6자리 인증 코드와 임시 비밀번호를 입력하여 로그인을 완료해 주세요.
인증 코드: 123456
임시 비밀번호: Abc123xyz

이 코드는 3시간 동안 유효합니다.
[비밀번호 변경 및 로그인 하러 가기]
https://client-host/login?userType=company&init=true
```

### 개인 사용자 (`user_type = PERSON`)
```
안녕하세요, [홍길동] 님

마일레이션 클라우드 MPS 의 계정은 user@company.com 입니다.

아래 6자리 인증 코드와 임시 비밀번호를 입력하여 로그인을 완료해 주세요.
인증 코드: 654321
임시 비밀번호: Xyz789abc

이 코드는 3시간 동안 유효합니다.
[비밀번호 변경 및 로그인 하러 가기]
https://client-host/login?userType=person&init=true
```
