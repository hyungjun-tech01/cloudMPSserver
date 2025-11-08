# REST API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-01-15   | zagan kim | REST API 최초 작성 |

## 목차
1. [MFP ID/PWD 로그인 API](#1-mfp-idpwd-로그인-api)
2. [ID/PWD 토큰 발급 API](#2-idpwd-토큰-발급-api)
3. [디바이스 상태 업데이트 API](#3-디바이스-상태-업데이트-api)

---

# 1. MFP ID/PWD 로그인 API

## 개요
사용자 ID와 비밀번호를 사용하여 로그인하는 API입니다.  
인증 성공 시 사용자 정보와 함께 성공 메시지를 반환합니다.  
JWT 토큰은 생성되지만 응답에는 포함되지 않습니다.

---

## Endpoint
- **POST** `/api/restapi/MFPIDPWDLogin`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| auth_token | Y | 고정발급받은 토큰 - 문의 바람|

```json
{
  "Content-Type": "application/json",
  "auth_token": "MMDJJIEN.JJ......"
}
```

### Body
```json
{
  "user_name": "admin@company.com",
  "password": "password123",
  "ip_address": "192.168.0.1"
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| user_name | string | Y | 사용자명 (로그인 ID) |
| password | string | Y | 비밀번호 (bcrypt 해시 비교) |
| ip_address | string | Y | 요청자 IP 주소 |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "result": "OK",
  "details": {
    "description": "로그인 성공",
    "ID": "admin@company.com",
    "full_name": "홍길동",
    "privilege": "ADMIN"
  }
}
```

### ❌ 실패 (401 Unauthorized)

#### 1. 잘못된 사용자명 또는 비밀번호
```json
{
  "result": "NG",
  "details": {
    "description": "등록되지 않은 ID이거나 잘못된 비밀번호입니다.",
    "ID": "",
    "full_name": "",
    "privilege": ""
  }
}
```

#### 2. 사용자 없음
```json
{
  "result": "NG",
  "details": {
    "description": "Invalid userName or password",
    "ID": "",
    "full_name": "",
    "privilege": ""
  }
}
```

---

## Process Flow
1. `tbl_user_info`에서 `user_name`으로 사용자 조회
   - 조건: `user_status='COMPLETE_AUTH'` AND `deleted = 'N'`
2. 사용자가 없으면 에러 반환
3. bcrypt로 비밀번호 비교
4. 비밀번호 일치 시:
   - 사용자 정보 반환 (ID, full_name, privilege)
5. 비밀번호 불일치 시 에러 반환

---



---

## Notes
- 비밀번호는 bcrypt로 해시되어 저장된 값과 비교됩니다
- 인증된 사용자만 로그인 가능 (`user_status='COMPLETE_AUTH'`)
- 삭제된 사용자는 로그인 불가 (`deleted = 'N'`)
- 모든 요청은 `user_name`, `ip_address` 기준으로 로깅됩니다.

---

# 2. ID/PWD 토큰 발급 API

## 개요
사용자 ID와 비밀번호를 사용하여 로그인하고,  
원격 클라이언트용 토큰(`remote_client_token`)을 발급하는 API입니다.  
토큰은 `tbl_auth_info` 테이블에 저장되며, 만료일은 2099-12-31로 설정됩니다.

---

## Endpoint
- **POST** `/api/restapi/IDPWDGetToken`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| auth_token | Y | 고정발급받은 토큰 - 문의 바람|

```json
{
  "Content-Type": "application/json",
  "auth_token": "MMDJJIEN.JJ......"
}
```

### Body
```json
{
  "user_name": "admin@company.com",
  "password": "password123",
  "ip_address": "192.168.0.1"
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| user_name | string | Y | 사용자명 (로그인 ID) |
| password | string | Y | 비밀번호 (bcrypt 해시 비교) |
| ip_address | string | Y | 요청자 IP 주소 |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "result": "OK",
  "remote_client_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "details": {
    "description": "로그인 성공",
    "ID": "admin@company.com",
    "full_name": "홍길동",
    "privilege": "ADMIN"
  }
}
```

### ❌ 실패 (401 Unauthorized)

#### 1. 잘못된 사용자명 또는 비밀번호
```json
{
  "result": "NG",
  "details": {
    "description": "등록되지 않은 ID이거나 잘못된 비밀번호입니다.",
    "ID": "",
    "full_name": "",
    "privilege": ""
  }
}
```

#### 2. 사용자 없음
```json
{
  "result": "NG",
  "details": {
    "description": "Invalid userName or password",
    "ID": "",
    "full_name": "",
    "privilege": ""
  }
}
```

---

## Process Flow
1. `tbl_user_info`에서 `user_name`으로 사용자 조회
   - 조건: `user_status='COMPLETE_AUTH'` AND `deleted = 'N'`
2. 사용자가 없으면 에러 반환
3. bcrypt로 비밀번호 비교
4. 비밀번호 일치 시:
   - `tbl_auth_info`에 토큰 정보 저장
     - `auth_type`: 'REMOTE_CLIENT_TOKEN'
     - `expired_date`: '2099.12.31'
   - 사용자 정보와 토큰 반환
5. 비밀번호 불일치 시 에러 반환

---


---

## Notes
- 비밀번호는 bcrypt로 해시되어 저장된 값과 비교됩니다
- 발급된 토큰은 `remote_client_token` 필드에 포함되어 반환됩니다
- 토큰은 `tbl_auth_info` 테이블에 저장되며, 만료일은 2099-12-31로 설정됩니다
- 인증된 사용자만 로그인 가능 (`user_status='COMPLETE_AUTH'`)
- 삭제된 사용자는 로그인 불가 (`deleted = 'N'`)
- 모든 요청은 `user_name`, `ip_address` 기준으로 로깅됩니다
- 이 토큰은 원격 클라이언트에서 디바이스 상태 업데이트 등에 사용됩니다

---

# 3. 디바이스 상태 업데이트 API

## 개요
원격 클라이언트에서 디바이스(프린터/복합기)의 상태 정보를 업데이트하는 API입니다.  
디바이스가 존재하지 않으면 자동으로 생성하며,  
토너/드럼 잔량, 인쇄 페이지 수 등의 정보를 기록합니다.

---

## Endpoint
- **POST** `/api/restapi/DeviceStatusUpdate`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| auth_token | Y | `기전달된 토큰 : 문의바람` |
| remote_client_token | Y | `/IDPWDGetToken` API로 발급받은 토큰 |

```json
{
  "Content-Type": "application/json",
  "auth_token": "MMDJJIEN.JJ......",
  "remote_client_token" : "Mduwgt6BBjd......"
}
```

### Body
```json
{
  "Model": "Sindoh A4-2020",
  "SerialNo": "SN123456789",
  "Status": "ACTIVE",
  "BlackToner": 85,
  "CyanToner": 92,
  "MagentaToner": 78,
  "YellowToner": 88,
  "BlackDrum": 45,
  "CyanDrum": 52,
  "MagentaDrum": 38,
  "YellowDrum": 48,
  "A3BlackPages": 1000,
  "A3ColorPages": 500,
  "A4BlackPages": 5000,
  "A4ColorPages": 2000
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| Model | string | Y | 디바이스 모델명 |
| SerialNo | string | Y | 시리얼 번호 |
| Status | string | Y | 디바이스 상태 |
| BlackToner | integer | N | 검정 토너 잔량 (0-100, null 가능) |
| CyanToner | integer | N | 시안 토너 잔량 (0-100, null 가능) |
| MagentaToner | integer | N | 마젠타 토너 잔량 (0-100, null 가능) |
| YellowToner | integer | N | 옐로우 토너 잔량 (0-100, null 가능) |
| BlackDrum | integer | N | 검정 드럼 잔량 (0-100, null 가능) |
| CyanDrum | integer | N | 시안 드럼 잔량 (0-100, null 가능) |
| MagentaDrum | integer | N | 마젠타 드럼 잔량 (0-100, null 가능) |
| YellowDrum | integer | N | 옐로우 드럼 잔량 (0-100, null 가능) |
| A3BlackPages | integer | N | A3 흑백 인쇄 페이지 수 (null 가능) |
| A3ColorPages | integer | N | A3 컬러 인쇄 페이지 수 (null 가능) |
| A4BlackPages | integer | N | A4 흑백 인쇄 페이지 수 (null 가능) |
| A4ColorPages | integer | N | A4 컬러 인쇄 페이지 수 (null 가능) |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "result": "OK",
  "details": {
    "description": ""
  }
}
```

### ❌ 실패 (401 Unauthorized)

#### 1. 토큰 오류
```json
{
  "result": "NG",
  "details": {
    "description": "remote_client_token 토큰 에러입니다. 토큰을 새로 받으세요."
  }
}
```

#### 2. 토너/드럼 잔량 범위 오류
```json
{
  "result": "NG",
  "details": {
    "description": "BlackToner is_between_0_100"
  }
}
```

#### 3. 숫자 형식 오류
```json
{
  "result": "NG",
  "details": {
    "description": "CyanToner is_not_number"
  }
}
```

#### 4. 인증되지 않은 사용자
```json
{
  "result": "NG",
  "details": {
    "description": "인증하지 않은 사용자이거나 삭제된 사용자입니다."
  }
}
```

---

## Process Flow
1. `remote_client_token` 헤더에서 토큰 추출
2. 트랜잭션 시작
3. `tbl_auth_info`에서 토큰으로 `user_id` 조회
   - 조건: `auth_type = 'REMOTE_CLIENT_TOKEN'` AND `expired_date >= now()`
4. 토큰이 유효하지 않으면 에러 반환
5. `tbl_user_info`에서 사용자 정보 조회 및 검증
   - 조건: `user_status='COMPLETE_AUTH'` AND `deleted = 'N'`
6. `tbl_device_info`에서 `Model`과 `SerialNo`로 디바이스 조회
7. 디바이스가 없으면:
   - 새 `device_id` 생성 (UUID)
   - `tbl_device_info`에 디바이스 정보 삽입
   - `tbl_client_device_info`에 클라이언트-디바이스 연결 정보 삽입
     - 개인회원(`PERSON`): `user_id` 저장
     - 기업회원(`COMPANY`): `company_code` 저장
8. 토너/드럼 잔량 값 검증 (0-100 범위, 숫자 형식)
9. 페이지 수 값 검증 (정수 형식)
10. `tbl_device_count_info`에 디바이스 상태 정보 삽입
11. 트랜잭션 커밋
12. 성공 응답 반환

---

---

## Notes
- 토너/드럼 잔량은 0-100 범위의 정수값이어야 합니다 (null 가능)
- 페이지 수는 정수값이어야 합니다 (null 가능)
- 토너/드럼 잔량이 빈 문자열, undefined, null이면 NULL로 처리됩니다
- 페이지 수가 빈 문자열, undefined, null이면 NULL로 처리됩니다
- 디바이스가 존재하지 않으면 자동으로 생성됩니다
- 사용자 타입에 따라 클라이언트-디바이스 연결 정보가 다르게 저장됩니다
  - 개인회원(`PERSON`): `user_id` 저장
  - 기업회원(`COMPANY`): `company_code` 저장
- 모든 요청은 `SerialNo`, `Model` 기준으로 로깅됩니다
- 트랜잭션을 사용하여 데이터 일관성을 보장합니다
- 오류 발생 시 자동으로 롤백됩니다

