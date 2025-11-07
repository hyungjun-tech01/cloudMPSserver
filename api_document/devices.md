# Device API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-01-15   | zagan kim | Device API 최초 작성 |
| 2025-11-07   | zagan kim | 디바이스 정보 조회 api 추가 |

## 목차
1. [디바이스 등록 API](#1-디바이스-등록-api)
2. [디바이스 목록 조회 API](#2-디바이스-목록-조회-api)
3. [디바이스 수정 API](#3-디바이스-수정-api)
4. [디바이스 정보 조회 API](#4-디바이스-정보-조회-api)

---

# 1. 디바이스 등록 API

## 개요
새로운 디바이스(프린터/복합기)를 시스템에 등록하는 API입니다.  
디바이스 정보와 토너/드럼 잔량 정보를 함께 등록하며,  
클라이언트와의 연결 정보도 함께 생성됩니다.

---

## Endpoint
- **POST** `/api/devices/create`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| session_token | Y | 로그인 시 발급된 JWT 토큰 |

### Body
```json
{
  "device_name": "회의실 프린터",
  "ext_device_function": "PRINT_SCAN_COPY",
  "physical_device_id": "192.168.1.100",
  "location": "3층 회의실",
  "device_model": "Sindoh A4-2020",
  "serial_number": "SN123456789",
  "device_status": "ACTIVE",
  "device_type": "MULTIFUNCTION",
  "black_toner_percentage": 85,
  "cyan_toner_percentage": 92,
  "magenta_toner_percentage": 78,
  "yellow_toner_percentage": 88,
  "app_type": "CLOUD_MPS",
  "black_drum_percentage": 45,
  "cyan_drum_percentage": 52,
  "magenta_drum_percentage": 38,
  "yellow_drum_percentage": 48,
  "client_id": "uuid-string",
  "user_name": "admin@company.com",
  "company_code": "100008",
  "ip_address": "192.168.0.1"
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| device_name | string | Y | 디바이스 이름 |
| ext_device_function | string | N | 외부 디바이스 기능 |
| physical_device_id | string | N | 물리적 디바이스 ID (IP 주소 등) |
| location | string | N | 디바이스 위치 |
| device_model | string | N | 디바이스 모델명 |
| serial_number | string | N | 시리얼 번호 |
| device_status | string | N | 디바이스 상태 |
| device_type | string | N | 디바이스 타입 |
| black_toner_percentage | integer | N | 검정 토너 잔량 (0-100) |
| cyan_toner_percentage | integer | N | 시안 토너 잔량 (0-100) |
| magenta_toner_percentage | integer | N | 마젠타 토너 잔량 (0-100) |
| yellow_toner_percentage | integer | N | 옐로우 토너 잔량 (0-100) |
| app_type | string | N | 애플리케이션 타입 |
| black_drum_percentage | integer | N | 검정 드럼 잔량 (0-100) |
| cyan_drum_percentage | integer | N | 시안 드럼 잔량 (0-100) |
| magenta_drum_percentage | integer | N | 마젠타 드럼 잔량 (0-100) |
| yellow_drum_percentage | integer | N | 옐로우 드럼 잔량 (0-100) |
| client_id | string | Y | 연결할 클라이언트 ID |
| user_name | string | Y | 요청 사용자명 |
| company_code | string | Y | 회사 코드 |
| ip_address | string | Y | 요청자 IP 주소 |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "x_device_id": "uuid-generated-device-id"
}
```

### ❌ 실패 (401 Unauthorized)

#### 1. 토너/드럼 잔량 범위 오류
```json
{
  "ResultCode": "2",
  "ErrorMessage": "black_toner_percentage is_between_0_100"
}
```

#### 2. 숫자 형식 오류
```json
{
  "ResultCode": "2",
  "ErrorMessage": "cyan_toner_percentage is_not_number"
}
```

#### 3. 기타 서버 오류
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 상세"
}
```

---

## Process Flow
1. `localcheck` 미들웨어로 로컬 접속 검증
2. `authMiddleware`로 JWT 토큰 검증
3. 토너/드럼 잔량 값 검증 (0-100 범위, 숫자 형식)
4. 사용자 ID 조회 (`user_name`으로 `user_id` 조회)
5. 새로운 디바이스 ID 생성 (UUID)
6. 트랜잭션 시작
7. `tbl_device_info`에 디바이스 정보 삽입
8. `tbl_client_device_info`에 클라이언트-디바이스 연결 정보 삽입
9. 트랜잭션 커밋
10. 성공 시 생성된 `device_id` 반환

---

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/devices/create \
  -H "Content-Type: application/json" \
  -H "session_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "device_name": "회의실 프린터",
    "physical_device_id": "192.168.1.100",
    "location": "3층 회의실",
    "device_model": "Sindoh A4-2020",
    "serial_number": "SN123456789",
    "device_status": "ACTIVE",
    "device_type": "MULTIFUNCTION",
    "black_toner_percentage": 85,
    "cyan_toner_percentage": 92,
    "magenta_toner_percentage": 78,
    "yellow_toner_percentage": 88,
    "black_drum_percentage": 45,
    "cyan_drum_percentage": 52,
    "magenta_drum_percentage": 38,
    "yellow_drum_percentage": 48,
    "client_id": "87e8a689-94d9-420c-a685-8bcc71a1f87f",
    "user_name": "admin@company.com",
    "company_code": "100008",
    "ip_address": "192.168.0.1"
  }'
```

---

# 2. 디바이스 목록 조회 API

## 개요
내 회사(`company_code`)에 등록된 디바이스 목록을 조회하는 API입니다.  
검색 조건에 따라 필터링이 가능하며, 페이징을 지원합니다.

---

## Endpoint
- **POST** `/api/devices/getdevicelist`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| session_token | Y | 로그인 시 발급된 JWT 토큰 |

### Body
```json
{
  "search_client_name": "스몰컴퍼니",
  "search_device_name": "회의실",
  "search_device_location": "3층",
  "search_device_notes": "",
  "search_device_ip_address": "192.168.1",
  "search_device_model": "Sindoh",
  "items_per_page": 10,
  "current_page": 1,
  "user_name": "admin@company.com",
  "company_code": "100008",
  "ip_address": "192.168.0.1"
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| search_client_name | string | N | 클라이언트명 검색 (부분 검색) |
| search_device_name | string | N | 디바이스명 검색 (부분 검색) |
| search_device_location | string | N | 디바이스 위치 검색 (부분 검색) |
| search_device_notes | string | N | 디바이스 메모 검색 (부분 검색) |
| search_device_ip_address | string | N | 디바이스 IP 주소 검색 (부분 검색) |
| search_device_model | string | N | 디바이스 모델 검색 (부분 검색) |
| items_per_page | integer | N | 페이지당 아이템 수 (기본값: 10) |
| current_page | integer | N | 현재 페이지 (기본값: 1) |
| user_name | string | Y | 요청 사용자명 |
| company_code | string | Y | 회사 코드 |
| ip_address | string | Y | 요청자 IP 주소 |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "totalPages": 3,
  "devices": [
    {
      "device_id": "uuid-device-id-1",
      "device_name": "회의실 프린터",
      "created_date": "2025-01-15T09:00:00.000Z",
      "created_by": "uuid-user-id",
      "modified_date": "2025-01-15T09:00:00.000Z",
      "modified_by": "uuid-user-id",
      "ext_device_function": "PRINT_SCAN_COPY",
      "physical_device_id": "192.168.1.100",
      "location": "3층 회의실",
      "device_model": "Sindoh A4-2020",
      "serial_number": "SN123456789",
      "device_status": "ACTIVE",
      "device_type": "MULTIFUNCTION",
      "black_toner_percentage": 85,
      "cyan_toner_percentage": 92,
      "magenta_toner_percentage": 78,
      "yellow_toner_percentage": 88,
      "app_type": "CLOUD_MPS",
      "black_drum_percentage": 45,
      "cyan_drum_percentage": 52,
      "magenta_drum_percentage": 38,
      "yellow_drum_percentage": 48,
      "client_name": "스몰컴퍼니"
    }
  ]
}
```

### ❌ 실패 (401 Unauthorized)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 상세"
}
```

---

## Process Flow
1. `localcheck` 미들웨어로 로컬 접속 검증
2. `authMiddleware`로 JWT 토큰 검증
3. 검색 조건 값들을 안전하게 처리 (undefined/null → 빈 문자열)
4. 페이징 파라미터 검증 및 설정
5. `tbl_device_info`, `tbl_client_device_info`, `tbl_client_info` 조인하여 조회
6. 검색 조건에 따른 필터링 (ILIKE 부분 검색)
7. 총 페이지 수 계산
8. 페이징 적용하여 결과 반환

---

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/devices/getdevicelist \
  -H "Content-Type: application/json" \
  -H "session_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "search_client_name": "스몰컴퍼니",
    "search_device_name": "회의실",
    "search_device_location": "3층",
    "items_per_page": 10,
    "current_page": 1,
    "user_name": "admin@company.com",
    "company_code": "100008",
    "ip_address": "192.168.0.1"
  }'
```

---

## Notes
- 토너/드럼 잔량은 0-100 범위의 정수값이어야 합니다
- 검색 조건은 모두 부분 검색(ILIKE)을 지원합니다
- 페이징은 `getSafePagination` 유틸리티를 사용하여 안전하게 처리됩니다
- 모든 요청은 `user_name`, `ip_address` 기준으로 로깅됩니다
- 트랜잭션을 사용하여 데이터 일관성을 보장합니다

# 3. 디바이스 수정 API

## 개요
등록된 디바이스의 정보를 수정하는 API입니다.
디바이스 정보와 클라이언트 연결 정보를 함께 수정할 수 있습니다.

---

## Endpoint
- **POST** `/api/devices/modify`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| session_token | Y | 로그인 시 발급된 JWT 토큰 |

### Body
```json
{
    "device_id": "a5eaccd8-0837-4be5-8e6f-787fd4f5354d",
    "device_name" : "복사기03333",
    "ext_device_function" : "",
    "physical_device_id" : "10.1.1.100",
    "location" : "사무실03",
    "device_model" : "MFP2000",
    "serial_number" : "222-3333",
    "device_status" : "대기",
    "device_type" : "ALL",
    "black_toner_percentage" : "",
    "cyan_toner_percentage" : "",
    "magenta_toner_percentage" : "",
    "yellow_toner_percentage" : "",
    "app_type" : "",
    "black_drum_percentage" : "",
    "cyan_drum_percentage" : "",
    "magenta_drum_percentage" : "",
    "yellow_drum_percentage" : "",
    "client_id" : "dc823299-bdd4-4196-8cc3-1e2aea124299",
    "user_name" : "whmoon000@naver.com",
    "company_code" : "100014",
    "ip_address" : "111.111.1.10"
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| device_id | string | Y | 수정할 디바이스 ID (UUID) |
| device_name | string | Y | 디바이스 이름 |
| ext_device_function | string | N | 외부 디바이스 기능 |
| physical_device_id | string | N | 물리적 디바이스 ID (IP 주소 등) |
| location | string | N | 디바이스 위치 |
| device_model | string | N | 디바이스 모델명 |
| serial_number | string | N | 시리얼 번호 |
| device_status | string | N | 디바이스 상태 |
| device_type | string | N | 디바이스 타입 |
| black_toner_percentage | integer | N | 검정 토너 잔량 (0-100) |
| cyan_toner_percentage | integer | N | 시안 토너 잔량 (0-100) |
| magenta_toner_percentage | integer | N | 마젠타 토너 잔량 (0-100) |
| yellow_toner_percentage | integer | N | 옐로우 토너 잔량 (0-100) |
| app_type | string | N | 애플리케이션 타입 |
| black_drum_percentage | integer | N | 검정 드럼 잔량 (0-100) |
| cyan_drum_percentage | integer | N | 시안 드럼 잔량 (0-100) |
| magenta_drum_percentage | integer | N | 마젠타 드럼 잔량 (0-100) |
| yellow_drum_percentage | integer | N | 옐로우 드럼 잔량 (0-100) |
| client_id | strin

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": ""
}
```

### ❌ 실패 (401 Unauthorized)
(에러 케이스는 /create와 동일)

---

## Process Flow
1. `localcheck` 미들웨어로 로컬 접속 검증
2. `authMiddleware`로 JWT 토큰 검증
3. 토너/드럼 잔량 값 검증 (0-100 범위, 숫자 형식)
4. 사용자 ID 조회 (`user_name`으로 `user_id` 조회)
5. 트랜잭션 시작
6. `tbl_client_device_info`에서 클라이언트 연결 정보 업데이트
7. `tbl_device_info`에서 디바이스 정보 업데이트
8. 트랜잭션 커밋
9. 성공 응답 반환

---

## Example (curl)
```
curl -X POST http://localhost:38005/api/devices/modify \
  -H "Content-Type: application/json" \
  -H "session_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "device_id": "a5eaccd8-0837-4be5-8e6f-787fd4f5354d",
    "device_name": "회의실 프린터 수정",
    "physical_device_id": "192.168.1.100",
    "location": "3층 회의실",
    "device_model": "Sindoh A4-2020",
    "serial_number": "SN123456789",
    "device_status": "ACTIVE",
    "device_type": "MULTIFUNCTION",
    "black_toner_percentage": 85,
    "cyan_toner_percentage": 92,
    "magenta_toner_percentage": 78,
    "yellow_toner_percentage": 88,
    "black_drum_percentage": 45,
    "cyan_drum_percentage": 52,
    "magenta_drum_percentage": 38,
    "yellow_drum_percentage": 48,
    "client_id": "dc823299-bdd4-4196-8cc3-1e2aea124299",
    "user_name": "whmoon000@naver.com",
    "company_code": "100014",
    "ip_address": "111.111.1.10"
  }'
```
# 4. 디바이스 정보 조회 API

## 개요
특정 디바이스의 상세 정보를 조회하는 API입니다.  
`device_id`를 기준으로 단일 디바이스 정보를 반환하며,  
클라이언트 정보도 함께 조회됩니다.

---

## Endpoint
- **POST** `/api/devices/getdeviceinfo`

---

## Request

### Headers
| 키 | 필수 | 설명 |
|----|------|------|
| Content-Type | Y | `application/json` |
| session_token | Y | 로그인 시 발급된 JWT 토큰 |

### Body
```json
{
  "device_id": "a5eaccd8-0837-4be5-8e6f-787fd4f5354d",
  "user_name": "admin@company.com",
  "company_code": "100008",
  "ip_address": "192.168.0.1"
}
```

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| device_id | string | Y | 조회할 디바이스 ID (UUID) |
| user_name | string | Y | 요청 사용자명 |
| company_code | string | Y | 회사 코드 |
| ip_address | string | Y | 요청자 IP 주소 |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "devices": {
    "device_id": "a5eaccd8-0837-4be5-8e6f-787fd4f5354d",
    "device_name": "회의실 프린터",
    "created_date": "2025-01-15T09:00:00.000Z",
    "created_by": "uuid-user-id",
    "modified_date": "2025-01-15T09:00:00.000Z",
    "modified_by": "uuid-user-id",
    "ext_device_function": "PRINT_SCAN_COPY",
    "physical_device_id": "192.168.1.100",
    "location": "3층 회의실",
    "device_model": "Sindoh A4-2020",
    "serial_number": "SN123456789",
    "device_status": "ACTIVE",
    "device_type": "MULTIFUNCTION",
    "black_toner_percentage": 85,
    "cyan_toner_percentage": 92,
    "magenta_toner_percentage": 78,
    "yellow_toner_percentage": 88,
    "app_type": "CLOUD_MPS",
    "black_drum_percentage": 45,
    "cyan_drum_percentage": 52,
    "magenta_drum_percentage": 38,
    "yellow_drum_percentage": 48,
    "client_name": "스몰컴퍼니"
  }
}
```

### ❌ 실패 (401 Unauthorized)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 상세"
}
```

---
## Process Flow
1. `localcheck` 미들웨어로 로컬 접속 검증
2. `authMiddleware`로 JWT 토큰 검증
3. `tbl_device_info`, `tbl_client_device_info`, `tbl_client_info` 조인하여 조회
4. `device_id`로 디바이스 정보 조회
5. 조회된 디바이스 정보 반환

---

## Example (curl)ash
curl -X POST http://localhost:38005/api/devices/getdeviceinfo \
  -H "Content-Type: application/json" \
  -H "session_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "device_id": "a5eaccd8-0837-4be5-8e6f-787fd4f5354d",
    "user_name": "admin@company.com",
    "company_code": "100008",
    "ip_address": "192.168.0.1"
  }'---

## Notes
- `device_id`는 UUID 형식이어야 합니다
- 조회 결과는 단일 객체로 반환됩니다 (배열이 아님)
- 클라이언트 정보(`client_name`)도 함께 조회됩니다
- 모든 요청은 `user_name`, `ip_address` 기준으로 로깅됩니다