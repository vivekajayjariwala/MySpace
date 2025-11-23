const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

router.post('/generate-event', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Server configuration error: GEMINI_API_KEY not found' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `
        You are an event planning assistant. Generate a JSON object for an event based on the user's prompt.
        The JSON object must have the following fields:
        - title: A catchy title for the event.
        - description: A short, engaging description.
        - type: One of "Activity", "Dining", "Blind Date", "Board Game", "Birthday", or "Custom".
        - emoji: A single emoji representing the event.
        
        Return ONLY the JSON object, no markdown formatting.
        `;

        const fullPrompt = `${systemInstruction}\n\nUser Prompt: ${prompt}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: fullPrompt
        });

        const generatedText = response.text;

        // Clean up potential markdown code blocks if Gemini adds them
        const jsonString = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        const eventData = JSON.parse(jsonString);

        res.json(eventData);

    } catch (error) {
        console.error('AI Generation Error:', error);
        // Extract meaningful error message from Google API error
        const errorMessage = error.body ? error.body : (error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to generate event details', error: errorMessage });
    }
});

module.exports = router;
