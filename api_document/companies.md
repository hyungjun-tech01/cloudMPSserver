# 회사 관련 API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-10-11   | zagan kim | 회사 정보 조회 API 최초 작성 |

---

## 목차
1. [회사 정보 조회 API](#1-회사-정보-조회-api)

---

# 1. 회사 정보 조회 API

## 개요
`company_code`를 이용해 회사 정보를 조회하는 API입니다.  
요청 시 인증(`authMiddleware`) 및 로컬 체크(`localcheck`)를 통과해야 하며,  
DB 테이블 `tbl_company_info`의 데이터를 반환합니다.

---

## Endpoint
- **POST** `/api/users/getcompanyinfo`

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