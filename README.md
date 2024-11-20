# KnowItAll Quiz

KnowItAll Quiz is a simple quiz engine built with Node.js and Express. It serves a set of questions and allows users to navigate through them, flag questions for review, and keep track of their score.

## Features

- Serve static files and HTML pages
- Fetch and display quiz questions
- Navigate through questions
- Flag questions for review
- Track user score

## Installation

### Option 1: Docker (Recommended)

1. Install Docker and Docker Compose
2. Clone or download this repository
3. Open terminal in project directory
4. Run:
   ```bash
   docker-compose up
   ```
5. Open browser to http://localhost:3000

#### Docker Operations Cheat Sheet
```bash
# Start the application
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker logs knowitall_quiz_1

# Access container shell
docker exec -it knowitall_quiz_1 bash

# Stop application
docker-compose down

# Rebuild after changes
docker-compose up --build
```

### Option 2: Standalone Executable

1. Download the appropriate executable for your system:
   - Windows: knowitall-win.exe
   - macOS: knowitall-macos
   - Linux: knowitall-linux
2. Double-click to run
3. Open browser to http://localhost:3000

### Option 3: Manual Installation

1. Install Node.js 18 or later
2. Clone or download this repository
3. Open terminal in project directory
4. Run:
   ```bash
   npm install
   npm start
   ```
5. Open browser to http://localhost:3000

## Development

- To automatically restart the server on file changes, use:

  ```bash
  npm run dev
  ```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.

## Author

- Dan Lewis
