const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');
const { validatePassword } = require('../utils/validation');

// Register - First time admin creation
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Check if admin already exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists. Registration is disabled.',
      });
    }

    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      });
    }

    // Create new admin
    const admin = await Admin.create({
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken(admin._id);

    // Remove password from response
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      admin: adminData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during registration',
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await admin.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Remove password from response
    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during login',
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all password fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Find admin
    const admin = await Admin.findById(adminId).select('+password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Verify old password
    const isOldPasswordValid = await admin.matchPassword(oldPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing password',
    });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      admin: adminData,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying token',
    });
  }
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      admin: adminData,
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin',
    });
  }
};
