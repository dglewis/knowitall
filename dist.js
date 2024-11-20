const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Validate required dependencies
try {
    require('archiver');
} catch (err) {
    console.error('Error: archiver package not found. Run npm install first.');
    process.exit(1);
}

// Create output directory
const distPath = path.join(__dirname, 'dist');
try {
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
    }
} catch (err) {
    console.error('Error creating dist directory:', err.message);
    process.exit(1);
}

// Create archive
const output = fs.createWriteStream('dist/knowitall.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

// Listen for archive errors
archive.on('error', (err) => {
    console.error('Archive error:', err.message);
    process.exit(1);
});

// Listen for warnings
archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
        console.warn('Warning:', err.message);
    } else {
        console.error('Archive warning:', err.message);
        process.exit(1);
    }
});

output.on('close', () => {
    console.log('Distribution package created successfully!');
    console.log('Archive size:', (archive.pointer() / 1024 / 1024).toFixed(2), 'MB');
});

archive.pipe(output);

// Required files and directories to include
const requiredFiles = [
    { path: 'public', type: 'directory' },
    { path: 'views', type: 'directory' },
    { path: 'questions', type: 'directory' },
    { path: 'index.js', type: 'file' },
    { path: 'package.json', type: 'file' },
    { path: 'README.md', type: 'file' }
];

// Validate and add files
for (const item of requiredFiles) {
    try {
        if (!fs.existsSync(item.path)) {
            console.error(`Error: Required ${item.type} not found: ${item.path}`);
            process.exit(1);
        }

        if (item.type === 'directory') {
            archive.directory(item.path + '/', item.path);
        } else {
            archive.file(item.path, { name: item.path });
        }
    } catch (err) {
        console.error(`Error processing ${item.path}:`, err.message);
        process.exit(1);
    }
}

// Finalize the archive
try {
    archive.finalize();
} catch (err) {
    console.error('Error finalizing archive:', err.message);
    process.exit(1);
}
