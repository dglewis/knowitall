let questions = [];
let currentQuestionIndex = 0;
let flaggedQuestions = [];
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('flag-btn').addEventListener('click', flagCurrentQuestion);
    document.getElementById('review-btn').addEventListener('click', reviewFlaggedQuestions);
});

function fetchQuestions() {
    fetch('/questions')
        .then(response => response.json())
        .then(data => {
            questions = data;
            displayQuestion(questions[currentQuestionIndex]);
            updateProgress();
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

    if (question.type === 'radio') {
        question.options.forEach(option => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'option';
            input.value = option;
            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            optionsElement.appendChild(label);
        });
    }
}

function checkAnswer() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    const feedbackElement = document.getElementById('feedback');
    if (selectedOption && selectedOption.value === questions[currentQuestionIndex].answer) {
        score++;
        feedbackElement.textContent = 'Correct!';
    } else {
        feedbackElement.textContent = 'Try again!';
    }
}

function updateProgress() {
    const progressElement = document.getElementById('progress');
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function showNextQuestion() {
    checkAnswer();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questions[currentQuestionIndex]);
        updateProgress();
    } else {
        document.getElementById('feedback').textContent = `Final Score: ${score}`;
        document.getElementById('score').style.display = 'none'; // Hide score during quiz
    }
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(questions[currentQuestionIndex]);
        updateProgress();
    } else {
        document.getElementById('feedback').textContent = 'This is the first question!';
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

function reviewFlaggedQuestions() {
    if (flaggedQuestions.length > 0) {
        currentQuestionIndex = questions.indexOf(flaggedQuestions[0]);
        displayQuestion(questions[currentQuestionIndex]);
        flaggedQuestions.shift(); // Remove the reviewed question from the list
        updateProgress();
    } else {
        document.getElementById('feedback').textContent = 'No flagged questions to review.';
    }
}
