const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main menu
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'menu.html'));
});

// Serve the quiz page
app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve questions based on selected bank
app.get('/questions/:bank', (req, res) => {
    const bank = req.params.bank;
    const filePath = path.join(__dirname, 'questions', bank);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('Question bank not found');
        }
        res.json(JSON.parse(data));
    });
});

// Serve available question banks
app.get('/question-banks', (req, res) => {
    const questionsDir = path.join(__dirname, 'questions');
    fs.readdir(questionsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading question banks');
        }
        const questionBanks = files.filter(file => file.endsWith('.json'));
        res.json(questionBanks);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
