const express = require('express');

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');
const pool  = require('../../utils/db');
const getSafePagination = require('../../utils/getSafePagination');

//device 등록 
router.post('/create',localcheck, authMiddleware, async(req, res) => {
  const {device_name
    ,ext_device_function
    ,physical_device_id
    ,location
    ,device_model
    ,serial_number
    ,device_status
    ,device_type
    ,black_toner_percentage
    ,cyan_toner_percentage
    ,magenta_toner_percentage
    ,yellow_toner_percentage
    ,app_type
    ,black_drum_percentage
    ,cyan_drum_percentage
    ,magenta_drum_percentage
    ,yellow_drum_percentage
    ,client_id
    ,user_name 
    ,company_code, ip_address} = req.body;
    try{
      transaction = await pool.connect();

      await transaction.query('BEGIN'); // 트랜잭션 시작

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
    
    // 2. 각 변수를 변환합니다. (변수명이 길어 가독성을 위해 새 변수에 할당)
    const v_black_toner_percentage = validateAndToNull(black_toner_percentage, 'black_toner_percentage');
    const v_cyan_toner_percentage = validateAndToNull(cyan_toner_percentage, 'cyan_toner_percentage');
    const v_magenta_toner_percentage = validateAndToNull(magenta_toner_percentage, 'magenta_toner_percentage');
    const v_yellow_toner_percentage = validateAndToNull(yellow_toner_percentage, 'yellow_toner_percentage');
    
    const v_black_drum_percentage = validateAndToNull(black_drum_percentage, 'black_drum_percentage');
    const v_cyan_drum_percentage = validateAndToNull(cyan_drum_percentage, 'cyan_drum_percentage');
    const v_magenta_drum_percentage = validateAndToNull(magenta_drum_percentage, 'magenta_drum_percentage');
    const v_yellow_drum_percentage = validateAndToNull(yellow_drum_percentage, 'yellow_drum_percentage');

      const user_id = await pool.query(`select user_id
        from tbl_user_info tbi
        where tbi.user_name = $1`,[user_name]);

      const v_created_by = user_id.rows[0].user_id;
       
  
      const device_id = await pool.query(`select uuid_generate_v4() uuid`,[]);

      const v_device_id  = device_id.rows[0].uuid;

      const createDevice = await pool.query(`insert into tbl_device_info(
          device_id             ,device_name          ,created_date
          ,created_by           ,modified_date        ,modified_by
          ,ext_device_function  ,physical_device_id   ,location
          ,device_model         ,serial_number        ,device_status
          ,device_type          ,black_toner_percentage                 ,cyan_toner_percentage
          ,magenta_toner_percentage         ,yellow_toner_percentage    ,app_type
          ,black_drum_percentage            ,cyan_drum_percentage       ,magenta_drum_percentage
          ,yellow_drum_percentage, web_print_enabled )													
        values($1, $2, now(),  
            $3,  now(), $4,    
            $5,  $6,  $7,
            $8,  $9,  $10,
            $11, $12::integer, $13::integer,
            $14::integer, $15::integer, $16,
            $17::integer, $18::integer, $19::integer,
            $20::integer, 'N')`,
      [v_device_id ,device_name            
        ,v_created_by  ,v_created_by
        ,ext_device_function  ,physical_device_id   ,location
          ,device_model         ,serial_number        ,device_status
          ,device_type          ,v_black_toner_percentage                 ,v_cyan_toner_percentage
          ,v_magenta_toner_percentage         ,v_yellow_toner_percentage    ,app_type
          ,v_black_drum_percentage            ,v_cyan_drum_percentage       ,v_magenta_drum_percentage
          ,v_yellow_drum_percentage ]);

   const createDeviceClient = await pool.query(`insert into tbl_client_device_info(
            device_id       ,client_id      ,company_code
            ,created_date   ,created_by     ,modified_date
            ,modified_by)													
        values($1, $2, $3::integer,  
          now(),        $4,      now(),    
            $5)`,
      [v_device_id ,client_id  ,company_code        
        ,v_created_by
        ,v_created_by]);

      await transaction.query('COMMIT');
      
      res.json({ ResultCode: '0', ErrorMessage: '' , x_device_id:v_device_id});
      res.end();
  
    }catch(err){
      // 3. 오류 발생 시 트랜잭션 롤백
      if (transaction) {
        try {
            await transaction.query('ROLLBACK'); // 오류 발생 시 롤백
            console.log(`[트랜잭션 롤백 ]:`, user_name);
        } catch (rollbackErr) {
            console.log(`[트랜잭션 롤백 실패]:`, rollbackErr.message);
        }
      }    
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/devices/create'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/devices/create'] Error:`, err.message); 
  
        const resultCode = err.resultCode || '1';
        res.status(401).json({ ResultCode: resultCode, ErrorMessage: err.message });
    }finally {
      // 4. 클라이언트 연결 해제
      if (transaction) {
        transaction.release();
      }
    }
});


 // 내회사가 등록한 device list 정보 조회
 router.post('/getdevicelist',localcheck, authMiddleware, async(req, res) => {

    const {search_client_name, 
            search_device_name, 
            search_device_location, 
            search_device_notes,
            search_device_ip_address,
            search_device_model,
            items_per_page, 
            current_page,
            user_name, 
            company_code, ip_address} = req.body;

   // 값이 undefined, null 또는 없는 경우 ''로 설정하여 SQL 쿼리 안전성 확보
   const searchClientName = search_client_name ?? '';
   const searchDeviceName = search_device_name ?? '';
   const searchDeviceLocation = search_device_location ?? '';
   const searchDeviceNotes = search_device_notes ?? '';
   const searchDeviceIpAddress = search_device_ip_address ?? '';
   const searchDeviceModel = search_device_model ?? '';
 
   //  페이징 함수 호출 및 변수 설정 
   const { itemsPerPage, currentPage, offset } 
     = getSafePagination(items_per_page, current_page); 
              
  
    try{
        const count = await pool.query(`SELECT count(*)
        FROM tbl_device_info tdi
        JOIN tbl_client_device_info tcdi ON tdi.device_id = tcdi.device_id
        LEFT JOIN tbl_client_info tci ON tcdi.client_id = tci.client_id
        WHERE tcdi.company_code = $1
        and tci.client_name ilike '%'||$2||'%'
        and tdi.device_name ilike '%'||$3||'%'
        and tdi.location ilike '%'||$4||'%'
        and tdi.physical_device_id ilike '%'||$5||'%'
        and tdi.device_model  ilike '%'||$6||'%'`, 
        [company_code, searchClientName, 
            searchDeviceName, searchDeviceLocation, 
            searchDeviceIpAddress, searchDeviceModel]);
       
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);        

        const results = await pool.query(`SELECT tdi.device_id
                ,tdi.device_name
                ,tdi.created_date
                ,tdi.created_by
                ,tdi.modified_date
                ,tdi.modified_by
                ,tdi.ext_device_function
                ,tdi.physical_device_id
                ,tdi.location
                ,tdi.device_model
                ,tdi.serial_number
                ,tdi.device_status
                ,tdi.device_type
                ,tdi.black_toner_percentage
                ,tdi.cyan_toner_percentage
                ,tdi.magenta_toner_percentage
                ,tdi.yellow_toner_percentage
                ,tdi.app_type
                ,tdi.black_drum_percentage
                ,tdi.cyan_drum_percentage
                ,tdi.magenta_drum_percentage
                ,tdi.yellow_drum_percentage
                ,tci.client_name
            FROM tbl_device_info tdi
            JOIN tbl_client_device_info tcdi ON tdi.device_id = tcdi.device_id
            LEFT JOIN tbl_client_info tci ON tcdi.client_id = tci.client_id
            WHERE tcdi.company_code = $1
            and tci.client_name ilike '%'||$2||'%'
            and tdi.device_name ilike '%'||$3||'%'
            and tdi.location ilike '%'||$4||'%'
            and tdi.physical_device_id ilike '%'||$5||'%'
            and tdi.device_model  ilike '%'||$6||'%'
            limit $7 offset $8`, 
            [company_code, searchClientName, 
                searchDeviceName, searchDeviceLocation, 
                searchDeviceIpAddress, searchDeviceModel,
                 itemsPerPage, offset]);
  
        let devices = results.rows;
  
      res.json({ ResultCode: '0', ErrorMessage: '', totalPages:totalPages,  devices: devices });
      res.end();
  
    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo '] Error:`, err.message); 
  
        res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
        res.end();
    }
  
  });


  // 모듈로 내보내기
  module.exports = router;