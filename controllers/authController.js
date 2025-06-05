const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = new User({ email, password });
    await user.save();

    // Create token on successful registration
    const token =
      new Date().getTime().toString() +
      Math.random().toString(36).substring(2, 15);
    await User.findByIdAndUpdate(user._id, { token });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    // 🪵 Debug logs here
    console.log("User found in DB:", user);
    console.log("Entered password:", password);
    if (user) {
      console.log("Stored hashed password:", user.password);
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch); // 🪵 Log match result

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    
    const token =
      new Date().getTime().toString() +
      Math.random().toString(36).substring(2, 15);
    await User.findByIdAndUpdate(user._id, { token });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err); // 🪵 Log unexpected errors
    res.status(500).json({ message: err.message });
  }
};
