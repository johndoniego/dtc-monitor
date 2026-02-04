DTC Tuguegarao Attendance System
=================================

REQUIREMENTS:
- Node.js installed on your computer
  (Download from https://nodejs.org if not installed)

HOW TO START:
1. Double-click "start-server.bat" 
   OR
   Open command prompt in this folder and run: node server.js

2. Open your browser and go to:
   - Main Form: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin.html

ADMIN CREDENTIALS:
- Username: admin
- Password: Password123!

DATABASE FILES:
Data is saved in the "data" folder:
- data/registrations.json - All registration records
- data/checkins.json - All check-in records

These files are automatically created and updated.
You can backup these files by copying the "data" folder.

FILES IN THIS FOLDER:
- index.html         : Main registration and check-in form
- admin.html         : Admin dashboard
- server.js          : Node.js server (handles data storage)
- start-server.bat   : Double-click to start the server
- dict-logo.png      : DICT logo
- data/              : Database folder (JSON files)

TO STOP THE SERVER:
Press Ctrl+C in the command prompt window
