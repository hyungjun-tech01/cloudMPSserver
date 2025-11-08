const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // bcrypt 모듈 추가

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const pool  = require('../../utils/db');

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

  

  router.post('/DeviceStatusUpdate',localcheck, async(req, res) => {
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
            A4ColorPages,
            user_name, password, ip_address} = req.body;
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

        // 만약 데이터가 device 에 없으면 데이터 생성 , 
        // 개인회원이면, user_id 를 client_device_info에 입력 
        // 기업회원이면, company_code를 client_device_info에 입력
        // 파트너이면 company_code를 client_device_info에

        //device id 확인 , model과  serial number로 
        const device = await pool.query(`SELECT device_id
                                         FROM tbl_device_info 
                                         WHERE device_model= $1
                                         and serial_number = $2
                                         limit 1`, [Model, SerialNo]);
        if(!device.rows.length) 
            throw new Error('Device가 없습니다.');
        const device_id = device.rows[0].device_id;

//        const device_count_id

//        const device_count = wait pool.query(`insert into tbl_device_count_info(
//
//        )
//        values()
//        `, [Model, SerialNo]);

        res.end();

    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/MFPIDPWDLogin'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/MFPIDPWDLogin '] Error:`, err.message); 
    
        res.status(401).json({ result: 'NG', details: {description:err.message, ID:'', full_name:'', privilege:''} });
        res.end();
    }
  });          

  // 모듈로 내보내기
  module.exports = router;