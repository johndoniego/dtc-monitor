const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Directory structure for registrations and checkins
const REGISTRATIONS_DIR = path.join(DATA_DIR, 'registrations');
const REGISTRATIONS_TOTAL_DIR = path.join(REGISTRATIONS_DIR, 'total');
const REGISTRATIONS_DAILY_DIR = path.join(REGISTRATIONS_DIR, 'daily');

const CHECKINS_DIR = path.join(DATA_DIR, 'checkins');
const CHECKINS_TOTAL_DIR = path.join(CHECKINS_DIR, 'total');
const CHECKINS_DAILY_DIR = path.join(CHECKINS_DIR, 'daily');

// Ensure all data directories exist
[DATA_DIR, REGISTRATIONS_DIR, REGISTRATIONS_TOTAL_DIR, REGISTRATIONS_DAILY_DIR,
 CHECKINS_DIR, CHECKINS_TOTAL_DIR, CHECKINS_DAILY_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Get today's date string for daily files
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Initialize database files if they don't exist
const REGISTRATIONS_FILE = path.join(REGISTRATIONS_TOTAL_DIR, 'registrations.json');
const CHECKINS_FILE = path.join(CHECKINS_TOTAL_DIR, 'checkins.json');

// Get daily file paths
function getDailyRegistrationsFile() {
    return path.join(REGISTRATIONS_DAILY_DIR, `registrations_${getTodayDateString()}.json`);
}

function getDailyCheckinsFile() {
    return path.join(CHECKINS_DAILY_DIR, `checkins_${getTodayDateString()}.json`);
}

// Migrate old data files to new structure if they exist
const OLD_REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const OLD_CHECKINS_FILE = path.join(DATA_DIR, 'checkins.json');

if (fs.existsSync(OLD_REGISTRATIONS_FILE) && !fs.existsSync(REGISTRATIONS_FILE)) {
    console.log('Migrating old registrations.json to new folder structure...');
    const oldData = fs.readFileSync(OLD_REGISTRATIONS_FILE, 'utf8');
    fs.writeFileSync(REGISTRATIONS_FILE, oldData, 'utf8');
    fs.renameSync(OLD_REGISTRATIONS_FILE, OLD_REGISTRATIONS_FILE + '.backup');
    console.log('Migration complete. Old file backed up as registrations.json.backup');
}

if (fs.existsSync(OLD_CHECKINS_FILE) && !fs.existsSync(CHECKINS_FILE)) {
    console.log('Migrating old checkins.json to new folder structure...');
    const oldData = fs.readFileSync(OLD_CHECKINS_FILE, 'utf8');
    fs.writeFileSync(CHECKINS_FILE, oldData, 'utf8');
    fs.renameSync(OLD_CHECKINS_FILE, OLD_CHECKINS_FILE + '.backup');
    console.log('Migration complete. Old file backed up as checkins.json.backup');
}

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
                const registrationNumber = maxRegNum + 1;
                
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
                const userId = 'DT-' + (maxIdNum + 1).toString(36).toUpperCase().padStart(5, '0');
                const registeredAt = new Date().toISOString();
                
                // Create record with registration_number as first field
                const newRecord = {
                    registration_number: registrationNumber,
                    user_id: userId,
                    registered_at: registeredAt,
                    ...body
                };
                
                registrations.push(newRecord);
                
                // Save to total file
                const savedToTotal = writeDatabase(REGISTRATIONS_FILE, registrations);
                
                // Save to daily file
                const dailyFile = getDailyRegistrationsFile();
                let dailyRegistrations = [];
                if (fs.existsSync(dailyFile)) {
                    dailyRegistrations = readDatabase(dailyFile);
                }
                dailyRegistrations.push(newRecord);
                writeDatabase(dailyFile, dailyRegistrations);
                
                if (savedToTotal) {
                    res.writeHead(201);
                    res.end(JSON.stringify({ success: true, data: newRecord }));
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
                
                // Verify user ID exists and get registration number
                const userRecord = registrations.find(r => 
                    r.user_id && r.user_id.toUpperCase() === body.user_id.toUpperCase()
                );
                
                if (!userRecord) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'User ID not found', code: 'USER_NOT_FOUND' }));
                    return;
                }
                
                const checkinAt = new Date().toISOString();
                
                // Create record with registration_number as first field
                const newCheckin = {
                    registration_number: userRecord.registration_number,
                    user_id: body.user_id,
                    checkin_at: checkinAt,
                    services: body.services
                };
                
                checkins.push(newCheckin);
                
                // Save to total file
                const savedToTotal = writeDatabase(CHECKINS_FILE, checkins);
                
                // Save to daily file
                const dailyFile = getDailyCheckinsFile();
                let dailyCheckins = [];
                if (fs.existsSync(dailyFile)) {
                    dailyCheckins = readDatabase(dailyFile);
                }
                dailyCheckins.push(newCheckin);
                writeDatabase(dailyFile, dailyCheckins);
                
                if (savedToTotal) {
                    res.writeHead(201);
                    res.end(JSON.stringify({ success: true, data: newCheckin }));
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
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║   DTC Tuguegarao Attendance System Server                      ║');
    console.log('║                                                                ║');
    console.log(`║   Server running at: http://localhost:${PORT}                     ║`);
    console.log('║                                                                ║');
    console.log('║   Main Form:    http://localhost:3000                          ║');
    console.log('║   Admin Panel:  http://localhost:3000/admin.html               ║');
    console.log('║                                                                ║');
    console.log('║   Database files saved in: ./data/                             ║');
    console.log('║   - registrations/total/registrations.json  (all-time)         ║');
    console.log('║   - registrations/daily/registrations_YYYY-MM-DD.json          ║');
    console.log('║   - checkins/total/checkins.json  (all-time)                   ║');
    console.log('║   - checkins/daily/checkins_YYYY-MM-DD.json                    ║');
    console.log('║                                                                ║');
    console.log('║   Press Ctrl+C to stop the server                              ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
});
