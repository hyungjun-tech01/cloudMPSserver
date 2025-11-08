const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // bcrypt 모듈 추가

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const pool  = require('../../utils/db');

// 숫자 퍼센테지 입력 validate 함수 
const validateAndToNull = (value, fieldName) => {
    // 1. undefined, null, 빈 문자열이면 null로 처리 (PostgreSQL의 NULL로 전달됨)
    if (value === undefined || value === null || value === "") {
        return null;
    }
    
    // 2. 숫자로 변환 시도
    // 쿼리 바디에서 넘어온 값은 문자열일 수 있으므로 Number()로 변환
    const numValue = Number(value);
  
    // 3. 유효한 숫자인지 확인 (NaN이 아니고, 숫자로 변환된 값이 원래 값과 동일한지 확인)
    // isNaN(value)는 '100a' 같은 경우 false를 반환하므로, isNaN(numValue)와 추가 검사가 필요
    if (isNaN(numValue) || String(value).trim() !== String(numValue)) {
         const error = new Error(`${fieldName} is_not_number`);
         error.statusCode = 400; // HTTP 상태 코드 지정
         error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
         throw error;
    }
  
    // 4. 0에서 100 사이의 범위인지 확인
    if (numValue < 0 || numValue > 100) {
      const error = new Error(`${fieldName} is_between_0_100`);
      error.statusCode = 400; // HTTP 상태 코드 지정
      error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
      throw error;
  
    }
  
    // 5. 모든 검사를 통과하면 Number 타입으로 반환
    return numValue;
  };

  const validateInteger = (value, fieldName) => {
    // 1. undefined, null, 빈 문자열이면 null로 처리 (PostgreSQL의 NULL로 전달됨)
    if (value === undefined || value === null || value === "") {
        return null;
    }
    
    // 2. 숫자로 변환 시도
    // 쿼리 바디에서 넘어온 값은 문자열일 수 있으므로 Number()로 변환
    const numValue = Number(value);
  
    // 3. 유효한 숫자인지 확인 (NaN이 아니고, 숫자로 변환된 값이 원래 값과 동일한지 확인)
    // isNaN(value)는 '100a' 같은 경우 false를 반환하므로, isNaN(numValue)와 추가 검사가 필요
    if (isNaN(numValue) || String(value).trim() !== String(numValue)) {
         const error = new Error(`${fieldName} is_not_number`);
         error.statusCode = 400; // HTTP 상태 코드 지정
         error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
         throw error;
    }
    
    // 5. 모든 검사를 통과하면 Number 타입으로 반환
    return numValue;
  };  
  

// login : host:port번호/api/restapi/MFPIDPWDLogin 
router.post('/MFPIDPWDLogin',localcheck, async(req, res) => {
    const {user_name, password, ip_address} = req.body;
    try{
        const users = await pool.query(`SELECT user_name, full_name, privilege, password FROM tbl_user_info 
                                         WHERE user_name = $1 
                                         and user_status='COMPLETE_AUTH' 
                                         and deleted = 'N'`, [user_name]);
                                         
        if(!users.rows.length) 
        throw new Error('Invalid userName or password');

        // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
        const hashedPassword = users.rows[0].password;
        const full_name = users.rows[0].full_name;
        const privilege = users.rows[0].privilege;

        
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        // const passwordMatch = password===hashedPassword ? true:false;

        if (passwordMatch) {
        const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '24hr' });
        res.json({ result: 'OK', details: {description:'로그인 성공', ID:user_name, full_name:full_name, privilege:privilege}});
        } else {
        const error = new Error('등록되지 않은 ID이거나 잘못된 비밀번호입니다.');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
        }

        res.end();

    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/MFPIDPWDLogin'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/MFPIDPWDLogin '] Error:`, err.message); 
    
        res.status(401).json({ result: 'NG', details: {description:err.message, ID:'', full_name:'', privilege:''} });
        res.end();
    }
  }); 

router.post('/IDPWDGetToken',localcheck, async(req, res) => {
    const {user_name, password, ip_address} = req.body;
    try{

        const users = await pool.query(`SELECT user_id, user_name, full_name, privilege, password FROM tbl_user_info 
                                         WHERE user_name = $1 
                                         and user_status='COMPLETE_AUTH' 
                                         and deleted = 'N'`, [user_name]);
                                         
        if(!users.rows.length) 
            throw new Error('Invalid userName or password');
 
        // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
        const hashedPassword = users.rows[0].password;
        const full_name = users.rows[0].full_name;
        const privilege = users.rows[0].privilege;
        const v_user_id = users.rows[0].user_id;

        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        // const passwordMatch = password===hashedPassword ? true:false;

        if (passwordMatch) {
        const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '24hr' });

        const create_auth = await pool.query(`insert into tbl_auth_info(
            reference_id,auth_type, verification_code, expired_date, created_date )
            values($1, $2, $3, $4::timestamp, now() )   
          `, [v_user_id,'REMOTE_CLIENT_TOKEN', token, '2099.12.31']);

        res.json({ result: 'OK', remote_client_token:token , details: {description:'로그인 성공', ID:user_name, full_name:full_name, privilege:privilege}});
        } else {
        const error = new Error('등록되지 않은 ID이거나 잘못된 비밀번호입니다.');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
        }

        res.end();

    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/IDPWDGetToken'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/IDPWDGetToken '] Error:`, err.message); 
    
        res.status(401).json({ result: 'NG', details: {description:err.message, ID:'', full_name:'', privilege:''} });
        res.end();
    }
  }); 
  
  router.post('/DeviceStatusUpdate',localcheck, async(req, res) => {
    const remote_client_token = req.headers.remote_client_token;
    const {
            Model,
            SerialNo,
            Status,
            BlackToner,
            CyanToner,
            MagentaToner,
            YellowToner,
            BlackDrum,
            CyanDrum,
            MagentaDrum,
            YellowDrum,
            A3BlackPages,
            A3ColorPages,
            A4BlackPages,
            A4ColorPages} = req.body;
     
    try{
        transaction = await pool.connect();

        await transaction.query('BEGIN'); // 트랜잭션 시작
        // remote client token 으로 user_id 찾음 .

        const user_id = await transaction.query(`SELECT reference_id
                                         FROM tbl_auth_info 
                                         WHERE verification_code = $1 
                                         and auth_type = 'REMOTE_CLIENT_TOKEN' 
                                         and expired_date >= now()`, [remote_client_token]);
                                         
        if (!user_id.rows.length){
            const error = new Error('remote_client_token 토큰 에러입니다. 토큰을 새로 받으세요.');
            error.statusCode = 400; // HTTP 상태 코드 지정
            error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
            throw error;
        }
        const v_user_id = user_id.rows[0].reference_id;

        const users = await transaction.query(`SELECT user_name , user_type, company_code
                                         FROM tbl_user_info 
                                         WHERE user_id = $1 
                                         and user_status='COMPLETE_AUTH' 
                                         and deleted = 'N'`, [v_user_id]);
                                         
        if(!users.rows.length){
            const error = new Error('인증하지 않은 사용자이거나 삭제된 사용자입니다.');
            error.statusCode = 400; // HTTP 상태 코드 지정
            error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
            throw error;
        }
        
        const userType = users.rows[0].user_type;
        const companyCode = users.rows[0].company_code;

  
        // 만약 데이터가 device 에 없으면 데이터 생성 , 
        // 개인회원이면, user_id 를 client_device_info에 입력 
        // 기업회원이면, company_code를 client_device_info에 입력
        // 파트너이면 company_code를 client_device_info에

        //device id 확인 , model과  serial number로 
        let v_device_id;  
        const device = await transaction.query(`SELECT device_id
                                         FROM tbl_device_info 
                                         WHERE device_model= $1
                                         and serial_number = $2
                                         limit 1`, [Model, SerialNo]);
                            
        if(!device.rows.length) {
            const device_id = await transaction.query(`select uuid_generate_v4() uuid`,[]);

            v_device_id  = device_id.rows[0].uuid;   
                                                     
            const createDevice = await transaction.query(`insert into tbl_device_info(
                  device_id             ,device_name          ,created_date
                  ,created_by           ,modified_date        ,modified_by
                  ,device_model         ,serial_number        , physical_device_id
                  ,web_print_enabled    , device_type)													
                values($1, $2, now(),  
                    $3,  now(), $4,    
                    $5,  $6, '0.0.0.0',
                    'N', '')`,
              [v_device_id   ,Model            
                ,v_user_id   ,v_user_id
                ,Model         ,SerialNo ]);

            if( userType === 'PERSON'){
                const device_count = await transaction.query(`insert into tbl_client_device_info(
                    device_id, user_id, created_date, created_by)
                    values($1, $2, now(), $3)`,[v_device_id, v_user_id, v_user_id ]);
        
            }else if( userType === 'COMPANY'){
                const device_count = await transaction.query(`insert into tbl_client_device_info(
                    device_id, company_code, created_date, created_by)
                    values($1, $2, now(), $3)`,[v_device_id, companyCode, v_user_id ]);
            }  
        }else{
            v_device_id = device.rows[0].device_id;       
        }
        
        const device_count_id = await transaction.query(`select uuid_generate_v4() uuid`,[]);
        const v_device_count_id = device_count_id.rows[0].uuid;

         // 2. 각 변수를 변환합니다. (변수명이 길어 가독성을 위해 새 변수에 할당)
        const v_black_toner_percentage = validateAndToNull(BlackToner, 'BlackToner');
        const v_cyan_toner_percentage = validateAndToNull(CyanToner, 'CyanToner');
        const v_magenta_toner_percentage = validateAndToNull(MagentaToner, 'MagentaToner');
        const v_yellow_toner_percentage = validateAndToNull(YellowToner, 'YellowToner');
        
        const v_black_drum_percentage = validateAndToNull(BlackDrum, 'BlackDrum');
        const v_cyan_drum_percentage = validateAndToNull(CyanDrum, 'CyanDrum');
        const v_magenta_drum_percentage = validateAndToNull(MagentaDrum, 'MagentaDrum');
        const v_yellow_drum_percentage = validateAndToNull(YellowDrum, 'YellowDrum');

        const v_a3_black_pages = validateInteger(A3BlackPages, 'A3BlackPages');
        const v_a3_color_pages = validateInteger(A3ColorPages, 'A3ColorPages');
        const v_a4_black_pages = validateInteger(A4BlackPages, 'A4BlackPages');
        const v_a4_color_pages = validateInteger(A4ColorPages, 'A4ColorPages');

        
       const device_count = await transaction.query(`insert into tbl_device_count_info(
            device_count_id,
            device_id,          device_model,       serial_number, 
            status,             black_toner,        cyan_toner,   
            magenta_toner,      yellow_toner,       black_drum,
            cyan_drum,          magenta_drum,       yellow_drum,
            a3_black_pages,     a3_color_pages,     a4_black_pages,
            a4_color_pages,     created_date,       created_by)
        values($1, 
                $2, $3, $4, 
                $5, $6::integer, $7::integer, 
                $8::integer, $9::integer, $10::integer, 
                $11::integer, $12::integer, $13::integer, 
                $14::integer, $15::integer, $16::integer, 
                $17::integer, now(), $18)`, 
            [v_device_count_id,v_device_id,  Model, SerialNo,
                Status,  v_black_toner_percentage,  v_cyan_toner_percentage,
                v_magenta_toner_percentage,  v_yellow_toner_percentage,  v_black_drum_percentage,
                v_cyan_drum_percentage,      v_magenta_drum_percentage,  v_yellow_drum_percentage,
                v_a3_black_pages,  v_a3_color_pages,  v_a4_black_pages,
                v_a4_color_pages,  v_user_id   ]);

        await transaction.query('COMMIT');
        res.json({ result: 'OK',  details: {description:''}});  
        res.end();

    }catch(err){
        if (transaction) {
            try {
                await transaction.query('ROLLBACK'); // 오류 발생 시 롤백
                console.log(`[트랜잭션 롤백 ]:`, e_mail_adress);
            } catch (rollbackErr) {
                console.log(`[트랜잭션 롤백 실패]:`, rollbackErr.message);
            }
          }            
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/DeviceStatusUpdate'] reqBody Error:`, SerialNo );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/DeviceStatusUpdate '] Error:`, err.message); 
    
        res.status(401).json({ result: 'NG', details: {description:err.message} });
        res.end();
    }
  });          

  // 모듈로 내보내기
  module.exports = router;