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

    questionElement.textContent = question.question;
    optionsElement.innerHTML = ''; // Clear previous options

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, question.answer);
        optionsElement.appendChild(button);
    });
}

function checkAnswer(selectedOption, correctAnswer) {
    if (selectedOption === correctAnswer) {
        score++;
        alert('Correct!');
    } else {
        alert('Try again!');
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
    if (!flaggedQuestions.includes(currentQuestion)) {
        flaggedQuestions.push(currentQuestion);
        alert('Question flagged for review.');
    } else {
        alert('This question is already flagged.');
    }
}
