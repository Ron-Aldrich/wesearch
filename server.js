const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

const API_KEY = "8672951c715e5945e70b9da2663e3bbc2a3e7c678738a094057e3117c3a699ea";
const API_BASE_URL = "https://haji-mix-api.gleeze.com/api/gemini";

// AI call function using Gemini model
async function callAI(question) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            ask: question,
            uid: "",
            model: "gemini-1.5-flash",
            roleplay: "You are WeBot, a helpful assistant for WeSearch - a platform that helps students learn Practical Research. Be friendly, educational, and focus on research-related topics when possible.",
            api_key: API_KEY
        });

        const url = `${API_BASE_URL}?${params.toString()}`;
        
        https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.answer) {
                        resolve(result.answer);
                    } else {
                        reject(new Error('No answer received from AI'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse AI response'));
                }
            });
            
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Chat endpoint - This is what your frontend calls
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.json({
                success: false,
                error: 'Message is required'
            });
        }
        
        console.log('User question:', message);
        
        // Call the AI API
        const aiResponse = await callAI(message);
        
        console.log('AI response:', aiResponse);
        
        res.json({
            success: true,
            answer: aiResponse,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        
        // Fallback response if AI fails
        const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or ask me about Practical Research topics!";
        
        res.json({
            success: true,
            answer: fallbackResponse,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'WeSearch Backend with AI is running!',
        aiApiStatus: 'Connected to Gemini API'
    });
});

// Test AI endpoint (optional - for testing)
app.get('/test-ai', async (req, res) => {
    try {
        const testQuestion = req.query.q || "Hello, can you help me with research?";
        const response = await callAI(testQuestion);
        res.json({
            question: testQuestion,
            answer: response
        });
    } catch (error) {
        res.json({
            error: error.message
        });
    }
});

// Serve your HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 WeSearch Backend with AI running on port ${PORT}`);
    console.log(`🤖 AI API: ${API_BASE_URL}`);
    console.log(`💬 Chat endpoint: /api/chat`);
    console.log(`🔧 Test AI: /test-ai?q=your question`);
    console.log(`🏥 Health check: /health`);
});

module.exports = app;
