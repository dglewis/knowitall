const fs = require('fs');
const archiver = require('archiver');

// Create output directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create archive
const output = fs.createWriteStream('dist/knowitall.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('Distribution package created successfully!');
});

archive.pipe(output);

// Add required files and folders
archive.directory('public/', 'public');
archive.directory('views/', 'views');
archive.directory('questions/', 'questions');
archive.file('index.js', { name: 'index.js' });
archive.file('package.json', { name: 'package.json' });
archive.file('README.md', { name: 'README.md' });

archive.finalize();
