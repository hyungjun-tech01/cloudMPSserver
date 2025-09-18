const express = require('express');
const router = express.Router();

// login : host:port번호/api/users/login 
router.post('/login', async(req, res) => {
  const {user_name, password} = req.body;
  try{
      
      const users = await pool.query('SELECT user_name, password FROM tbl_user_info WHERE user_name = $1', [user_name]);
      if(!users.rows.length) 
         throw new Error('Invalid userName or password');

      // alogrithm 
      const algorithm = process.env.CRYPTO_ALGORITHM;
      // key 
      let key = Buffer.alloc(32);
      Buffer.from(process.env.CRYPTO_PASSWORD).copy(key);

      // 초기화 벡터를 직접 정의 (16바이트 길이의 버퍼)
      let iv = Buffer.alloc(16);
      Buffer.from(process.env.CRYPTO_IV).copy(iv);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv); 

      let passwordComapre = cipher.update(password, 'utf8', 'base64');

      passwordComapre += cipher.final('base64');

      if(passwordComapre === users.rows[0].password) {
          const token = jwt.sign({user_name}, process.env.JWT_SECRET, {expiresIn:'1hr'});
          res.json({ResultCode : '0', ErrorMessage:'', token:token});
      }else{
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


// 사용자 전체 목록 조회
router.get('/', (req, res) => {
  res.send('사용자 전체 목록 API');
});

// 특정 사용자 조회
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`${userId} 사용자 조회 API`);
});

// 모듈로 내보내기
module.exports = router;