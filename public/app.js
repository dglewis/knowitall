let questions = [];
let currentQuestionIndex = 0;
let flaggedQuestions = [];
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    document.getElementById('flag-btn').addEventListener('click', flagCurrentQuestion);
});

function fetchQuestions() {
    fetch('/questions')
        .then(response => response.json())
        .then(data => {
            questions = data;
            displayQuestion(questions[currentQuestionIndex]);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });
}

function displayQuestion(question) {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const feedbackElement = document.getElementById('feedback');

    questionElement.textContent = question.question;
    optionsElement.innerHTML = ''; // Clear previous options
    feedbackElement.textContent = ''; // Clear previous feedback

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, question.answer);
        optionsElement.appendChild(button);
    });
}

function checkAnswer(selectedOption, correctAnswer) {
    const feedbackElement = document.getElementById('feedback');
    if (selectedOption === correctAnswer) {
        score++;
        feedbackElement.textContent = 'Correct!';
    } else {
        feedbackElement.textContent = 'Try again!';
    }
    updateScore();
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;
}

function showNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        alert('You have reached the end of the quiz!');
    }
}

function flagCurrentQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const feedbackElement = document.getElementById('feedback');
    if (!flaggedQuestions.includes(currentQuestion)) {
        flaggedQuestions.push(currentQuestion);
        feedbackElement.textContent = 'Question flagged for review.';
    } else {
        feedbackElement.textContent = 'This question is already flagged.';
    }
}
