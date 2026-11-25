# 🤖 AI MCQ Assistant

An AI-powered Chrome Extension that generates multiple-choice questions (MCQs) from educational webpage content using Google's Gemini API.

## ✨ Features

- Extracts content from educational webpages.
- Generates context-based MCQs using Google Gemini AI.
- Provides multiple-choice questions with correct answers.
- Displays explanations for answers.
- Allows users to attempt quizzes.
- Provides instant feedback and final scores.

## 🛠️ Technologies Used

- JavaScript
- HTML
- CSS
- Chrome Extension (Manifest V3)
- Node.js
- Google Gemini API

## 📂 Project Structure

```text
AI-MCQ-Assistant/
│
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
├── server.js
├── test.js
├── .env
├── .gitignore
└── README.md
```

*Note: Update this structure to match your actual project files.*

## ⚙️ Setup Instructions

1. Clone or download this repository.
2. Install Node.js.
3. Install the required dependencies:

```bash
npm install
```

4. Create a `.env` file and add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

5. Start the backend server:

```bash
node server.js
```

6. Open Google Chrome and visit:

```text
chrome://extensions/
```

7. Enable Developer Mode.
8. Click Load unpacked and select the extension folder.

## 🚀 Future Enhancements

- PDF and document support.
- Adaptive difficulty levels.
- Quiz history and performance tracking.
