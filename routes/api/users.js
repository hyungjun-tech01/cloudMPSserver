const express = require('express');
// jwt 모듈 추가
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // bcrypt 모듈 추가

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');

const nodemailer = require('nodemailer');

// Nodemailer Transporter 설정 (예: Gmail 사용)
const transporter = nodemailer.createTransport({
    service: 'gmail', // 또는 'smtp.naver.com' 등 사용하는 서비스의 SMTP 주소
    auth: {
        user: process.env.SENDER_EMAIL, // 실제 발신 이메일 주소
        pass: process.env.SENDER_EMAIL_PW // 실제 비밀번호 또는 앱 비밀번호
    }
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// login : host:port번호/api/users/login 
router.post('/login',localcheck, async(req, res) => {
  const {user_name, password, company_code, ip_address} = req.body;

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


    const signUp = await pool.query(`call signup_request($1, $2, $3, $4, 
      $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
      $19, $20, $21, $22)` ,
    [user_type , 
      company_type,
      company_name , 
      business_registration_code , 
      company_code , 
      deal_company_code ,
      ceo_name ,
      language,
      time_zone , 
      currency_code , 
      country , 
      terms_of_service,
      privacy_policy ,
      location_information ,
      notification_email,
      full_name,
      e_mail_adress,
      hashPassword,
      null,
      null,
      null,
      null
  ]);
  const x_verification_code = signUp.rows[0].x_verification_code;
  const x_company_code = signUp.rows[0].x_company_code;
  const x_rtn_status = signUp.rows[0].x_rtn_status;
  const x_trn_msg = signUp.rows[0].x_trn_msg;

  if (x_rtn_status == 'S') {
  // 4-1. 이메일 전송 로직
  const mailOptions = {
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
        <p>감사합니다.</p>
    `
  };

     res.json({ ResultCode: '0', ErrorMessage: '' , verification_code:x_verification_code, company_code:x_company_code });
  }else{
    res.json({ ResultCode: '1', ErrorMessage: x_trn_msg});  
  }

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login'] reqBody Error:`, e_mail_adress );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
  }
});


// 내 회사 사용자 목록 조회
router.post('/getuserlist', localcheck, authMiddleware, async(req, res) => {
  const {user_name, company_code, ip_address} = req.body;
  
  console.log('getuserlist');
  
  try{
    const usersResult = await pool.query(`SELECT *
      FROM tbl_user_info WHERE company_code = $1`, [company_code]);

    let users = usersResult.rows;

    // 각 user 객체에서 password 속성 제거
    users = users.map(({ password, ...rest }) => rest);

    res.json({ ResultCode: '0', ErrorMessage: '', users });
    res.end();

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserlist'] reqBody Error:`, company_code );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserlist '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }
});


// 모듈로 내보내기
module.exports = router;