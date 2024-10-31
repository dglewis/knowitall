let questions = [];
let currentQuestionIndex = 0;
let flaggedQuestions = [];
let score = 0;
let answered = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('submit-btn').addEventListener('click', submitAnswer);
    document.getElementById('flag-btn').addEventListener('click', flagCurrentQuestion);
    document.getElementById('review-btn').addEventListener('click', showFlaggedScreen);
    document.getElementById('back-btn').addEventListener('click', backToQuiz);
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
    answered = false; // Reset answered state

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

function submitAnswer() {
    if (!answered) {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        const feedbackElement = document.getElementById('feedback');
        if (selectedOption && selectedOption.value === questions[currentQuestionIndex].answer) {
            score++;
            feedbackElement.textContent = 'Correct!';
        } else {
            feedbackElement.textContent = 'Try again!';
        }
        answered = true; // Mark as answered
    }
}

function updateProgress() {
    const progressElement = document.getElementById('progress');
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function showNextQuestion() {
    if (answered) {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(questions[currentQuestionIndex]);
            updateProgress();
        } else {
            document.getElementById('feedback').textContent = `Final Score: ${score}`;
            document.getElementById('score').style.display = 'none'; // Hide score during quiz
        }
    } else {
        document.getElementById('feedback').textContent = 'Please submit your answer first!';
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
    console.log('Flagged Questions:', flaggedQuestions);
}

function showFlaggedScreen() {
    console.log('Entering showFlaggedScreen');
    const flaggedScreen = document.getElementById('flagged-screen');
    const flaggedList = document.getElementById('flagged-list');
    flaggedList.innerHTML = ''; // Clear previous list

    if (flaggedQuestions.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No flagged questions.';
        flaggedList.appendChild(listItem);
        console.log('No flagged questions to display.');
    } else {
        flaggedQuestions.forEach((question) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Question ${questions.indexOf(question) + 1}`;
            listItem.onclick = () => {
                console.log(`Reviewing Question ${questions.indexOf(question) + 1}`);
                currentQuestionIndex = questions.indexOf(question);
                displayQuestion(questions[currentQuestionIndex]);
                updateProgress();
                flaggedScreen.classList.add('hidden');
                document.querySelector('.container').classList.remove('hidden');
            };
            flaggedList.appendChild(listItem);
            console.log(`Added Question ${questions.indexOf(question) + 1} to list`);
        });
    }

    flaggedScreen.classList.remove('hidden');
    console.log('Flagged screen displayed');
}

function backToQuiz() {
    document.querySelector('.container').classList.remove('hidden');
    document.getElementById('flagged-screen').classList.add('hidden');
}

function reviewFlaggedQuestions() {
    showFlaggedScreen();
}

function toggleFlagQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const index = flaggedQuestions.indexOf(currentQuestion);
    if (index > -1) {
        flaggedQuestions.splice(index, 1);
        console.log('Question unflagged:', currentQuestion);
    } else {
        flaggedQuestions.push(currentQuestion);
        console.log('Question flagged:', currentQuestion);
    }
    console.log('Updated Flagged Questions:', flaggedQuestions);
}
