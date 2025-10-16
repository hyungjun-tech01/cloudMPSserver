const express = require('express');
// jwt 모듈 추가
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // bcrypt 모듈 추가

const router = express.Router();


const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');
const getSafePagination = require('../../utils/getSafePagination');
const pool  = require('../../utils/db');

const nodemailer = require('nodemailer');

// Nodemailer Transporter 설정 
const transporter = nodemailer.createTransport({
  // 1. SMTP 서버 주소: outbound.daouoffice.com
  host: 'outbound.daouoffice.com', 
  // 2. 포트 번호: SSL/TLS를 위한 465번 사용
  port: 465,
  // 3. 보안 설정: SSL/TLS 사용 (465 포트는 secure: true 필수)
  secure: true, 
  // 4. 인증 정보: Daou Office 계정 정보
  auth: {
      // .env 파일 등에 저장된 발신자 이메일 주소
      user: process.env.SENDER_EMAIL, 
      // 사용자님이 사용하시는 환경 변수 이름으로 변경했습니다.
      pass: process.env.SENDER_EMAIL_PW, 
  },
  // 5. 연결 재사용 설정 (선택 사항, 성능 향상)
  pool: true 
});

// login : host:port번호/api/users/login 
router.post('/login',localcheck, async(req, res) => {
  const {user_name, password, company_code, ip_address} = req.body;
  console.log('try login');
  try{

      // login 시도했던 로그 생성 .

      if(company_code){
        const company_exitst = await pool.query(`SELECT company_name
            FROM tbl_company_info 
            WHERE company_code = $1` , [company_code]);

        if(!company_exitst.rows.length){
          throw new Error('Invalid Company Code');
        }

        const users = await pool.query(`SELECT user_name, password 
                                         FROM tbl_user_info 
                                         WHERE user_name = $1 
                                         and company_code = $2 
                                         and user_status='COMPLETE_AUTH'
                                         and user_type = 'COMPANY'`, [user_name,  company_code]);
        if(!users.rows.length) 
          throw new Error('Company - Invalid userName or password');

        // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
        const hashedPassword = users.rows[0].password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
          const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '8hr' });
          res.json({ ResultCode: '0', ErrorMessage: '', token: token });
        } else {
          throw new Error('Company - Invalid userName or password');
        }

        res.end();                  
      }else{
        const users = await pool.query(`SELECT user_name, password FROM tbl_user_info 
                                         WHERE user_name = $1 and user_status='COMPLETE_AUTH' and user_type = 'PERSON'`, [user_name]);
        if(!users.rows.length) 
           throw new Error('Invalid userName or password');
  
         // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
         const hashedPassword = users.rows[0].password;
         const passwordMatch = await bcrypt.compare(password, hashedPassword);
  
        if (passwordMatch) {
          const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '8hr' });
          res.json({ ResultCode: '0', ErrorMessage: '', token: token });
        } else {
          throw new Error('Invalid userName or password');
        }
  
        res.end();
      }

      
  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login'] reqBody Error:`, user_name );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login '] Error:`, err.message); 
      
      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }
});

// login : host:port번호/api/users/login_vericode  , verification code와 함께 로그인 하기 , 최로 로그인
router.post('/login_vericode',localcheck, async(req, res) => {
  const {user_name, password, verification_code, company_code, ip_address} = req.body;

  try{

      // login 시도했던 로그 생성 .

      // company code가 있다면 검증 
      if (company_code) {
        const company_exitst = await pool.query(`SELECT company_name
                                FROM tbl_company_info 
                                WHERE company_code = $1` , [company_code]);

        if(!company_exitst.rows.length){
          throw new Error('Invalid Company Code');
        }                  
      }       

      // user_name 과 verification code 검증 
      const users = await pool.query(`SELECT t1.user_name, 
                                                      t1.password 
                                                FROM tbl_user_info t1, tbl_auth_info t2
                                                WHERE t1.user_name = $1 
                                                and t1.user_id = t2.reference_id
                                                and t2.auth_type = 'USER_SIGN_UP'
                                                and t2.verification_code = $2
                                                and t2.expired_date > now() 
                                                and user_status in ('NEED_AUTH','PASSWORD_CHANGING' )`, [user_name, verification_code]);

      if(!users.rows.length) 
         throw new Error('Invalid userName or password or verification code');

       // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
       const hashedPassword = users.rows[0].password;
       const passwordMatch = await bcrypt.compare(password, hashedPassword);


      if (passwordMatch) {

        // user_status COMPLETE_AUTH로 변경 
        const update_users = await pool.query(`update tbl_user_info
                                                set user_status = 'COMPLETE_AUTH'
                                                where user_name = $1
                                                and user_status in ('NEED_AUTH','PASSWORD_CHANGING')`, [user_name]);

        const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '8hr' });
        res.json({ ResultCode: '0', ErrorMessage: '', token: token });
      } else {
        throw new Error('Invalid userName or password');
      }

      res.end();
  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login'] reqBody Error:`, user_name );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }
});

// 사용자 정보 조회
router.post('/getuserinfo',localcheck, authMiddleware, async(req, res) => {

  const {user_name, ip_address} = req.body;

  try{
    const users = await pool.query(`SELECT *
      FROM tbl_user_info WHERE user_name = $1`, [user_name]);


    let user = users.rows[0];

    // password 속성 제거
    if (user) {
      const { password, ...userWithoutPassword } = user;
      user = userWithoutPassword;
    }

    res.json({ ResultCode: '0', ErrorMessage: '', user: user });
    res.end();

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo'] reqBody Error:`, user_name );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }

});

 // 회원가입 요청 , signup_request
 router.post('/signup_request',localcheck, async(req, res) => {
  //회원타입, 회사명, 사업자번호, 대표자명, 국가, 언어, 시간대, 통화 , 이용약관동의, 개인정보수집동의, 위치정보동의, 메일동의, 이름, e_mail_address, 패스워드 

  console.log('signup_request');
  const {user_type, 
    company_type,
    company_name, 
    business_registration_code,
    company_code              ,
    deal_company_code         ,
    ceo_name                  ,
    business_type             ,
    business_item             ,
    language                  ,    
    time_zone                 ,
    currency_code             ,
    country			              ,
    terms_of_service          ,
    privacy_policy            ,
    location_information      ,
    notification_email        ,
    full_name                 ,
    e_mail_adress             ,
    password                  ,
    ip_address} = req.body;

  try{

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    
    let v_company_code = company_code === "" ? null : company_code;

    const v_deal_company_code = deal_company_code ?? '100000';
    const user_id = await pool.query(`select uuid_generate_v4() uuid`, []);
    const v_user_id = user_id.rows[0].uuid;
    let v_user_role = 'FREE_USER';  // default free_user 이고  company_type 이 들어 오면 변경

    if(user_type !== 'COMPANY' && user_type !== 'PERSON') {
      const error = new Error('user_type_error');
      error.statusCode = 400;
      error.resultCode = '3';
      throw error;
    }

    if(user_type === 'COMPANY' ){

      // company_code  가 null  이면  company  생성 
      if(v_company_code === null ){
        const company_code_seq = await pool.query(`select nextval('company_code_seq') company_code_seq`, []);
        v_company_code = company_code_seq.rows[0].company_code_seq;

        const create_company = await pool.query(` insert into tbl_company_info(
          company_code, deal_company_code, company_name, business_registration_code,
          ceo_name, business_type, business_item, create_user, 
          create_date, modify_date, recent_user, language, 
          time_zone, currency_code, country, company_type
          ) values(
              $1, $2, $3, $4, 
              $5, $6, $7, $8, 
              now(), now(), $9, $10,
              $11, $12, $13, $14
          )`, [v_company_code,v_deal_company_code, company_name, business_registration_code,
            ceo_name, business_type, business_item, v_user_id,
            v_user_id,language,
            time_zone, currency_code, country, company_type]);

      }else{
           // company_code가 not null 이면 컴퍼니 확인 
           const company_code_check 
              = await pool.query(`select company_code 
                                    from tbl_company_info 
                                    where company_code = $1`, [v_company_code]);

            if (company_code_check.rows.length = 0) {
              const error = new Error('invalid_comapny_code');
              error.statusCode = 400; // HTTP 상태 코드 지정
              error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
              throw error;
            }                       
      }

      if(company_type === 'PARTNER') {
        v_user_role = 'PARTNER';
      }else if (company_type === 'GENERAL'){
        v_user_role = 'SUBSCRIPTION';
      }else{
        const error = new Error('company_type_error');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
      }
    }
    
    const create_user = await pool.query(`INSERT INTO tbl_user_info (
        user_id, user_name, full_name, email, 
        password, user_type, company_code, user_status, 
        terms_of_service, privacy_policy, location_information, notification_email, 
        created_date, created_by, user_role
      ) VALUES (
        $1, $2, $3, $4, 
        $5, $6, $7, 'NEED_AUTH', 
        $8, $9, $10, $11, 
        now(), $12, $13
      )`, [v_user_id,e_mail_adress, full_name, e_mail_adress,
        hashPassword, user_type, v_company_code, 
        terms_of_service, privacy_policy, location_information, notification_email,
        v_user_id, v_user_role]);

        const verifiction_code_seq = await pool.query(`select generate_6_verification_code() verifiction_code`, []);
        // 인증 코드 생성 
        const v_verifiction_code = verifiction_code_seq.rows[0].verifiction_code;

        const create_auth = await pool.query(`insert into tbl_auth_info(
          reference_id,auth_type, verification_code, expired_date, created_date )
          values($1, 'USER_SIGN_UP',$2, now() + interval '3 hours', now() )   
        `, [v_user_id,v_verifiction_code]);
       
  
  const x_verification_code = v_verifiction_code;
  const x_company_code = v_company_code;

  let mailOptions;
  if (user_type === 'COMPANY' ) {
  // 4-1. 이메일 전송 내용 
    mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: e_mail_adress, // 사용자 이메일 주소
    subject: ' 마일레이션 클라우드MPS 회원 가입의 인증코드입니다.',
    html: `
        <h1>회원가입을 환영합니다!</h1>
        <p>안녕하세요,   ${company_name} 기업 고객,  ${full_name} 님 </p>
        <p>마일레이션 클라우드 MPS 의 계정은 ${e_mail_adress}이고 </p>
        <p>회사코드는  ${x_company_code} </p>
        <p>아래 6자리 인증 코드를 입력하여 회원가입을 완료해 주세요.</p>
        <h2 style="color: #4CAF50;">인증 코드: ${x_verification_code}</h2>
        <p>이 코드는 3시간 동안 유효합니다.</p>
        <p></p>
        <p>아래 사이트에서 회원 가입을 마무리 하여 주십시요. </P>
        <p><a href="${process.env.CLIENT_HOST}/login?userType=company&init=true">[회원가입 마무리 하러 가기]</a></p>
        <p>감사합니다.</p>
    `
  };
 }else{
  // 4-1. 이메일 전송 내용 
   mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: e_mail_adress, // 사용자 이메일 주소
    subject: ' 마일레이션 클라우드MPS 회원 가입의 인증코드입니다.',
    html: `
        <h1>회원가입을 환영합니다!</h1>
        <p>안녕하세요,    ${full_name} 님 </p>
        <p>마일레이션 클라우드 MPS 의 계정은 ${e_mail_adress}이고 </p>
        <p>아래 6자리 인증 코드를 입력하여 회원가입을 완료해 주세요.</p>
        <h2 style="color: #4CAF50;">인증 코드: ${x_verification_code}</h2>
        <p>이 코드는 3시간 동안 유효합니다.</p>
        <p></p>
        <p>아래 사이트에서 회원 가입을 마무리 하여 주십시요. </P>
        <p><a href="${process.env.CLIENT_HOST}/login?userType=person&init=true">[회원가입 마무리 하러 가기]</a></p>
        <p>감사합니다.</p>
    `
  };
 }

  // 메일 전송
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[메일 전송 성공] → ${e_mail_adress}`);
  } catch (mailErr) {
    console.error(`[메일 전송 실패] ${e_mail_adress}:`, mailErr.message);
    // 메일 실패해도 회원가입 절차는 성공으로 처리
  }

  res.json({ ResultCode: '0', ErrorMessage: '' , verification_code:x_verification_code, company_code:x_company_code });

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login'] reqBody Error:`, e_mail_adress );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login '] Error:`, err.message); 

      const resultCode = err.resultCode || '1';
      res.status(401).json({ ResultCode: resultCode, ErrorMessage: err.message });
  }
});


// 내 회사 사용자 목록 조회
router.post('/getuserlist', localcheck, authMiddleware, async(req, res) => {
  const {search_user_name, search_full_name, search_email, items_per_page, current_page, user_name, company_code, ip_address} = req.body;
  
  console.log('getuserlist');

  // 값이 undefined, null 또는 없는 경우 ''로 설정하여 SQL 쿼리 안전성 확보
  const searchUserName = search_user_name ?? '';
  const searchFullName = search_full_name ?? '';
  const searchEmail = search_email ?? '';

  //  페이징 함수 호출 및 변수 설정 
  const { itemsPerPage, currentPage, offset } 
    = getSafePagination(items_per_page, current_page); 
  
  try{
    const count = await pool.query(`SELECT count(*) 
      FROM tbl_user_info 
      WHERE company_code = $1 
      and user_name ilike '%'||$2||'%'
      and full_name ilike '%'||$3||'%'
      and email ilike '%'||$4||'%'`, [company_code, searchUserName, searchFullName, searchEmail]);

    const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
   

    const usersResult = await pool.query(`SELECT *
      FROM tbl_user_info 
      WHERE company_code = $1 
      and user_name ilike '%'||$2||'%'
      and full_name ilike '%'||$3||'%'
      and email ilike '%'||$4||'%'
      limit $5 offset $6`, [company_code, searchUserName, searchFullName, searchEmail, itemsPerPage, offset]);

    let users = usersResult.rows;

    // 각 user 객체에서 password 속성 제거
    users = users.map(({ password, ...rest }) => rest);

    res.json({ ResultCode: '0', ErrorMessage: '', totalPages:totalPages, users:users });
    res.end();

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserlist'] reqBody Error:`, company_code );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserlist '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }
});
// 패스워드 변경 
router.post('/change_pass',localcheck, authMiddleware, async(req, res) => {
});

// 내정보 수정 
router.post('/modify',localcheck, authMiddleware, async(req, res) => {
  //user_id, user_name, email, password는 변경하지 않음.
  const {
    user_id       // 수정하려면 user의 uiser_id (uuid)
    ,external_user_name
    ,full_name
    ,notes
    ,total_jobs
    ,total_pages
    ,reset_by
    ,reset_date
    ,schedule_period
    ,schedule_amount
    ,schedule_start
    ,deleted
    ,deleted_date
    ,user_source_type
    ,department
    ,office
    ,card_number
    ,card_number2
    ,disabled_printing
    ,disabled_printing_until
    ,home_directory
    ,balance
    ,privilege
    ,sysadmin
    ,user_type
    ,user_status
    ,terms_of_service
    ,privacy_policy
    ,location_information
    ,notification_email
    ,user_role
    ,user_name    //  작업자임.
    ,ip_address
    } = req.body;  

    try{

      const dateRegex = /^\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2}:\d{2}$/; 
      let reset_date_input = reset_date;
      let schedule_start_input = schedule_start;
      let total_jobs_input = total_jobs;
      let total_pages_input = total_pages;
      let balance_input = balance;
      let deleted_date_input = deleted_date;
      let schedule_amount_input = schedule_amount;
      let disabled_printing_until_input = disabled_printing_until;

      if (reset_date_input === null || reset_date_input === undefined || String(reset_date_input).trim() === '') {
        reset_date_input = null; 
      } else {
        if (!dateRegex.test(reset_date_input)) {
          const error = new Error('undefined_foramt_reset_date');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
        }
      }

      if (deleted_date_input === null || deleted_date_input === undefined || String(deleted_date_input).trim() === '') {
        deleted_date_input = null; 
      } else {
        if (!dateRegex.test(deleted_date_input)) {
          const error = new Error('undefined_foramt_reset_date');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
        }
      }

      if (disabled_printing_until_input === null || disabled_printing_until_input === undefined || String(disabled_printing_until_input).trim() === '') {
        disabled_printing_until_input = null; 
      } else {
        if (!dateRegex.test(disabled_printing_until_input)) {
          const error = new Error('undefined_foramt_reset_date');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
        }
      }

      if (schedule_start_input === null || schedule_start_input === undefined || String(schedule_start_input).trim() === '') {
        schedule_start_input = null; 
      } 

      if( total_jobs_input === undefined || String(total_jobs_input).trim() === ''){
        total_jobs_input = null;
      }

      if( total_pages_input === undefined || String(total_pages_input).trim() === ''){
        total_pages_input = null;
      }

      if( balance_input === null ||balance_input === undefined || String(balance_input).trim() === ''){
        balance_input = 0;
      }

      if( schedule_amount_input === undefined || String(schedule_amount_input).trim() === ''){
        schedule_amount_input = null;
      }

      const modified_by = await pool.query(`select user_id
        from tbl_user_info tbi
        where tbi.user_name = $1`,[user_name]);

      const v_modified_by = modified_by.rows[0].user_id;  // 작업자 user_id
       
      const updateUser = await pool.query(`
      update tbl_user_info
      set external_user_name          = $2,
					full_name                  = $3,
					notes                      = $4,
					total_jobs                 = $5::integer,
					total_pages                = $6::integer,
					reset_by                   = $7,
					reset_date                 = $8::timestamp,
					schedule_period            = $9,
					schedule_amount            = $10::double precision,
					schedule_start             = $11::integer,
					deleted                    = $12,
					deleted_date               = $13::timestamp,
					user_source_type           = $14,
					department                 = $15,
					office                     = $16,
					card_number                = $17,
					card_number2               = $18,
					disabled_printing          = $19,
					disabled_printing_until    = $20::timestamp,
					home_directory             = $21,
					balance                    = $22::integer,
					privilege                  = $23,
					sysadmin                   = $24,
					user_type                  = $25,
					user_status                = $26,
					terms_of_service           = $27,
					privacy_policy             = $28,
					location_information       = $29,
					notification_email         = $30,
					user_role                  = $31,
          modified_by                = $32,
          modified_date              = now()
        where user_id = $1` ,
      [user_id              
        ,external_user_name,full_name,notes
        ,total_jobs_input,total_pages_input,reset_by
        ,reset_date_input,schedule_period,schedule_amount_input
        ,schedule_start_input,deleted,deleted_date_input
        ,user_source_type,department,office
        ,card_number,card_number2,disabled_printing
        ,disabled_printing_until_input,home_directory,balance_input
        ,privilege,sysadmin,user_type
        ,user_status,terms_of_service,privacy_policy
        ,location_information,notification_email,user_role
        ,v_modified_by
    ]);
     
    res.json({ ResultCode: '0', ErrorMessage: '' });

    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/modify'] reqBody Error:`, user_id );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/modify '] Error:`, err.message); 
        const resultCode = err.resultCode || '1';
        res.status(401).json({ ResultCode: resultCode, ErrorMessage: err.message });
    }
});

// 모듈로 내보내기
module.exports = router;