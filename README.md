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

#### Environment Variables
- `PORT`: Set custom port (default: 3000)
- `MAX_PORT_ATTEMPTS`: Maximum number of alternative ports to try if default is in use (default: 10)

Example with custom port:
```bash
PORT=8080 docker-compose up
```

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

#### Download from Releases
Download pre-built executables from the [latest release](https://github.com/dglewis/knowitall/releases/latest).

#### Build Locally
1. Install pkg globally:
   ```bash
   npm install -g pkg
   ```

2. Build executables:
   ```bash
   npm run build
   ```
   This creates executables in the `dist/` directory:
   - Windows: `knowitall-win.exe`
   - macOS: `knowitall-macos`
   - Linux: `knowitall-linux`

3. Make the file executable (macOS/Linux only):
   ```bash
   chmod +x dist/knowitall-macos  # or knowitall-linux
   ```

4. Run the executable for your platform:
   ```bash
   # macOS
   ./dist/knowitall-macos

   # Linux
   ./dist/knowitall-linux

   # Windows
   ./dist/knowitall-win.exe
   ```

5. Open browser to http://localhost:3000

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

### Setup
```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start with custom port
PORT=8080 npm start

# Start with custom port range attempts
PORT=8080 MAX_PORT_ATTEMPTS=5 npm start
```

### Port Configuration
The application will automatically:
- Try to use the specified port (default: 3000)
- If the port is in use, it will try subsequent ports up to MAX_PORT_ATTEMPTS
- Display the actual port being used in the console output

### Building Distributions

```bash
# Build executables for all platforms
npm run build

# Create ZIP distribution package
npm run dist
```

Build outputs will be in the `dist/` directory:
- Executables: `knowitall-win.exe`, `knowitall-macos`, `knowitall-linux`
- ZIP package: `knowitall.zip`

Note: Built distributions are not committed to source control. Download official releases from the [releases page](https://github.com/dglewis/knowitall/releases).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.

## Author

- Dan Lewis

### Building & Testing Executables

1. Build all executables:
   ```bash
   npm install -g pkg
   npm run build
   ```

2. Test on macOS:
   ```bash
   # Direct execution
   chmod +x dist/knowitall-macos
   ./dist/knowitall-macos

   # Or via Docker
   docker run --rm -it -v $(pwd)/dist:/app -p 3000:3000 ubuntu:latest bash
   cd /app
   chmod +x knowitall-macos
   ./knowitall-macos
   ```

3. Test on Linux:
   ```bash
   # Via Docker
   docker run --rm -it -v $(pwd)/dist:/app -p 3000:3000 ubuntu:latest bash
   cd /app
   chmod +x knowitall-linux
   ./knowitall-linux
   ```

4. Test on Windows:
   ```bash
   # Direct execution
   dist\knowitall-win.exe

   # Via Ubuntu Docker (works on all platforms)
   docker run --rm -it -v $(pwd)/dist:/app -p 3000:3000 ubuntu:latest bash
   cd /app
   chmod +x knowitall-linux  # Use Linux executable in Ubuntu container
   ./knowitall-linux

   # Via Windows Docker (Windows only)
   docker run --rm -it -v ${PWD}/dist:C:/app -p 3000:3000 mcr.microsoft.com/windows/servercore:ltsc2019
   cd C:\app
   knowitall-win.exe
   ```

Note:
- To stop any container: Use Ctrl+C to stop the application, then type `exit`
- The Ubuntu Docker method works on all platforms (Windows, macOS, Linux)
- Windows containers only work on Windows with Docker Desktop configured for Windows containers

## Developer Guide

### Development Workflow

1. **Setup Development Environment**
   ```bash
   # Clone repository
   git clone https://github.com/dglewis/knowitall.git
   cd knowitall

   # Install dependencies
   npm install

   # Start development server with auto-reload
   npm run dev
   ```

2. **Project Structure**
   ```
   knowitall/
   ├── public/          # Static assets and client-side JS
   ├── views/           # HTML templates
   ├── questions/       # Question bank JSON files
   ├── dist/           # Build outputs (not in source control)
   └── index.js        # Main server application
   ```

3. **Working with Question Banks**
   - Question banks are JSON files in the `questions/` directory
   - Follow the schema in `questions/ping-aic.json` for new banks
   - Supported question types:
     - radio (single choice)
     - checkbox (multiple choice)
     - text (free text input)
     - ordering (drag-and-drop sequence)

4. **Testing Changes**
   ```bash
   # Test with auto-reload
   npm run dev

   # Test Docker build
   docker-compose up --build

   # Test executables
   npm run build
   ./dist/knowitall-macos  # or appropriate platform executable
   ```

5. **Distribution**
   - Update version in package.json
   - Build all distributions: `npm run build && npm run dist`
   - Test all distribution methods before release
   - Create GitHub release with built executables

### Common Development Tasks

- **Adding a Question Bank**
  1. Create new JSON file in `questions/`
  2. Follow schema structure from existing banks
  3. Test with both development server and Docker

- **Modifying UI**
  1. Edit files in `views/` and `public/`
  2. Use development server for quick feedback
  3. Test across different screen sizes

- **Backend Changes**
  1. Modify `index.js` for server changes
  2. Test with both `npm run dev` and Docker
  3. Verify all question types still work

### Best Practices
- Keep question banks in version control
- Test all distribution methods before PR
- Follow existing code style
- Update documentation for new features

### Testing Distribution Methods

Before releasing, verify all distribution methods:

1. **Docker Distribution**
   ```bash
   # Clean test
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

2. **Executable Distribution**
   ```bash
   # Clean and rebuild
   rm -rf dist/
   npm run build

   # Test each platform
   ./dist/knowitall-macos  # macOS
   ./dist/knowitall-linux  # Linux
   ./dist/knowitall-win.exe  # Windows
   ```

3. **ZIP Distribution**
   ```bash
   # Clean start
   rm -rf dist/ test-dist/

   # Install dependencies and create distribution
   npm install
   npm run dist

   # Test in new directory
   mkdir test-dist
   cd test-dist
   unzip ../dist/knowitall.zip
   npm install
   npm start
   ```

Note: Always run `npm run dist` from the project root directory where package.json is located.

4. **Manual Installation**
   ```bash
   # Fresh clone and install
   git clone <repository-url> test-install
   cd test-install
   npm install
   npm start
   ```

Verify for each method:
- Application starts successfully
- Question banks are accessible
- All question types work
- UI elements render correctly
