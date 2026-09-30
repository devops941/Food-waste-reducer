import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, dietaryPreferences } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dietaryPreferences: user.dietaryPreferences,
        reminderSettings: user.reminderSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dietaryPreferences: user.dietaryPreferences,
        reminderSettings: user.reminderSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dietaryPreferences: user.dietaryPreferences,
        reminderSettings: user.reminderSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & reminder settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, dietaryPreferences, reminderSettings } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (dietaryPreferences !== undefined) fieldsToUpdate.dietaryPreferences = dietaryPreferences;
    if (reminderSettings !== undefined) fieldsToUpdate.reminderSettings = reminderSettings;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        dietaryPreferences: updatedUser.dietaryPreferences,
        reminderSettings: updatedUser.reminderSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send test Email message
// @route   POST /api/auth/test-email
// @access  Private
export const testEmailAlert = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const email = req.body.email || user.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'No recipient email specified',
      });
    }

    const { sendTestEmail } = await import('../services/emailService.js');
    const result = await sendTestEmail({
      to: email,
      userName: user.name || 'Pantry Fresh User',
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test email successfully sent to ${email}!`,
        messageId: result.messageId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to dispatch test email. Check SMTP settings.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send test WhatsApp message
// @route   POST /api/auth/test-whatsapp
// @access  Private
export const testWhatsAppAlert = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const phone = req.body.phone || user.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number with country code (e.g. +1... or +91...)',
      });
    }

    const result = await sendWhatsAppMessage({
      to: phone,
      message: `🌱 *Pantry Fresh Test Notification*\n\nHello ${user.name}! Your WhatsApp notification integration via Meta Business API is working perfectly.`,
    });

    res.status(200).json({
      success: result.success,
      result,
      message: result.success
        ? 'Test WhatsApp message sent successfully!'
        : 'Failed to send WhatsApp message. Check server logs or .env credentials.',
    });
  } catch (error) {
    next(error);
  }
};
