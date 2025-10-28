--2025.09.27 
-- tbl_user_info 에 컬럼 추가 
alter table tbl_user_info add column user_type            varchar(30);
alter table tbl_user_info add column company_code         integer;
alter table tbl_user_info add column user_status          varchar(100);
alter table tbl_user_info add column terms_of_service     varchar(1) default 'N';
alter table tbl_user_info add column privacy_policy       varchar(1) default 'N'; 
alter table tbl_user_info add column location_information varchar(1) default 'N'; 
alter table tbl_user_info add column notification_email   varchar(1) default 'N'; 

-- 기존 회원 user_status: COMPLETE_AUTH, user_type : PERSON 으로 업데이트 
update tbl_user_info
set user_type = 'PERSON', user_status = 'COMPLETE_AUTH';


drop table if exists tbl_auth_info;

-- 인증코드 저장 테이블 
CREATE TABLE tbl_auth_info (
    -- 기본 키: 인증 정보의 고유 ID (랜덤 UUID v4로 자동 생성)
    auth_info_id varchar(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id varchar(36) NOT NULL,
    -- 인증 유형: 'USER_SIGN_IN, PASSWORD',
    auth_type VARCHAR(20) NOT NULL,
    -- 인증 정보 (보안을 위해 해시된 비밀번호 또는 토큰 참조 등), 6자리
    verification_code varchar(20),

    expired_date timestamp,
    created_date timestamp
);

--2025.09.28 
drop table if exists tbl_company_info;

-- 회사테이블 
create table tbl_company_info(
company_code                      integer	   primary key   ,
deal_company_code                 integer	    ,
company_group                             varchar(255)  ,
company_scale                     varchar(100)  ,
deal_type                         varchar(100)  ,
company_name                      varchar(50)   not null,
company_name_en                   varchar(100)  ,
business_registration_code        varchar(50)   ,
establishment_date                date	        ,
closure_date                      date	        ,
ceo_name                          varchar(50)   ,
business_type                     varchar(100)  ,
business_item                     varchar(100)  ,
industry_type                     varchar(50)   ,
company_zip_code                  varchar(50)   ,
company_address                   varchar(255)  ,
company_phone_number              varchar(50)   ,
company_fax_number                varchar(50)   ,
homepage                          varchar(255)  ,
company_memo                      text	        ,
create_user                       varchar(50)   ,
create_date                       timestamp	    ,
modify_date                       timestamp	    ,
recent_user                       varchar(50)   ,
counter                           integer       ,
account_code                      varchar(50)   ,
bank_name                         varchar(50)   ,
account_owner                     varchar(50)   ,
sales_resource                    varchar(50)   ,
application_engineer              varchar(50)   ,
region                            varchar(50)   ,
status                            varchar(50)   ,
contract_expiraton_date           timestamp	    ,
language                          varchar(30)   ,
time_zone                         varchar(30)   ,
currency_code                     varchar(30)   ,
country							  varchar(30)   
);

drop sequence if exists company_code_seq;

-- 회사테이블 PK : 6자리 회사코드  (숫자) , SEQ로 작업 
CREATE SEQUENCE company_code_seq
    -- 시퀀스 시작 값 (첫 번째 6자리 숫자)
    START WITH 100000
    -- 최소값 (6자리를 보장)
    MINVALUE 100000
    -- 최대값 (6자리를 보장)
    MAXVALUE 999999
    -- 증가 값 (기본값 1)
    INCREMENT BY 1
    -- 최대값에 도달하면 멈춤 (필요에 따라 CYCLE로 변경 가능)
    NO CYCLE; 

 -- check 
 SELECT nextval('company_code_seq');   



 -- 2025.10.01 
 -- tbl_user_info 테이블 컬럼 추가 
 alter table tbl_user_info add column user_role   varchar(50); 

 -- tbl_company_info 테이블 컬럼 추가
 alter table tbl_company_info add column company_type varchar(30);
 -- stored_procedure 변경 
 

 --2025.10.03
drop table if exists tbl_client_info;

create table tbl_client_info(
client_id                            varchar(36)    primary key, 
company_code                         integer	    ,
member_company_code                  integer	    , 
client_group                                varchar(255)   ,
client_scale                         varchar(100)   ,
deal_type                            varchar(100)   ,
client_name                          varchar(50)    not null,
client_name_en                       varchar(100)   ,
business_registration_code           varchar(50)    ,
establishment_date                   date	        ,
closure_date                         date	        ,
ceo_name                             varchar(50)    ,
business_type                        varchar(100)   ,
business_item                        varchar(100)   ,
industry_type                        varchar(50)    ,
client_zip_code                      varchar(50)    ,
client_address                       varchar(255)   ,
client_phone_number                  varchar(50)    ,
client_fax_number                    varchar(50)    ,
homepage                             varchar(255)   ,
client_memo                          text	        ,
created_by                           varchar(50)    ,
create_date                          timestamp	    ,
modify_date                          timestamp	    ,
recent_user                          varchar(50)    ,
account_code                         varchar(50)    ,
bank_name                            varchar(50)    ,
account_owner                        varchar(50)    ,
sales_resource                       varchar(50)    ,
application_engineer                 varchar(50)    ,
region                               varchar(50)    ,
status								 varchar(50) 	    
 );

--2025.10.22
drop table if exists tbl_client_device_info;

create table tbl_client_device_info(
device_id      varchar(36),
client_id      varchar(36),
company_code   integer,
created_date   timestamp,
created_by     varchar(36),
modified_date  timestamp,
modified_by    varchar(36)
 );

--2025.10.28 
alter table tbl_device_info drop column column32;
alter table tbl_device_info drop column column33;
alter table tbl_device_info drop column column34;
alter table tbl_device_info drop column column35;


alter table tbl_device_info add black_drum_percentage  int4;
alter table tbl_device_info add cyan_drum_percentage   int4; 
alter table tbl_device_info add magenta_drum_percentage int4;
alter table tbl_device_info add yellow_drum_percentage int4;