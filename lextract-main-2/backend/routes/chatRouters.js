import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Basic validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }


    // Return a simple response if no API key is set
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        response: "I'm a simple chat bot. For full functionality, please set up the OPENAI_API_KEY in your environment variables."
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
      });

      res.json({ response: completion.choices[0].message.content });
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.json({
        response: "I'm sorry, I encountered an error while processing your request."
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

export default router;
