const User = require('../models/User');
const Role = require('../models/Role');
const crypto = require('crypto');
const mailService = require('../services/mailService');

const ALL_MENUS = [
  'Dashboard', 'Users', 'Roles', 'Trust Management', 'Donations',
  'Events', 'News', 'Gallery', 'Home Carousel', 'Homepage Content',
  'Volunteer Requests', 'Live Stream', 'Notifications', 'Contact Messages', 'Reports'
];

const getSuperAdminPermissions = () =>
  ALL_MENUS.map(menu => ({ menu, view: true, create: true, update: true, delete: true }));

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const user = new User({ name, email, password, role, phone });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let permissions;
    if (user.role === 'Super Admin') {
      permissions = getSuperAdminPermissions();
    } else {
      const roleDoc = await Role.findOne({ name: user.role });
      permissions = roleDoc ? roleDoc.permissions : [];
    }

    res.status(200).json({ message: 'Login successful', user, permissions });
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
    const { name, role, password, requesterId } = req.body;

    if (password && password.trim() !== '') {
      if (!requesterId) {
        return res.status(403).json({ message: 'Requester ID is required to update the password.' });
      }
      const requester = await User.findById(requesterId);
      if (!requester) {
        return res.status(403).json({ message: 'Requester not found.' });
      }
      if (requester.role !== 'Super Admin' && requester._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Unauthorized: Only the Super Admin or the user themselves can reset this password.' });
      }
    }

    const updateData = { name, role };
    if (password && password.trim() !== '') {
      updateData.password = password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, returnDocument: 'after' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
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

    // Reset Link: e.g. http://localhost:5173/reset-password?token=TOKEN
    const resetUrl = `${req.headers.origin}/reset-password?token=${token}`;
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
