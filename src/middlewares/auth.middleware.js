const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token não fornecido',
    });
  }

  try {
    const result = await db.query('SELECT * FROM projetolivros.usuario WHERE token = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Token inválido',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Error validating token:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error', 
    });
  }
};

module.exports = authenticateToken;
