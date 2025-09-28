--마일레이션 회사 와 유저 1명 샘플로 입력
-- 기업회원인데 컴퍼니 등록을 안하고 처음 등록하는 경우 
DO $$
DECLARE
    -- 출력 변수를 위한 로컬 변수 선언
    out_verification_code text;
    out_company_code      text;
    out_rtn_status        text;
    out_trn_msg           text;
BEGIN
    -- [1] 프로시저 호출
    CALL signup_request(
        i_user_type                     := 'COMPANY', -- 'PERSON' 또는 'COMPANY'
        i_company_name                  := '마일레이션',
        i_business_registration_code    := '123-45-67890',
        i_company_code                  := NULL, -- 새 회사 생성 시 NULL
        i_deal_company_code             := NULL, -- NULL로 두면 기본값 '100000' 적용됨
        i_ceo_name                      := '홍길동',
        i_language                      := 'ko',
        i_time_zone                     := 'Asia/Seoul',
        i_currency_code                 := 'KRW',
        i_country                       := 'KOR',
        i_terms_of_service              := 'Y',
        i_privacy_policy                := 'Y',
        i_location_information          := 'N',
        i_notification_email            := 'Y',
        i_full_name                     := '김형준',
        i_e_mail_adress                 := 'whmoon00@naver.com', -- UNIQUE 해야 함
        i_password                      := 'hashed_password_1234',

        -- [2] 출력 변수 할당
        x_verification_code             := out_verification_code,
        x_company_code                  := out_company_code,
        x_rtn_status                    := out_rtn_status,
        x_trn_msg                       := out_trn_msg
    );
    
    -- [3] 결과 출력 (메시지 창 또는 로그에 나타남)
    RAISE NOTICE 'Result Status: %', out_rtn_status;
    RAISE NOTICE 'Result Message: %', out_trn_msg;
    RAISE NOTICE 'Verification Code: %', out_verification_code;
    RAISE NOTICE 'Generated/Used Company Code: %', out_company_code;

END $$;


-- 마일레이션 회사는 100000 으로 
update tbl_company_info 
set company_code = 100000
where company_name like '마일레이션';


update tbl_user_info 
set company_code = 100000
where user_name like 'whmoon%';

-- 기업회원인데 , 이미 컴퍼니코드가 있는 경우 
DO $$
DECLARE
    -- 출력 변수를 위한 로컬 변수 선언
    out_verification_code text;
    out_company_code      text;
    out_rtn_status        text;
    out_trn_msg           text;
BEGIN
    -- [1] 프로시저 호출
    CALL signup_request(
        i_user_type                     := 'COMPANY', -- 'PERSON' 또는 'COMPANY'
        i_company_name                  := NULL,
        i_business_registration_code    := NULL,
        i_company_code                  := '100000', -- 새 회사 생성 시 NULL
        i_deal_company_code             := NULL, -- NULL로 두면 기본값 '100000' 적용됨
        i_ceo_name                      := NULL,
        i_language                      := NULL,
        i_time_zone                     := NULL,
        i_currency_code                 := NULL,
        i_country                       := NULL,
        i_terms_of_service              := 'Y',
        i_privacy_policy                := 'Y',
        i_location_information          := 'Y',
        i_notification_email            := 'Y',
        i_full_name                     := '최형성',
        i_e_mail_adress                 := 'newton@naver.com', -- UNIQUE 해야 함
        i_password                      := 'hashed_password_1234',

        -- [2] 출력 변수 할당
        x_verification_code             := out_verification_code,
        x_company_code                  := out_company_code,
        x_rtn_status                    := out_rtn_status,
        x_trn_msg                       := out_trn_msg
    );
    
    -- [3] 결과 출력 (메시지 창 또는 로그에 나타남)
    RAISE NOTICE 'Result Status: %', out_rtn_status;
    RAISE NOTICE 'Result Message: %', out_trn_msg;
    RAISE NOTICE 'Verification Code: %', out_verification_code;
    RAISE NOTICE 'Generated/Used Company Code: %', out_company_code;

END $$;