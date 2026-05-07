const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret"
      );

      // Get user from the token and exclude password
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }
      });

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * ============================================================================
 * MIDDLEWARE: optionalAuth
 * ============================================================================
 * Ye middleware check karta hai ki agar token hai toh user data ko req.user me set kare, 
 * lekin agar token nahi hai toh request block nahi karta (error nahi deta).
 * Ye public pages ke liye useful hai jahan logged-in user ko extra features milte hain 
 * (jaise progress checkmarks) aur guests ko fresh content dikhta hai.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret"
      );
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }
      });
    } catch (error) {
      // Intentionally empty, optional auth ignores token errors
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
