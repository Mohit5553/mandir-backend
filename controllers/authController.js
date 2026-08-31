const User = require('../models/User');
const Role = require('../models/Role');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mailService = require('../services/mailService');
const { logAudit } = require('../services/auditService');

const AuditLog = require('../models/AuditLog');

const ALL_MENUS = [
  'Dashboard', 'Users', 'Roles', 'Trust Management', 'Donations',
  'Events', 'News', 'Gallery', 'Home Carousel', 'Homepage Content',
  'Volunteer Requests', 'Live Stream', 'Notifications', 'Contact Messages', 'Reports',
  'Reviews', 'Audit Logs'
];

const getSuperAdminPermissions = () =>
  ALL_MENUS.map(menu => ({ menu, view: true, create: true, update: true, delete: true }));

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({ name, email, password, role, phone });
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      await logAudit({ req, userEmail: email, action: 'LOGIN_FAILURE', details: { reason: 'Invalid credentials' } });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let permissions;
    if (user.role === 'Super Admin') {
      permissions = getSuperAdminPermissions();
    } else {
      const roleDoc = await Role.findOne({ name: user.role });
      permissions = roleDoc ? roleDoc.permissions : [];
    }

    // Generate JWT access token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_key_here',
      { expiresIn: '1h' }
    );

    // Generate Refresh token
    const refreshTokenValue = crypto.randomBytes(40).toString('hex');
    const refreshTokenDoc = new RefreshToken({
      token: refreshTokenValue,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await refreshTokenDoc.save();

    await logAudit({ req, userId: user._id, userName: user.name, userEmail: user.email, action: 'LOGIN_SUCCESS' });

    res.status(200).json({ 
      message: 'Login successful', 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }, 
      permissions,
      token,
      refreshToken: refreshTokenValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken }).populate('user');
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = tokenDoc.user;
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_key_here',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, role, password } = req.body;

    if (password && password.trim() !== '') {
      const requesterRole = req.user?.role;
      const requesterId = req.user?.id;
      if (requesterRole !== 'Super Admin' && requesterId !== req.params.id) {
        return res.status(403).json({ message: 'Unauthorized: Only Super Admin or the account owner can update this password.' });
      }
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousRole = user.role;
    if (name) user.name = name;
    if (role) user.role = role;
    if (password && password.trim() !== '') {
      user.password = password;
    }
    
    await user.save();

    if (role && previousRole !== role) {
      await logAudit({
        req,
        action: 'USER_ROLE_CHANGE',
        details: {
          targetUserId: user._id,
          targetUserEmail: user.email,
          previousRole,
          newRole: role
        }
      });
    }

    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email address exists.' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Reset Link: e.g. http://localhost:5173/#/reset-password?token=TOKEN
    const resetUrl = `${req.headers.origin}/#/reset-password?token=${token}`;
    console.log(`📡 Sending password reset link to: ${email}`);

    const mailResult = await mailService.sendPasswordResetEmail(email, resetUrl);
    if (!mailResult.sent) {
      return res.status(500).json({ message: 'Failed to send reset email. SMTP is not configured properly.' });
    }

    res.status(200).json({ message: 'A password reset link has been sent to your Gmail inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
