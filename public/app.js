let questions = [];
let currentQuestionIndex = 0;
let flaggedQuestions = new Set();
let score = 0;
let answered = false;
let currentQuestionAnswered = false;
let draggedItem = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('submit-btn').addEventListener('click', submitAnswer);
    document.getElementById('flag-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
            flaggedQuestions.add(currentQuestionIndex);
        } else {
            flaggedQuestions.delete(currentQuestionIndex);
        }
        updateFlaggedCount();
    });
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
    const contentDiv = document.querySelector('.question-content');

    // Fade out
    contentDiv.style.opacity = 0;

    setTimeout(() => {
        // Update content
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
        } else if (question.type === 'checkbox') {
            question.options.forEach(option => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = option;
                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                optionsElement.appendChild(label);
            });
        } else if (question.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Your answer here';
            optionsElement.appendChild(input);
        } else if (question.type === 'ordering') {
            const orderList = document.createElement('ul');
            orderList.className = 'order-list';

            question.options.forEach((option, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'order-item';
                listItem.draggable = true;
                listItem.dataset.index = index;

                const handle = document.createElement('div');
                handle.className = 'drag-handle';
                handle.innerHTML = '⋮⋮';

                const text = document.createElement('span');
                text.textContent = option;

                listItem.appendChild(handle);
                listItem.appendChild(text);
                orderList.appendChild(listItem);
            });

            // Add drag and drop event listeners
            orderList.addEventListener('dragstart', handleDragStart);
            orderList.addEventListener('dragover', handleDragOver);
            orderList.addEventListener('drop', handleDrop);

            optionsElement.appendChild(orderList);
        }

        // Update flag checkbox state
        document.getElementById('flag-checkbox').checked =
            flaggedQuestions.has(currentQuestionIndex);

        currentQuestionAnswered = false;
        updateNavigationState();

        // Fade in
        contentDiv.style.opacity = 1;
    }, 300);
}

function submitAnswer() {
    const questionType = questions[currentQuestionIndex].type;
    const optionsElement = document.getElementById('options');
    let isCorrect = false;
    let hasAnswer = false;

    switch (questionType) {
        case 'radio':
            const selectedOption = optionsElement.querySelector('input[type="radio"]:checked');
            if (!selectedOption) {
                showFeedback('Please select an answer');
                return;
            }
            hasAnswer = true;
            isCorrect = selectedOption.value === questions[currentQuestionIndex].answer;
            break;

        case 'checkbox':
            const selectedCheckboxes = optionsElement.querySelectorAll('input[type="checkbox"]:checked');
            if (selectedCheckboxes.length === 0) {
                showFeedback('Please select at least one answer');
                return;
            }
            hasAnswer = true;
            const selectedValues = Array.from(selectedCheckboxes).map(cb => cb.value);
            const correctAnswers = questions[currentQuestionIndex].answer;
            isCorrect =
                selectedValues.length === correctAnswers.length &&
                selectedValues.every(value => correctAnswers.includes(value));
            break;

        case 'text':
            const textInput = optionsElement.querySelector('input[type="text"]');
            if (!textInput || !textInput.value.trim()) {
                showFeedback('Please enter an answer');
                return;
            }
            hasAnswer = true;
            isCorrect = textInput.value.trim().toLowerCase() === questions[currentQuestionIndex].answer.toLowerCase();
            break;

        case 'ordering':
            const orderItems = optionsElement.querySelectorAll('.order-item');
            if (!orderItems.length) {
                showFeedback('Please order the items');
                return;
            }
            hasAnswer = true;
            const userOrder = Array.from(orderItems).map(item => item.dataset.index);
            // Check if the order matches the expected sequence (0,1,2,3,4)
            isCorrect = userOrder.every((item, index) => parseInt(item) === index);

            if (!isCorrect) {
                showFeedback('Incorrect order. Try again!');
                return;
            }
            break;
    }

    if (hasAnswer) {
        if (isCorrect) {
            score++;
            showFeedback('Correct!');
            currentQuestionAnswered = true;
            updateNavigationState();
        } else {
            showFeedback('Incorrect. Try again!');
        }
    }
}

function showFeedback(message) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
}

function updateProgress() {
    const progressElement = document.getElementById('progress');
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function showNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questions[currentQuestionIndex]);
        updateProgress();
    } else {
        document.getElementById('feedback').textContent = `Quiz complete! Final Score: ${score}`;
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
    const flaggedScreen = document.getElementById('flagged-screen');
    const flaggedList = document.getElementById('flagged-list');
    const container = document.querySelector('.container');

    flaggedList.innerHTML = ''; // Clear previous list

    if (flaggedQuestions.size === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No flagged questions.';
        flaggedList.appendChild(listItem);
    } else {
        flaggedQuestions.forEach((questionIndex) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Question ${questionIndex + 1}`;
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                currentQuestionIndex = questionIndex;
                displayQuestion(questions[currentQuestionIndex]);
                updateProgress();
                backToQuiz();
            });
            flaggedList.appendChild(listItem);
        });
    }

    // Prevent clicks on the flagged screen from bubbling up
    flaggedScreen.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    container.classList.add('hidden');
    flaggedScreen.classList.remove('hidden');
}

function backToQuiz() {
    const container = document.querySelector('.container');
    const flaggedScreen = document.getElementById('flagged-screen');

    container.classList.remove('hidden');
    flaggedScreen.classList.add('hidden');
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

function updateNavigationState() {
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');

    if (currentQuestionAnswered) {
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'block';
    } else {
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
    }
}

function handleSubmit() {
    if (!validateAnswer()) {
        showFeedback('Please provide an answer before proceeding');
        return;
    }

    // Your existing submit logic here

    currentQuestionAnswered = true;
    updateNavigationState();
}

function validateAnswer() {
    const questionType = currentQuestion.type;
    const optionsElement = document.getElementById('options');

    switch (questionType) {
        case 'radio':
            return optionsElement.querySelector('input[type="radio"]:checked');
        case 'checkbox':
            return optionsElement.querySelector('input[type="checkbox"]:checked');
        case 'text':
            return optionsElement.querySelector('input[type="text"]').value.trim() !== '';
        case 'ordering':
            const inputs = optionsElement.querySelectorAll('input[type="number"]');
            return Array.from(inputs).every(input => input.value !== '');
        default:
            return false;
    }
}

function updateFlaggedCount() {
    const reviewBtn = document.getElementById('review-btn');
    reviewBtn.textContent = `Review Flagged (${flaggedQuestions.size})`;
}

function handleDragStart(e) {
    draggedItem = e.target;
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
    const target = e.target.closest('.order-item');
    if (target && target !== draggedItem) {
        const container = target.parentNode;
        const items = [...container.children];
        const draggedIndex = items.indexOf(draggedItem);
        const targetIndex = items.indexOf(target);

        if (draggedIndex < targetIndex) {
            target.after(draggedItem);
        } else {
            target.before(draggedItem);
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    draggedItem.style.opacity = '1';
    draggedItem = null;
}
