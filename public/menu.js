document.addEventListener('DOMContentLoaded', () => {
    let allBanks = [];
    let selectedBank = null;
    const searchInput = document.getElementById('bank-filter');
    const searchResults = document.getElementById('search-results');
    const startButton = document.getElementById('start-quiz');

    fetchQuestionBanks().then(banks => {
        allBanks = banks;
        searchInput.disabled = false;
        displaySearchResults(banks);
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBanks = allBanks.filter(bank =>
            bank.name.toLowerCase().includes(searchTerm)
        );

        displaySearchResults(filteredBanks);
    });

    searchInput.addEventListener('focus', () => {
        if (allBanks.length > 0) {
            displaySearchResults(allBanks);
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    startButton.addEventListener('click', () => {
        if (selectedBank) {
            window.location.href = `/quiz?bank=${selectedBank.filename}`;
        }
    });

    let selectedIndex = -1;

    searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item');

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    items[selectedIndex].click();
                }
                break;
        }
    });

    function updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
            if (index === selectedIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    // Clean up old event listeners before adding new ones
    const cleanupListeners = () => {
        searchResults.innerHTML = '';
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.replaceWith(item.cloneNode(true));
        });
    };

    function displaySearchResults(banks) {
        cleanupListeners();
        searchResults.style.display = banks.length ? 'block' : 'none';

        banks.forEach(bank => {
            const div = document.createElement('div');
            div.className = 'search-result-item';

            div.innerHTML = `
                <div class="result-name">${bank.name}</div>
                <div class="result-description">${bank.description || ''}</div>
            `;

            div.addEventListener('click', () => {
                selectedBank = bank;
                searchInput.value = bank.name;
                startButton.disabled = false;
                // Don't hide results until after a small delay
                setTimeout(() => {
                    searchResults.style.display = 'none';
                }, 100);
            });

            searchResults.appendChild(div);
        });
    }

    document.querySelectorAll('.options label').forEach(label => {
        label.addEventListener('click', (e) => {
            e.stopPropagation();
            const radio = label.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
});

async function fetchQuestionBanks() {
    const response = await fetch('/question-banks');
    const files = await response.json();

    // Fetch details for each bank
    const banksData = await Promise.all(files.map(async filename => {
        const response = await fetch(`/questions/${filename}`);
        const data = await response.json();
        return {
            filename,
            name: data.name,
            description: `${data.questions.length} questions`,
            data
        };
    }));

    return banksData;
}
