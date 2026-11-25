
const generateBtn = document.getElementById("generateBtn");
const status = document.getElementById("status");
const quiz = document.getElementById("quiz");

let questions = [];

generateBtn.addEventListener("click", generateQuiz);

async function generateQuiz() {
    try {
        generateBtn.disabled = true;
        status.textContent = "Reading webpage...";
        quiz.innerHTML = "";

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.id) {
            throw new Error("Could not find the active webpage.");
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
        });

        const webpageText = results[0].result;

        if (!webpageText || !webpageText.trim()) {
            throw new Error("No readable text found on this webpage.");
        }

        status.textContent = "Generating your five questions...";

        const response = await fetch(
            "http://localhost:3000/generate-mcqs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ webpageText })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to generate MCQs.");
        }

        if (!Array.isArray(data.questions) ||
            data.questions.length !== 5) {
            throw new Error("Invalid quiz received from backend.");
        }

        questions = data.questions;

        status.textContent = "Select your answers for all five questions.";

        displayQuiz();

    } catch (error) {
        console.error(error);
        status.textContent = "Error: " + error.message;
    } finally {
        generateBtn.disabled = false;
    }
}

function displayQuiz() {
    quiz.innerHTML = "";

    questions.forEach((q, index) => {
        const card = document.createElement("div");
        card.className = "question-card";

        const heading = document.createElement("h3");
        heading.textContent = `Question ${index + 1}`;

        const questionText = document.createElement("p");
        questionText.textContent = q.question;

        card.append(heading, questionText);

        ["A", "B", "C", "D"].forEach(letter => {
            const label = document.createElement("label");
            label.className = "option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `question-${index}`;
            radio.value = letter;

            const optionText = document.createTextNode(
                ` ${letter}. ${q.options[letter]}`
            );

            label.append(radio, optionText);
            card.appendChild(label);
        });

        quiz.appendChild(card);
    });

    const submitBtn = document.createElement("button");
    submitBtn.id = "submitBtn";
    submitBtn.textContent = "Submit All Answers";
    submitBtn.addEventListener("click", checkAnswers);

    quiz.appendChild(submitBtn);
}

function checkAnswers() {
    const selectedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
        const selected = document.querySelector(
            `input[name="question-${i}"]:checked`
        );

        if (!selected) {
            status.textContent =
                "Please answer all five questions before submitting.";
            return;
        }

        selectedAnswers.push(selected.value);
    }

    let score = 0;

    questions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
            score++;
        }
    });

    displayResults(selectedAnswers, score);
}

function displayResults(selectedAnswers, score) {
    quiz.innerHTML = "";

    status.textContent = "Quiz completed!";

    const percentageValue = score * 20;

    let emoji;
    let message;

    if (score === 5) {
        emoji = "\u{1F389}";
        message = "Outstanding! Perfect score! You have mastered this topic!";
    } else if (score === 4) {
        emoji = "\u{1F389}";
        message = "Excellent work! You are doing really well!";
    } else if (score === 3) {
        emoji = "\u{1F44F}";
        message = "Great job! Keep practising and you will improve even more!";
    } else if (score === 2) {
        emoji = "\u{1F5FA}";
        message = "Good effort! Review the explanations and try again!";
    } else if (score === 1) {
        emoji = "\u{1F331}";
        message = "Keep learning! Every attempt helps you improve!";
    } else {
        emoji = "\u{1F4DA}";
        message = "Don't give up! Review the topic and give it another try!";
    }

    const finalResult = document.createElement("div");
    finalResult.className = "final-result";

    const completion = document.createElement("h2");
    completion.textContent = `\u{1F389} Quiz Completed! \u{1F389}`;

    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "final-score";
    scoreDisplay.textContent = `${score}/5`;

    const percentage = document.createElement("div");
    percentage.className = "final-percentage";
    percentage.textContent = `${percentageValue}%`;

    const messageDisplay = document.createElement("p");
    messageDisplay.className = "final-message";
    messageDisplay.textContent = message;

    finalResult.append(
        completion,
        scoreDisplay,
        percentage,
        messageDisplay
    );

    quiz.appendChild(finalResult);

    const reviewHeading = document.createElement("h2");
    reviewHeading.textContent = "Answer Review";
    reviewHeading.style.color = "#21633c";

    quiz.appendChild(reviewHeading);

    questions.forEach((q, index) => {
        const isCorrect =
            selectedAnswers[index] === q.correctAnswer;

        const card = document.createElement("div");
        card.className = "result-card";

        const heading = document.createElement("h3");
        heading.textContent = `Question ${index + 1}`;

        const questionText = document.createElement("p");
        questionText.textContent = q.question;

        const yourAnswer = document.createElement("p");
        yourAnswer.textContent =
            `Your answer: ${selectedAnswers[index]}. ${q.options[selectedAnswers[index]]}`;

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent =
            `Correct answer: ${q.correctAnswer}. ${q.options[q.correctAnswer]}`;

        const result = document.createElement("div");
        result.className = isCorrect
            ? "result-status correct-status"
            : "result-status incorrect-status";

        result.textContent = isCorrect
            ? "\u2713 CORRECT!"
            : "\u2717 INCORRECT!";

        const explanationTitle = document.createElement("div");
        explanationTitle.className = "explanation-title";
        explanationTitle.textContent = "Explanation";

        const explanationText = document.createElement("p");
        explanationText.className = "explanation-text";
        explanationText.textContent = q.explanation;

        card.append(
            heading,
            questionText,
            yourAnswer,
            correctAnswer,
            result,
            explanationTitle,
            explanationText
        );

        quiz.appendChild(card);
    });

    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Generate Another Quiz";
    retryBtn.addEventListener("click", generateQuiz);

    quiz.appendChild(retryBtn);
}
