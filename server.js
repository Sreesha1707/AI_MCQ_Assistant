
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Test backend
app.get("/", (req, res) => {
    res.send("AI MCQ Assistant Backend is Running!");
});

// Generate five MCQs
app.post("/generate-mcqs", async (req, res) => {
    try {
        const { webpageText } = req.body;

        if (!webpageText || !webpageText.trim()) {
            return res.status(400).json({
                error: "Please provide webpage text."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",

            contents: `
You are an educational quiz generator.

Generate exactly 5 high-quality multiple-choice questions
based only on the educational content provided below.

Return the response as valid JSON using this structure:

{
    "questions": [
        {
            "question": "Question text",
            "options": {
                "A": "First option",
                "B": "Second option",
                "C": "Third option",
                "D": "Fourth option"
            },
            "correctAnswer": "B",
            "explanation": "Explain why this answer is correct."
        }
    ]
}

IMPORTANT RULES:

1. Generate exactly 5 questions.
2. Each question must have exactly four options.
3. Only one option must be correct.
4. correctAnswer must contain only A, B, C, or D.
5. Questions should test understanding of the content.
6. Avoid repeating the same question.
7. Make incorrect options reasonable and meaningful.
8. Give clear explanations.
9. Return JSON only.
10. Do not include Markdown or additional text.

EDUCATIONAL CONTENT:

${webpageText.slice(0, 15000)}
            `,

            config: {
                responseMimeType: "application/json"
            }
        });

        const mcqData = JSON.parse(response.text);

        // Validate the generated questions
        if (
            !Array.isArray(mcqData.questions) ||
            mcqData.questions.length !== 5 ||
            !mcqData.questions.every(q =>
                typeof q.question === "string" &&
                q.options &&
                ["A", "B", "C", "D"].every(key =>
                    typeof q.options[key] === "string"
                ) &&
                ["A", "B", "C", "D"].includes(q.correctAnswer) &&
                typeof q.explanation === "string"
            )
        ) {
            throw new Error("Invalid MCQ format received from Gemini.");
        }

        // Send questions to the extension
        res.json(mcqData);

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            error: "Failed to generate MCQs: " + error.message
        });
    }
});

// Start backend server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
