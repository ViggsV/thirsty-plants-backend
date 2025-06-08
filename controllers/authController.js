const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signs id + email into the access token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
};

// Helper function to set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Refresh endpoint
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("email");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new tokens
    const accessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);
    
    res.json({ accessToken });
  } catch (err) {
    // Clear invalid refresh token
    res.clearCookie("refreshToken");
    
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "Refresh token expired" });
    }
    
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Registration
exports.register = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create new user (assuming password hashing is handled in User model)
    const user = new User({ email, password });
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({ 
      message: "User registered successfully", 
      accessToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({ 
      accessToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// Get current user (protected route)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user should be set by your auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = exports;