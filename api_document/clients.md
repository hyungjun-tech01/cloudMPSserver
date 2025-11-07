# Client API 문서

## 수정 이력
| 수정일       | 작성자     | 내용 |
|--------------|-----------|------|
| 2025-10-04   | zagan kim | 최초 작성 |
| 2025-11-07   | zagan kim | getclientinfo 추가  |

## 목차
1. [클라이언트 등록 API](#1-클라이언트-등록-api)
2. [클라이언트 정보 수정 API](#2-클라이언트-정보-수정-api)
3. [클라이언트 목록 조회 API](#3-클라이언트-목록-조회-api)
4. [클라이언트 정보 조회 API](#4-클라이언트-정보-조회-api)

---


## 1. 클라이언트 등록 API

### **Endpoint**

-   `POST` `/api/clients/create`

### **설명**

클라이언트(고객사)를 신규로 등록합니다.

### **Request**

#### Headers

  Key             Type     필수   설명
  --------------- -------- ------ --------------------
  Content-Type    string   Y      `application/json`
  session_token   string   Y      인증 토큰

#### Body
```json 
{
    "client_group"    : ""            ,   
    "client_scale"    : "SMALL"            ,   
    "deal_type"       : ""            ,   
    "client_name"     : "스몰컴퍼니"            ,   
    "client_name_en"  : "Small Company"            ,   
    "business_registration_code" :"1234-1245-124"  ,   
    "establishment_date"       : "2002.01.01"   ,   
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
    "user_name"                : "whmoon00@naver.com"   , 
    "company_code"            : "100008"                ,    
    "ip_address"              : "123.10.234.111"
}
```

#### Response (성공 시)

``` json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "x_client_id": "uuid"
}
```

#### Response (실패 시)

``` json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지"
}
```

------------------------------------------------------------------------

## 2. 클라이언트 정보 수정 API

### **Endpoint**

-   `POST` `/api/clients/modify`

### **설명**

기존 클라이언트 정보를 수정합니다.

### **Request**

#### Body
```json
{
    "client_id": "87e8a689-94d9-420c-a685-8bcc71a1f87f",
    "client_group"    : ""            ,   
    "client_scale"    : "SMALL"            ,   
    "deal_type"       : ""            ,   
    "client_name"     : "스몰컴퍼니"            ,   
    "client_name_en"  : "Small Company"            ,   
    "business_registration_code" :"1234-1245-124"  ,   
    "establishment_date"       : "2002.01.01"   ,   
    "closure_date"             : "2099.01.01"   ,   
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
    "account_owner"            : "수정길동"   ,   
    "sales_resource"           : "수정길동"   ,   
    "application_engineer"     : null   ,   
    "region"                   : null   ,   
    "status"				   : null   ,	
    "user_name"                : "whmoon00@naver.com"   , 
    "company_code"            : "100008"                ,    
    "ip_address"              : "123.10.234.111"
}
```

#### Response (성공 시)

``` json
{
  "ResultCode": "0",
  "ErrorMessage": ""
}
```

#### Response (실패 시)

``` json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지"
}
```

------------------------------------------------------------------------
# 3. 내 회사 클라이언트 목록 조회 API

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
------------------------------------------------------------------------
# 4. 클라이언트 정보 조회 API

**Endpoint**: `POST /api/clients/getclientinfo`

## Request

### Headers
- Content-Type: application/json
- session_token: {사용자 세션 토큰}

### Body (JSON)
```json
{
    "client_id": "87e8a689-94d9-420c-a685-8bcc71a1f87f",
    "user_name": "hyungseong@naver.com",  // 클라이언트 조회하는 사용자 
    "company_code": "100008",   // 클라이언트를 조회할 company 
    "ip_address": "127.0.0.1"
}
```

## Response

### Success (200 OK)
```json
{
  "ResultCode": "0",
  "ErrorMessage": "",
  "clients": {
    // 클라이언트 상세 정보
  }
}
```
### Fail (401)
```json
{
  "ResultCode": "1",
  "ErrorMessage": "에러 메시지"
}
```