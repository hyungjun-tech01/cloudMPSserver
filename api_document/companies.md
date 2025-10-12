# 회사 관련 API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-10-11   | zagan kim | Company API 최초 작성 |
| 2025-10-11   | zagan kim | getcompanyinfo, getcompanylist_query API 추가 |
| 2025-10-12   | zagan kim | modify API 추가 |

## 목차
1. [회사 정보 조회 API](#1-회사-정보-조회-api)
2. [회사 목록 조회 (쿼리조건) API](#2-회사-목록-조회)
3. [회사 정보 수정 API](#3-회사-정보-수정-api)
---

# 1. 회사 정보 조회 API

## 개요
`company_code`를 이용해 회사 정보를 조회하는 API입니다.  
요청 시 인증(`authMiddleware`) 및 로컬 체크(`localcheck`)를 통과해야 하며,  
DB 테이블 `tbl_company_info`의 데이터를 반환합니다.

---

## Endpoint
- **POST** `/api/companies/getcompanyinfo`

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
  "company_code": "string",
  "user_name": "string",
  "ip_address": "string"
}


| 필드명 | 타입 | 필수여부 | 설명 |
|--------|------|----------|------|
| company_code | string | Y | 조회할 회사 코드 |
| user_name | string | Y | 요청 사용자명 (로깅용) |
| ip_address | string | Y | 요청자의 IP 주소 (로깅용) |

---

## Response

### ✅ 성공 (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "company":  {
        "company_code": 100008,
        "deal_company_code": 100000,
        "company_group": null,
        "company_scale": null,
        "deal_type": null,
        "company_name": "현준스컴퍼니",
        "company_name_en": null,
        "business_registration_code": "123-9880-111",
        "establishment_date": null,
        "closure_date": null,
        "ceo_name": "김형준",
        "business_type": null,
        "business_item": null,
        "industry_type": null,
        "company_zip_code": null,
        "company_address": null,
        "company_phone_number": null,
        "company_fax_number": null,
        "homepage": null,
        "company_memo": null,
        "create_user": "3a1a673b-e552-4e4f-b632-be6a2e28894a",
        "create_date": "2025-09-29T09:53:22.967Z",
        "modify_date": "2025-09-29T09:53:22.967Z",
        "recent_user": "3a1a673b-e552-4e4f-b632-be6a2e28894a",
        "counter": null,
        "account_code": null,
        "bank_name": null,
        "account_owner": null,
        "sales_resource": null,
        "application_engineer": null,
        "region": null,
        "status": null,
        "contract_expiraton_date": null,
        "language": "KO",
        "time_zone": "ASIA/SEOUL",
        "currency_code": "KRW",
        "country": "KO",
        "company_type": null
    }
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| ResultCode | string | 처리 결과 코드 (`0`=성공, `1`=실패) |
| ErrorMessage | string | 에러 메시지 (정상 시 빈 문자열) |
| company | object | `tbl_company_info`의 전체 컬럼을 포함한 회사 정보 객체 |

---

### ❌ 실패 (401 Unauthorized)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "Error message string"
}
```

---

## Process Flow
1. `localcheck` 미들웨어로 로컬 접속 검증  
2. `authMiddleware`로 JWT 토큰 검증  
3. DB에서 `company_code`로 회사 정보 조회  
4. 성공 시 `ResultCode = "0"`과 회사 정보 반환  
5. 실패 시 `ResultCode = "1"`과 에러 메시지 반환  
6. 모든 요청은 `user_name`, `ip_address` 기준으로 로깅됨

---

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/users/getcompanyinfo   -H "Content-Type: application/json"   -H "session_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "company_code": "100008",
    "user_name": "admin@naver.com",
    "ip_address": "192.168.0.1"
  }'
```

---

# 2. 회사 목록 조회 (쿼리조건) API

## Endpoint
- **POST** `/api/companies/getcompanylist_query`

## Request
### Headers
- `Content-Type: application/json`

### Body
```json
{
    "company_code" : "100",
    "company_name" : "",
    "business_registration_code" : "",
    "user_name":"whmoon000@naver.com",
    "ip_address": "127.0.0.1"
}
```

| 필드명 | 타입 | 필수여부 | 설명 |
|--------|------|----------|------|
| company_code | string | N | 회사코드 (부분 검색 가능) |
| company_name | string | N | 회사명 (부분 검색 가능) |
| business_registration_code | string | N | 사업자등록번호 (부분 검색 가능) |
| user_name | string | Y | 요청 사용자명 (로깅용) |
| ip_address | string | Y | 요청자의 IP 주소 (로깅용) |

## Response
✅ **성공 (200 OK)**
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "companies": [
       {
            "company_code": 100000,
            "company_name": "마일레이션",
            "company_address": null
        },
        {
            "company_code": 100005,
            "company_name": "현준스컴퍼니",
            "company_address": null
        },
        .....
  ]
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| ResultCode | string | 결과 코드 (0=성공, 1=실패, 2=입력값 오류, 3=조회 결과 없음) |
| ErrorMessage | string | 에러 메시지 |
| companies | array | 검색된 회사 정보 목록 |

❌ **실패 (401 Unauthorized)**  
입력값 오류, 조회 결과 없음, 서버 에러 등의 경우:
```json
{
  "ResultCode": "1",
  "ErrorMessage": "Error message string"
}
```

## Process Flow
1. `localcheck` 미들웨어 실행  
2. 요청값 검증 (회사코드, 회사명, 사업자번호 중 최소 하나 필수)  
3. 조건에 맞는 `tbl_company_info` 검색 (ILIKE 부분 검색 지원)  
4. 검색 결과 없으면 `ResultCode=3` 반환  
5. 성공 시 `ResultCode=0` 과 결과 배열 반환  

## Example (curl)
```bash
curl -X POST http://localhost:38005/api/companies/getcompanylist_query \
  -H "Content-Type: application/json" \
  -H "session_token: eyJhbGciOi..." \
  -d '{
    "company_code" : "100",
    "company_name" : "",
    "business_registration_code" : "",
    "user_name":"whmoon000@naver.com",
    "ip_address": "127.0.0.1"
}'
```

# 3. 회사 정보 수정 API

## 개요

기존 회사 정보를 수정하는 API입니다.\
`company_code`를 기준으로 `tbl_company_info` 테이블의 데이터를
업데이트합니다.\
입력 시 날짜 필드(`establishment_date`, `closure_date`,
`contract_expiraton_date`)는 **`YYYY.MM.DD` 형식**을 따라야 합니다.\
모든 요청은 `user_name`, `ip_address`를 기준으로 로깅됩니다.

------------------------------------------------------------------------

## Endpoint

-   **POST** `/api/companies/modify`

------------------------------------------------------------------------

## Request

### Headers

  |키              |필수   |설명
  |--------------- |------ |---------------------------
  |Content-Type    |Y      |`application/json`
  |session_token   |Y      |로그인 시 발급된 JWT 토큰

### Body

``` json
{
  "company_code": "100008",
  "deal_company_code": "100000",
  "company_group": null,
  "company_scale": null,
  "deal_type": null,
  "company_name": "현준스컴퍼니",
  "company_name_en": null,
  "business_registration_code": "123-9880-111",
  "establishment_date": "2025.01.10",
  "closure_date": "",
  "ceo_name": "김형준",
  "business_type": null,
  "business_item": null,
  "industry_type": null,
  "company_zip_code": null,
  "company_address": null,
  "company_phone_number": null,
  "company_fax_number": null,
  "homepage": null,
  "company_memo": null,
  "counter": null,
  "account_code": null,
  "bank_name": null,
  "account_owner": null,
  "sales_resource": null,
  "application_engineer": null,
  "region": null,
  "status": null,
  "contract_expiraton_date": "",
  "language": "KO",
  "time_zone": "ASIA/SEOUL",
  "currency_code": "KRW",
  "country": "KO",
  "company_type": null,
  "user_name": "admin@naver.com",
  "ip_address": "192.168.0.1"
}
```

|  필드명                      |타입                 |필수   |설명
| ---------------------------- |--------------------| ------| ---------------------------
| company_code                 |string              | Y     | 수정할 회사 코드
| deal_company_code            |string              | N     | 거래처 코드
| company_group                |string              | N     | 회사 그룹
| company_scale                |string              | N     | 회사 규모
| deal_type                    |string              | N     | 거래 유형
| company_name                 |string              | Y     | 회사명
| ceo_name                     |string              | N     | 대표자명
| business_registration_code   |string              | N     | 사업자등록번호
| establishment_date           |string(YYYY.MM.DD)  | N     | 설립일
| closure_date                 |string(YYYY.MM.DD)  | N     | 폐업일
| contract_expiraton_date      |string(YYYY.MM.DD)  | N     | 계약 만료일
| language                     |string              | N     | 언어코드
| time_zone                    |string              | N     | 시간대
| currency_code                |string              | N     | 통화코드
| country                      |string              | N     | 국가코드
| user_name                    |string              | Y     | 요청 사용자명 (로깅용)
| ip_address                   |string              | Y     | 요청자의 IP 주소 (로깅용)

------------------------------------------------------------------------

## Response

### ✅ 성공 (200 OK)

``` json
{
  "ResultCode": "0",
  "ErrorMessage": ""
}
```

### ❌ 실패 (401 Unauthorized)

``` json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지 내용"
}
```

  ResultCode   설명
  ------------ ---------------------------------------
  0            성공
  1            일반 실패
  2            company_code 누락
  3            날짜 형식 오류 (`undefined_format_*`)

------------------------------------------------------------------------

## Process Flow

1.  `localcheck` 미들웨어로 로컬 접속 검증\
2.  `authMiddleware`로 JWT 인증\
3.  `company_code` 필수 검증 (없으면 `ResultCode=2`)\
4.  날짜 필드(`establishment_date`, `closure_date`,
    `contract_expiraton_date`) 형식 검증 (`YYYY.MM.DD`)\
5.  `tbl_user_info`에서 `user_id` 조회 후 수정자(`recent_user`)로 반영\
6.  `tbl_company_info` 업데이트 후 `modify_date = now()`로 변경\
7.  성공 시 `ResultCode=0` 반환\
8.  오류 발생 시 `ResultCode`에 따라 메시지 반환

------------------------------------------------------------------------

## Example (curl)

``` bash
curl -X POST http://localhost:38005/api/companies/modify   -H "Content-Type: application/json"   -H "session_token: eyJhbGciOi..."   -d '{
    "company_code": "100008",
    "company_name": "현준스컴퍼니",
    "ceo_name": "김형준",
    "establishment_date": "2025.01.10",
    "language": "KO",
    "time_zone": "ASIA/SEOUL",
    "currency_code": "KRW",
    "country": "KO",
    "user_name": "admin@naver.com",
    "ip_address": "192.168.0.1"
  }'
```
