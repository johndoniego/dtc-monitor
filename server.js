const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database files if they don't exist
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const CHECKINS_FILE = path.join(DATA_DIR, 'checkins.json');

if (!fs.existsSync(REGISTRATIONS_FILE)) {
    fs.writeFileSync(REGISTRATIONS_FILE, '[]', 'utf8');
}
if (!fs.existsSync(CHECKINS_FILE)) {
    fs.writeFileSync(CHECKINS_FILE, '[]', 'utf8');
}

// MIME types for serving static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Read JSON file
function readDatabase(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${file}:`, error);
        return [];
    }
}

// Write JSON file
function writeDatabase(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${file}:`, error);
        return false;
    }
}

// Parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // API Routes
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');

        try {
            // GET registrations
            if (pathname === '/api/registrations' && req.method === 'GET') {
                const data = readDatabase(REGISTRATIONS_FILE);
                res.writeHead(200);
                res.end(JSON.stringify(data));
                return;
            }

            // POST registration
            if (pathname === '/api/registrations' && req.method === 'POST') {
                const body = await parseBody(req);
                const registrations = readDatabase(REGISTRATIONS_FILE);
                
                // Check for duplicate email
                const emailExists = registrations.some(r => 
                    r.email && r.email.toLowerCase() === body.email.toLowerCase()
                );
                
                if (emailExists) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Email already exists', code: 'DUPLICATE_EMAIL' }));
                    return;
                }
                
                // Add registration number
                const maxRegNum = registrations.length > 0 
                    ? Math.max(...registrations.map(r => r.registration_number || 0)) 
                    : 0;
                body.registration_number = maxRegNum + 1;
                
                // Generate user ID
                let maxIdNum = 0;
                registrations.forEach(r => {
                    if (r.user_id) {
                        const numPart = r.user_id.split('-')[1];
                        if (numPart) {
                            const numVal = parseInt(numPart, 36);
                            if (numVal > maxIdNum) maxIdNum = numVal;
                        }
                    }
                });
                body.user_id = 'DT-' + (maxIdNum + 1).toString(36).toUpperCase().padStart(5, '0');
                body.registered_at = new Date().toISOString();
                
                registrations.push(body);
                
                if (writeDatabase(REGISTRATIONS_FILE, registrations)) {
                    res.writeHead(201);
                    res.end(JSON.stringify({ success: true, data: body }));
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to save registration' }));
                }
                return;
            }

            // GET checkins
            if (pathname === '/api/checkins' && req.method === 'GET') {
                const data = readDatabase(CHECKINS_FILE);
                res.writeHead(200);
                res.end(JSON.stringify(data));
                return;
            }

            // POST checkin
            if (pathname === '/api/checkins' && req.method === 'POST') {
                const body = await parseBody(req);
                const registrations = readDatabase(REGISTRATIONS_FILE);
                const checkins = readDatabase(CHECKINS_FILE);
                
                // Verify user ID exists
                const userExists = registrations.some(r => 
                    r.user_id && r.user_id.toUpperCase() === body.user_id.toUpperCase()
                );
                
                if (!userExists) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'User ID not found', code: 'USER_NOT_FOUND' }));
                    return;
                }
                
                body.checkin_at = new Date().toISOString();
                checkins.push(body);
                
                if (writeDatabase(CHECKINS_FILE, checkins)) {
                    res.writeHead(201);
                    res.end(JSON.stringify({ success: true, data: body }));
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to save check-in' }));
                }
                return;
            }

            // Check if email exists
            if (pathname === '/api/check-email' && req.method === 'POST') {
                const body = await parseBody(req);
                const registrations = readDatabase(REGISTRATIONS_FILE);
                const exists = registrations.some(r => 
                    r.email && r.email.toLowerCase() === body.email.toLowerCase()
                );
                res.writeHead(200);
                res.end(JSON.stringify({ exists }));
                return;
            }

            // Check if user ID exists
            if (pathname === '/api/check-userid' && req.method === 'POST') {
                const body = await parseBody(req);
                const registrations = readDatabase(REGISTRATIONS_FILE);
                const user = registrations.find(r => 
                    r.user_id && r.user_id.toUpperCase() === body.user_id.toUpperCase()
                );
                res.writeHead(200);
                res.end(JSON.stringify({ exists: !!user, user: user || null }));
                return;
            }

            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
            return;

        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
            return;
        }
    }

    // Serve static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   DTC Tuguegarao Attendance System Server                  ║');
    console.log('║                                                            ║');
    console.log(`║   Server running at: http://localhost:${PORT}                 ║`);
    console.log('║                                                            ║');
    console.log('║   Main Form:    http://localhost:3000                      ║');
    console.log('║   Admin Panel:  http://localhost:3000/admin.html           ║');
    console.log('║                                                            ║');
    console.log('║   Database files saved in: ./data/                         ║');
    console.log('║   - registrations.json                                     ║');
    console.log('║   - checkins.json                                          ║');
    console.log('║                                                            ║');
    console.log('║   Press Ctrl+C to stop the server                          ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
});
