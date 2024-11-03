document.addEventListener('DOMContentLoaded', () => {
    fetchQuestionBanks();

    document.getElementById('start-quiz').addEventListener('click', () => {
        const selectedBank = document.getElementById('question-bank').value;
        if (!selectedBank) {
            document.getElementById('error-message').textContent = 'Please select a question bank.';
            return;
        }
        window.location.href = `/quiz?bank=${selectedBank}`;
    });
});

function fetchQuestionBanks() {
    fetch('/question-banks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const questionBankSelect = document.getElementById('question-bank');
            questionBankSelect.innerHTML = ''; // Clear existing options
            if (data.length === 0) {
                console.log('No question banks available.');
                return;
            }
            data.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank;
                fetch(`/questions/${bank}`)
                    .then(response => response.json())
                    .then(bankData => {
                        const description = bankData.description || `${bankData.questions.length} questions`;
                        option.textContent = `${bankData.name} (${description})`;
                    });
                questionBankSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching question banks:', error);
        });
}
