-- 2025.09.28 6자리 난수 생성 로직
CREATE OR REPLACE FUNCTION generate_6_verification_code()
RETURNS TEXT AS $$
DECLARE
    -- 숫자 (0-9), 알파벳 대문자 (A-Z), 알파벳 소문자 (a-z)를 포함하는 문자셋
    char_set CONSTANT TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    code_length CONSTANT INTEGER := 6;
    random_code TEXT := '';
    i INTEGER;
    char_set_length INTEGER;
BEGIN
    -- 문자셋의 총 길이를 계산합니다.
    char_set_length := LENGTH(char_set);

    -- 코드 길이(6)만큼 반복합니다.
    FOR i IN 1..code_length LOOP
        -- 1. RANDOM()으로 0과 문자셋 길이 사이의 난수를 생성합니다.
        -- 2. FLOOR()와 + 1을 적용하여 1부터 문자셋 길이까지의 인덱스를 얻습니다.
        -- 3. SUBSTR()로 해당 인덱스의 문자를 가져와 코드에 추가합니다.
        random_code := random_code || SUBSTR(char_set, (FLOOR(RANDOM() * char_set_length) + 1)::INTEGER, 1);
    END LOOP;

    RETURN random_code;
END;
$$ language plpgsql;

-- check 
select generate_6_verification_code();

-- 기업회원가입 / 일반 회원 가입 신청(6자리 인증 코드 반환)
--  회원타입, 회사명, 사업자번호, 대표자명, 국가, 언어, 시간대, 통화 , 이용약관동의, 개인정보수집동의, 위치정보동의, 메일동의, 이름, e_mail_address, 패스워드 
CREATE OR REPLACE Procedure signup_request(
    i_user_type                         in text,   -- PERSON|COMPANY  
    i_company_name                      in text,
    i_business_registration_code        in text, -- 사업자번호 
    i_company_code                      in text, -- 기업회원인데 컴퍼니가 있는 경우에는 컴퍼니 코드가 들어 온다., 
    i_deal_company_code                 in text, -- 관리를 해주는 컴퍼니코드 , 넣지 않으면 , Mylation 회사 코드가 들어가야 함.(Mylation 회사코드는 100000) 
    i_ceo_name                          in text,
    i_language                          in text,
    i_time_zone                         in text,
    i_currency_code                     in text,
    i_country			                in text,   
    i_terms_of_service                  in text,  
    i_privacy_policy                    in text,
    i_location_information              in text,
    i_notification_email                in text,
    i_full_name                         in text,
    i_e_mail_adress                     in text,   -- user_name 으로 설정 , 
    i_password                          in text,    -- bycript 로 해시화 된 것 
    x_verification_code                 out text,
    x_company_code                      out text,   -- 컴퍼니코드가 들어 오지 않은 기업회원의 경우 컴퍼니코드까지 함께 리턴 
    x_rtn_status                        out text,
    x_trn_msg                           out text
)AS $$
DECLARE
    v_company_code integer ;
    v_verifiction_code varchar(30);
    v_deal_company_code varchar(30);
    v_user_id varchar(36);
BEGIN
    v_company_code := null;
    v_deal_company_code := i_deal_company_code;
    select uuid_generate_v4() into v_user_id;
    
    -- 회사타입인 경우
    if(i_user_type = 'COMPANY' and (i_company_code is null or i_company_code = '') ) then

        select nextval('company_code_seq') into v_company_code;
       
        -- 넣지 않으면 , Mylation 회사 코드가 들어가야 함.(Mylation 회사코드는 100000) 
        if v_deal_company_code is null or v_deal_company_code = '' then
            v_deal_company_code := '100000';
        end if;

        -- 회원입력 (
        INSERT INTO tbl_user_info (
                user_id, user_name, full_name, email, 
                password, user_type, company_code, user_status, 
                terms_of_service, privacy_policy, location_information, notification_email, 
                created_date, created_by
            ) VALUES (
                v_user_id, i_e_mail_adress, i_full_name, i_e_mail_adress, 
                i_password, i_user_type, v_company_code, 'NEED_AUTH', 
                i_terms_of_service, i_privacy_policy, i_location_information, i_notification_email, 
                now(), v_user_id
            );

        select generate_6_verification_code() into v_verifiction_code ;

        -- 인증코드 생성 
        insert into tbl_auth_info(reference_id,auth_type, varification_code, expired_date, created_date )
        values(v_user_id, 'USER_SIGN_IN',v_verifiction_code,  now() + interval '3 hours', now() );     

        -- 회사입력 
        insert into tbl_company_info(
            company_code, deal_company_code, company_name, business_registration_code, ceo_name,
            create_user, create_date, modify_date, recent_user,
            language, time_zone, currency_code, country
            ) values(
                v_company_code, v_deal_company_code::integer, i_company_name, i_business_registration_code, i_ceo_name,
                v_user_id, now(), now(), v_user_id,
                i_language, i_time_zone, i_currency_code, i_country
            );
    elsif (i_user_type = 'COMPANY' and i_company_code is not null) then 
        -- 회원입력 (
        insert into tbl_user_info (
            user_id, user_name, full_name, email,
            password, user_type, company_code, user_status,
            terms_of_service, privacy_policy, location_information, notification_email,
            created_date, created_by
        ) values(
            v_user_id, i_e_mail_adress, i_full_name, i_e_mail_adress,
            i_password, i_user_type, i_company_code::integer, 'NEED_AUTH',
            i_terms_of_service, i_privacy_policy, i_location_information, i_notification_email,
            now(), v_user_id
        );

        select generate_6_verification_code() into v_verifiction_code ;

        -- 인증코드 생성 
        insert into tbl_auth_info(reference_id,auth_type, varification_code, expired_date, created_date )
        values(v_user_id, 'USER_SIGN_IN',v_verifiction_code, now() + interval '3 hours', now() );   

    elsif( i_user_type = 'PERSON' ) then
         -- 회원입력 (
        insert into tbl_user_info (
            user_id, user_name, full_name, email,
            password, user_type, company_code, user_status,
            terms_of_service, privacy_policy, location_information, notification_email,
            created_date, created_by
        ) values(
            v_user_id, i_e_mail_adress, i_full_name, i_e_mail_adress,
            i_password, i_user_type, null, 'NEED_AUTH',
            i_terms_of_service, i_privacy_policy, i_location_information, i_notification_email,
            now(), v_user_id
        );

        select generate_6_verification_code() into v_verifiction_code ;

        -- 인증코드 생성 
        insert into tbl_auth_info(reference_id,auth_type, varification_code, expired_date, created_date )
        values(v_user_id, 'USER_SIGN_IN',v_verifiction_code, now() + interval '3 hours', now() );           
    end if;

    x_rtn_status := 'S';
    x_trn_msg := '';
    x_company_code := v_company_code;
    x_verification_code := v_verifiction_code;
    
exception
    WHEN others THEN
        -- 기타 모든 예외 처리
        GET STACKED DIAGNOSTICS x_trn_msg = MESSAGE_TEXT;
        x_rtn_status := 'E'; -- Error
        x_trn_msg := '에러 발생: ' || x_trn_msg || ')';    
END;
$$ LANGUAGE plpgsql;


-- 기업회원가입/일반 회원 가입 완료(인증코드 인증 후 )


