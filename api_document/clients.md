# Client API 문서

## 수정 이력
| 수정일     | 작성자     | 내용       |
|------------|-----------|------------|
| 2025-10-04 | zagan kim | 최초 작성  |

## 목차
1. 클라이언트 등록 API
2. 내 회사 클라이언트 정보 조회 API

---

# 1. 클라이언트 등록 API

**Endpoint**: `POST /api/clients/create_client`

## Request

### Headers
- Content-Type: application/json
- session_token: {사용자 세션 토큰}

### Body (JSON)
```json
{
    "action_type" : "CREATE" ,    //CREATE, CHANGE, COMPANY_CLIENT_LINK
    "client_id"   : null                ,  
    "member_company_code"   : null      ,   
    "client_group"    : ""            ,   
    "client_scale"    : "SMALL"            ,   
    "deal_type"       : ""            ,   
    "client_name"     : "스몰컴퍼니"            ,   
    "client_name_en"  : "Small Company"            ,   
    "business_registration_code" :"1234-1245-124"  ,   
    "establishment_date"       : "2002.01.01"   ,    //날자 타입 맞아야 
    "closure_date"             : "2025.01.01"   ,   
    "ceo_name"                 : "홍길동"   ,   
    "business_type"            : "소매업"   ,   
    "business_item"            : ""   ,   
    "industry_type"            : ""   ,   
    "client_zip_code"          : "12345"   ,   
    "client_address"           : "서울시 성동구"   ,   
    "client_phone_number"      : "010-1111-1111"   ,   
    "client_fax_number"        : "02-000-0000"   ,   
    "homepage"                 : "www.sindoh.com"   ,   
    "client_memo"              : "test"  ,   
    "created_by"               : "whmoon00@naver.com"   ,   
    "create_date"              : "2025.10.01"   ,   
    "modify_date"              : "2025.10.01"   ,   
    "recent_user"              : "whmoon00@naver.com"   ,   
    "account_code"             : "1111-111-1111"   ,   
    "bank_name"                : "하나"   ,   
    "account_owner"            : "홍길동"   ,   
    "sales_resource"           : "홍길동"   ,   
    "application_engineer"     : null   ,   
    "region"                   : null   ,   
    "status"				   : null   ,	
    "user_name"                : "whmoon00@naver.com"   ,  // 생성자
    "company_code"            : "100008"                ,  // 생성자의 회사코드  
    "ip_address"              : "123.10.234.111"
}   
```

## Response

### Success (200 OK)
```json
{
    "ResultCode": "0",
    "ErrorMessage": "",
    "x_client_id": "e2c08383-021d-4e59-b31b-d2cddf35d45a"
}
```

### Fail (401)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지"
}
```

---

# 2. 내 회사 클라이언트 정보 조회 API

**Endpoint**: `POST /api/clients/getclientlist`

## Request

### Headers
- Content-Type: application/json
- session_token: {사용자 세션 토큰}

### Body (JSON)
```json
{
    "search_client_name": "",
    "search_business_registration_code": "",
    "search_client_address": "",
    "search_sales_resource": "",
    "items_per_page": 10,
    "current_page": 1,
    "user_name":"hyungseong@naver.com",  // cleint 조회하는 사용자 
    "company_code" :"100008",   // clients를 조회할 company 
    "ip_address": "127.0.0.1"
}
```

## Response

### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "totalPages": 1,
  "clients": [
    {
      // 클라이언트 정보
    }
  ]
}
```

### Fail (401)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지"
}
```
