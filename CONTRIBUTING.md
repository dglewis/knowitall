## Distribution Testing Checklist

### Docker
- [ ] `docker-compose up` works
- [ ] Application accessible at http://localhost:3000
- [ ] Question banks loadable via volume mount

### Executables
MacOS:
- [ ] `chmod +x dist/knowitall-macos`
- [ ] `./dist/knowitall-macos` runs
- [ ] Application accessible at http://localhost:3000

Windows (via Docker):
- [ ] Windows container can run knowitall-win.exe
- [ ] Application accessible at http://localhost:3000

Linux (via Docker):
- [ ] Linux container can run knowitall-linux
- [ ] Application accessible at http://localhost:3000

### ZIP Distribution
- [ ] ZIP contains all required files
- [ ] Can be extracted and run via npm install
- [ ] Application works after installation
