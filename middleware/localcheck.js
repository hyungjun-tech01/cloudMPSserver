// 요청의 유효성을 검사하는 미들웨어 함수를 정의합니다.
const localcheck = (req, res, next) => {
    const auth_token = req.headers.auth_token;
    const {user_name} = req.body;

    // 1. 요청이 로컬 IP 주소에서 왔는지 확인, 혹은 특정 서버만 가능하게 
    const clientIp = req.ip || req.socket.remoteAddress;
    const isLocal = clientIp === '::1' || clientIp === '127.0.0.1';

    // 2. 외부 요청일 때만 Auth Token을 검사
    if (!isLocal) {
        if (auth_token !== process.env.CLOUDMPS_AUTH_TOKEN) {
            // 토큰이 유효하지 않으면 401 Unauthorized 에러 반환
            console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'localcheck'] reqBody Error:`, user_name );
            console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'localcheck'] Error:`, 'Auth Token Error'); 
      
            return res.status(401).json({ ResultCode: '2', ErrorMessage: 'Auth Token Error' });
        }
    }

    // 모든 검사를 통과하면 다음 미들웨어 또는 라우터 핸들러로 제어를 넘깁니다.
    next();
};

module.exports = localcheck;