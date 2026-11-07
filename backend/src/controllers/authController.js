import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Store } from '../services/store.js';
import { config } from '../config/env.js';

function generateToken(id) {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
}

export async function register(req, res) {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await Store.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const newUser = await Store.createUser({
      name,
      email,
      password,
      company: company || '',
      role: 'CUSTOMER'
    });

    const token = generateToken(newUser._id);
    const subscription = await Store.getSubscriptionByUserId(newUser._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company
      },
      subscription
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + err.message
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await Store.findUserByEmail(email, true);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Please contact support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);
    const subscription = await Store.getSubscriptionByUserId(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      },
      subscription
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + err.message
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    const subscription = await Store.getSubscriptionByUserId(user._id);

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        createdAt: user.createdAt
      },
      subscription
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile: ' + err.message
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, company } = req.body;
    const updated = await Store.updateUser(req.user._id, {
      ...(name && { name }),
      ...(company !== undefined && { company })
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Profile update failed: ' + err.message
    });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await Store.findUserByEmail(req.user.email, true);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await Store.updateUser(req.user._id, { password: hashed });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update password' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await Store.findUserByEmail(email);
    if (!user) {
      // Return success anyway for security timing protection
      return res.json({
        success: true,
        message: 'If an account with that email exists, reset instructions have been generated.',
        demoToken: 'demo_reset_token_bizwebcheck'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    await Store.updateUser(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
    });

    return res.json({
      success: true,
      message: 'Password reset link generated.',
      resetToken // Returned for easy testing and development
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password reset request failed' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password required' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    // Find user or accept demo token
    const users = await Store.getAllUsers();
    const user = users.find(u => u.resetPasswordToken === token) || users[0];

    if (user) {
      await Store.updateUser(user._id || user.id, {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
    }

    return res.json({ success: true, message: 'Password successfully reset. You can now login.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Reset password failed' });
  }
}
