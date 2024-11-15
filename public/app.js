let questions = [];
let currentQuestionIndex = 0;
let currentQuestionAnswered = false;
let flaggedQuestions = new Set();
let questionAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
    // Add menu button handler first
    document.getElementById('menu-btn').addEventListener('click', () => {
        window.location.href = '/';
    });

    const urlParams = new URLSearchParams(window.location.search);
    const bank = urlParams.get('bank');
    if (bank) {
        fetchQuestions(bank);
    }

    // Event Listeners
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('submit-btn').addEventListener('click', handleSubmit);
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

function handleSubmit() {
    const optionsElement = document.getElementById('options');
    let selectedAnswer;
    const currentQuestion = questions[currentQuestionIndex];

    switch(currentQuestion.type) {
        case 'radio':
            const selectedRadio = optionsElement.querySelector('input[type="radio"]:checked');
            selectedAnswer = selectedRadio ? selectedRadio.value : null;
            break;
        case 'checkbox':
            const selectedBoxes = optionsElement.querySelectorAll('input[type="checkbox"]:checked');
            selectedAnswer = Array.from(selectedBoxes).map(box => box.value);
            break;
        case 'text':
            const textInput = optionsElement.querySelector('input[type="text"]');
            selectedAnswer = textInput ? textInput.value.trim() : null;
            break;
        case 'ordering':
            const orderedItems = optionsElement.querySelectorAll('.ordering-item');
            selectedAnswer = Array.from(orderedItems).map(item =>
                parseInt(item.dataset.index) + 1
            );
            break;
    }

    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
        document.getElementById('feedback').textContent = 'Please provide an answer';
        return;
    }

    const correctAnswer = currentQuestion.answer;
    const isCorrect = validateAnswer(selectedAnswer, correctAnswer, currentQuestion.type);

    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = isCorrect ? 'Correct!' : 'Incorrect. Try again!';
    feedbackElement.style.color = isCorrect ? '#4CAF50' : '#f44336';

    if (isCorrect) {
        questionAnswers[currentQuestionIndex] = selectedAnswer;
        const nextBtn = document.getElementById('next-btn');
        nextBtn.classList.add('next-highlight');

        // Create confetti after fuse effect
        setTimeout(() => {
            createConfetti(nextBtn);
        }, 1000);

        // Clean up animations when navigating away
        nextBtn.addEventListener('click', () => {
            nextBtn.classList.remove('next-highlight');
            const confettiContainer = nextBtn.querySelector('.confetti-container');
            if (confettiContainer) {
                confettiContainer.remove();
            }
        }, { once: true });
    }
    currentQuestionAnswered = isCorrect;
    updateNavigationState();
}

function fetchQuestions(bank) {
    // Show loading state
    document.getElementById('question').textContent = 'Loading questions...';
    document.getElementById('options').innerHTML = '';

    fetch(`/questions/${bank}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch questions');
            return response.json();
        })
        .then(data => {
            // Shuffle the questions array before assigning
            questions = shuffleQuestions(data.questions);
            questionAnswers = new Array(questions.length).fill(null);
            currentQuestionIndex = 0;
            currentQuestionAnswered = false;
            displayQuestion(questions[currentQuestionIndex]);
            updateNavigationState();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('question').textContent = 'Error loading questions';
            document.getElementById('options').innerHTML = '<div class="error">Please try refreshing the page</div>';
        });
}

function displayQuestion(question) {
    // Update progress
    document.getElementById('progress').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('question').textContent = question.question;
    document.getElementById('feedback').textContent = '';
    document.getElementById('flag-checkbox').checked = flaggedQuestions.has(currentQuestionIndex);

    const optionsElement = document.getElementById('options');
    optionsElement.innerHTML = '';

    const savedAnswer = questionAnswers[currentQuestionIndex];
    currentQuestionAnswered = savedAnswer !== null;

    switch(question.type) {
        case 'radio':
            question.options.forEach((option, index) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'answer';
                input.value = option;
                input.addEventListener('change', updateNavigationState);
                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                optionsElement.appendChild(label);
            });
            break;

        case 'checkbox':
            question.options.forEach((option, index) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = option;
                input.addEventListener('change', updateNavigationState);
                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                optionsElement.appendChild(label);
            });
            break;

        case 'text':
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'text-input';
            input.addEventListener('input', updateNavigationState);
            optionsElement.appendChild(input);
            break;

        case 'ordering':
            // Clear existing content
            optionsElement.innerHTML = '';

            // Shuffle options while ensuring it's not in the correct order
            const shuffledOptions = shuffleArrayAvoidingOrder(question.options, question.answer);

            // Add drag-and-drop handler
            optionsElement.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingItem = optionsElement.querySelector('.dragging');
                if (!draggingItem) return;

                const siblings = [...optionsElement.querySelectorAll('.ordering-item:not(.dragging)')];
                const nextSibling = siblings.find(sibling => {
                    const box = sibling.getBoundingClientRect();
                    const offset = e.clientY - box.top - box.height / 2;
                    return offset < 0;
                });

                if (nextSibling) {
                    optionsElement.insertBefore(draggingItem, nextSibling);
                } else {
                    optionsElement.appendChild(draggingItem);
                }
            });

            // Create and append the ordering items
            shuffledOptions.forEach((option) => {
                const div = document.createElement('div');
                div.className = 'ordering-item';
                div.draggable = true;
                div.dataset.index = question.options.indexOf(option).toString();
                div.textContent = option;

                div.addEventListener('dragstart', () => {
                    div.classList.add('dragging');
                });

                div.addEventListener('dragend', () => {
                    div.classList.remove('dragging');
                    updateNavigationState();
                });

                optionsElement.appendChild(div);
            });
            break;
    }

    // After creating all the options, restore saved answer if it exists
    if (savedAnswer) {
        switch(question.type) {
            case 'radio':
                const radio = optionsElement.querySelector(`input[value="${savedAnswer}"]`);
                if (radio) radio.checked = true;
                break;
            case 'checkbox':
                savedAnswer.forEach(value => {
                    const checkbox = optionsElement.querySelector(`input[value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
                break;
            case 'text':
                const textInput = optionsElement.querySelector('input[type="text"]');
                if (textInput) textInput.value = savedAnswer;
                break;
            case 'ordering':
                // Reorder items to match saved answer
                const items = Array.from(optionsElement.querySelectorAll('.ordering-item'));
                const orderedItems = savedAnswer.map(index =>
                    items.find(item => parseInt(item.dataset.index) + 1 === index)
                );
                orderedItems.forEach(item => {
                    if (item) optionsElement.appendChild(item);
                });
                break;
        }
    }

    updateNavigationState();
}

function updateProgress() {
    const progressElement = document.getElementById('progress');
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('review-btn').textContent = `Review Flagged (${flaggedQuestions.size})`;
}

function updateFlaggedCount() {
    document.getElementById('review-btn').textContent = `Review Flagged (${flaggedQuestions.size})`;
}

function showNextQuestion() {
    if (currentQuestionIndex >= questions.length - 1) {
        showCompletionScreen();
        return;
    }

    const nextBtn = document.getElementById('next-btn');

    // Clean up animations first
    nextBtn.classList.remove('next-highlight');
    const confettiContainer = nextBtn.querySelector('.confetti-container');
    if (confettiContainer) {
        confettiContainer.remove();
    }

    if (!currentQuestionAnswered) {
        if (nextBtn.dataset.skipState === 'confirm') {
            // User confirmed skip
            flaggedQuestions.add(currentQuestionIndex);
            updateFlaggedCount();
            currentQuestionIndex++;
            displayQuestion(questions[currentQuestionIndex]);
            nextBtn.dataset.skipState = '';
            nextBtn.textContent = 'Next';  // Reset button text
        } else {
            // First click - show confirmation
            nextBtn.dataset.skipState = 'confirm';
            updateNavigationState();

            // Reset after 3 seconds if not clicked
            setTimeout(() => {
                if (nextBtn.dataset.skipState === 'confirm') {
                    nextBtn.dataset.skipState = '';
                    nextBtn.textContent = 'Next';  // Reset button text
                    updateNavigationState();
                }
            }, 3000);
        }
    } else {
        // Question is answered correctly, proceed normally
        currentQuestionIndex++;
        displayQuestion(questions[currentQuestionIndex]);
        nextBtn.dataset.skipState = ''; // Reset skip state
        nextBtn.textContent = 'Next';  // Reset button text
    }
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(questions[currentQuestionIndex]);
    }
}

function updateNavigationState() {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    prevBtn.disabled = currentQuestionIndex <= 0;

    // Change next button text on final question
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = 'Complete Quiz';
    } else {
        nextBtn.textContent = nextBtn.dataset.skipState === 'confirm' ? 'Skip?' : 'Next';
    }

    const currentQuestion = questions[currentQuestionIndex];
    const optionsElement = document.getElementById('options');
    let hasValidSelection = false;

    // Validate selection based on question type
    switch(currentQuestion.type) {
        case 'radio':
            hasValidSelection = optionsElement.querySelector('input[type="radio"]:checked') !== null;
            break;
        case 'checkbox':
            const checkedBoxes = optionsElement.querySelectorAll('input[type="checkbox"]:checked');
            hasValidSelection = checkedBoxes.length > 0 && checkedBoxes.length <= currentQuestion.answer.length;
            break;
        case 'text':
            const textInput = optionsElement.querySelector('input[type="text"]');
            hasValidSelection = textInput && textInput.value.trim() !== '';
            break;
        case 'ordering':
            const orderedItems = optionsElement.querySelectorAll('.ordering-item');
            hasValidSelection = orderedItems.length === currentQuestion.options.length;
            break;
    }

    if (!currentQuestionAnswered && hasValidSelection) {
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
    } else if (currentQuestionAnswered) {
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        // Only disable next button if we're on last question AND it's not answered
        nextBtn.disabled = currentQuestionIndex >= questions.length - 1 && !currentQuestionAnswered;
        nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Complete Quiz' : 'Next';
        nextBtn.dataset.skipState = '';
    } else {
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        nextBtn.textContent = nextBtn.dataset.skipState === 'confirm' ? 'Skip?' : 'Next';
    }
}

function validateAnswer(selected, correct, type) {
    switch(type) {
        case 'radio':
        case 'text':
            return selected === correct;
        case 'checkbox':
            return JSON.stringify(selected.sort()) === JSON.stringify(correct.sort());
        case 'ordering':
            // For ordering questions, we need to compare the actual order of items
            // with the correct order, using 1-based indexing
            return JSON.stringify(selected) === JSON.stringify(correct);
        default:
            return false;
    }
}

function createConfetti(button) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    button.appendChild(container);

    // Create 20 confetti particles
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random position within button
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';

        // Random colors
        confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;

        // Random animation delay
        confetti.style.animation = `confetti 0.5s ease-out ${Math.random() * 0.5}s forwards`;

        container.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => {
        container.remove();
        button.classList.remove('next-highlight');
    }, 2500);
}

function shuffleArrayAvoidingOrder(array, correctOrder) {
    let attempts = 0;
    const maxAttempts = 100;
    let shuffled = [...array];
    let isCorrectOrder;

    do {
        // Shuffle the array
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        attempts++;

        // Check if current shuffle matches correct order
        const currentOrder = shuffled.map((_, index) => index + 1);
        isCorrectOrder = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);

        // Break if we've tried too many times
        if (attempts >= maxAttempts) break;
    } while (isCorrectOrder);

    return shuffled;
}

function shuffleQuestions(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showCompletionScreen() {
    const completionScreen = document.getElementById('completion-screen');
    const container = document.querySelector('.container');

    // Calculate final score
    const answeredQuestions = questionAnswers.filter(answer => answer !== null).length;
    const score = Math.round((answeredQuestions / questions.length) * 100);

    // Update completion screen stats
    document.getElementById('final-score').textContent = `${score}%`;
    document.getElementById('questions-answered').textContent =
        `${answeredQuestions}/${questions.length}`;
    document.getElementById('final-flagged-count').textContent =
        flaggedQuestions.size.toString();

    // Show completion screen
    completionScreen.classList.add('visible');
    container.style.filter = 'blur(4px)';

    // Add event listeners for completion actions
    document.getElementById('review-flagged-btn').addEventListener('click', () => {
        completionScreen.classList.remove('visible');
        container.style.filter = '';
        showFlaggedScreen();
    });

    document.getElementById('finish-quiz-btn').addEventListener('click', () => {
        window.location.href = '/';
    });
}

function showFlaggedScreen() {
    const flaggedScreen = document.getElementById('flagged-screen');
    const container = document.querySelector('.container');
    const flaggedList = document.getElementById('flagged-list');

    // Clear previous entries
    flaggedList.innerHTML = '';

    // Add each flagged question to the list
    flaggedQuestions.forEach(index => {
        const li = document.createElement('li');
        li.textContent = `Question ${index + 1}: ${questions[index].question}`;
        li.addEventListener('click', () => {
            currentQuestionIndex = index;
            displayQuestion(questions[currentQuestionIndex]);
            backToQuiz();
        });
        flaggedList.appendChild(li);
    });

    flaggedScreen.classList.add('visible');
    container.style.filter = 'blur(4px)';
}

function backToQuiz() {
    const flaggedScreen = document.getElementById('flagged-screen');
    const container = document.querySelector('.container');
    flaggedScreen.classList.remove('visible');
    container.style.filter = '';
}
