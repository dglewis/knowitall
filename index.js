const express = require('express');
const path = require('path');
const fs = require('fs');
const net = require('net');
const app = express();

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PORT_ATTEMPTS = parseInt(process.env.MAX_PORT_ATTEMPTS, 10) || 10;

// Function to check if a port is in use
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + MAX_PORT_ATTEMPTS; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

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
        const questionBanks = files
            .filter(file => file.endsWith('.json'))
            .filter(filename => {
                try {
                    const filePath = path.join(questionsDir, filename);
                    JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    return true;
                } catch {
                    return false;
                }
            });
        res.json(questionBanks);
    });
});

// Start the server with automatic port selection
async function startServer() {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      if (port !== DEFAULT_PORT) {
        console.log(`Note: Default port ${DEFAULT_PORT} was in use, using ${port} instead`);
      }
    }).on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
