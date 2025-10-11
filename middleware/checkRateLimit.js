const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); 
// Redis를 사용하지 않고 메모리 기반으로 간단히 구현하는 예시입니다.
// 실제 운영 환경에서는 Redis 스토어 사용을 강력히 권장합니다.

const checkRateLimit = rateLimit({
  // **windowMs:** 1분 동안 (60 * 1000ms)
  windowMs: 60 * 1000, 
  
  // **max:** 최대 20회 요청 허용
  max: 20, 
  
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req, res) => {
    const baseKey = ipKeyGenerator(req); // ← 이게 IPv6 안전한 형태로 변환해줌
    const ipToLimit = req.body?.ip_address || baseKey;

    console.log(`[RateLimit] Key: ${ipToLimit}`);
    return ipToLimit;
  },
  
  // 제한 초과 시 응답 설정
  handler: (req, res, next, options) => {
    res.status(429).json({ // HTTP 429 Too Many Requests
      ResultCode: '9', 
      ErrorMessage: '요청 횟수 제한 초과. 잠시 후 다시 시도해 주세요.',
    });
  },
});


module.exports = checkRateLimit;