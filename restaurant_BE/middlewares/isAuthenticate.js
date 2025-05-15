const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

// exports.verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(403).json({ message: 'Invalid token' });
//   }
// };


// exports.authenticate = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token || token.split('.').length !== 3) {
//     return res.status(401).json({
//       message: 'Invalid token format.',
//       success: false,
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Token verification failed:", error.message);
//     res.status(401).json({
//       message: 'Invalid or expired token.',
//       success: false,
//     });
//   }
// };

exports.isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
        success: false
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
        message: false
      });
    }


    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid or expired token.",
          success: false
        });
      }

      req.user = decoded;  // Lưu thông tin người dùng vào request
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Internal server error.",
      success: false
    });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.roleId != '67ac64afe072694cafa16e76') {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);

    return res.status(500).json({
      message: "Internal server error.",
      success: false
    });
  }
}