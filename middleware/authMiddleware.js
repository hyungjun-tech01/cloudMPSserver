const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const session_token = req.headers.session_token;

  if (!session_token) return res.status(401).json({ ResultCode: '3', ErrorMessage: 'No session provided' });


  try {
    const decoded = jwt.verify(session_token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    return res.status(401).json({ ResultCode: '3', ErrorMessage: 'Session expired' });
  }
}

module.exports = authMiddleware;