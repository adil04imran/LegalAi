import express from "express";
import User from "../models/User.js";
import { generateToken, authMiddleware } from "../utils/jwtUtils.js";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// @desc    Mock register endpoint (no longer creates a user)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', (req, res) => {
    // Return a success response without creating a user
    res.status(200).json({ 
        message: 'Authentication is not required. You can access all features without signing up.',
        token: 'mock-token-no-auth-required'
    });
});

// @desc    Mock login endpoint (no actual authentication)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', (req, res) => {
    // Return a success response without authenticating
    res.status(200).json({ 
        message: 'Authentication is not required. You can access all features without logging in.',
        token: 'mock-token-no-auth-required'
    });
});

// @desc    Mock user profile
// @route   GET /api/auth/profile
// @access  Public
router.get('/profile', (req, res) => {
    // Return a mock user profile
    res.status(200).json({
        id: 'mock-user-id',
        username: 'demo-user',
        email: 'demo@example.com',
        createdAt: new Date().toISOString()
    });
});

router.post('/msg', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email');

    if (!user) return res.status(404).send('User not found');

    const bodyData = req.body.data;

    if (!bodyData) {
      return res.status(400).send('No data provided');
    }

    // Format email content
    const content = `
Hi ${user.name},

Here is your analyzed document data:

Client Name: ${bodyData['Client name'] || 'N/A'}
PAN: ${bodyData['PII data']?.PAN?.join(', ') || 'N/A'}
AADHAAR: ${bodyData['PII data']?.AADHAAR?.join(', ') || 'N/A'}
GSTIN: ${bodyData['PII data']?.GSTIN?.join(', ') || 'N/A'}
Nature of Notice: ${bodyData['Nature of notice'] || 'N/A'}
Deadlines and Penalties: ${bodyData['Deadlines and penalties'] || 'N/A'}
Reporting Officer/Office: ${bodyData['Reporting officer/office'] || 'N/A'}
Relevant Legal Sections: ${bodyData['Relevant legal sections'] || 'N/A'}

Best regards,
Document Analysis System
    `;

    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '228r1a05g5@cmrec.ac.in',
        pass: 'szgl rmce uibr gqws' // App password
      }
    });

    const mailOptions = {
      from: '228r1a05g5@cmrec.ac.in',
      to: user.email,
      subject: 'Your Document Analysis Results',
      text: content
    };

    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Failed to send email');
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).send('Email sent successfully!');
      }
    });

  } catch (error) {
    console.error('Internal error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/getuser', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email password');
    
    // console.log(user.name);
    if (!user) return res.status(404).send('User not found');

    res.json(user.email);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Test route
router.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, "process.env.JWT_SECRET", {
      expiresIn: "10h",
    });
    console.log(token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// User Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password ,phone} = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({ name, email, password,phone });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, "process.env.JWT_SECRET", {
      expiresIn: "10h",
    });



    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});




export default router;