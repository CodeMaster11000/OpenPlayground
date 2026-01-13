const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'contacts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Ensure contacts.json exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// POST /api/contact - Store a new contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const newContact = {
        id: Date.now(),
        name,
        email,
        subject: subject || 'No Subject',
        message,
        date: new Date().toISOString()
    };

    try {
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        const contacts = JSON.parse(fileData);
        contacts.push(newContact);
        fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
        
        console.log('New submission saved:', newContact);
        res.status(201).json({ message: 'Contact message received and stored successfully' });
    } catch (error) {
        console.error('Error handling contact submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/contact - Retrieve all contact submissions
app.get('/api/contact', (req, res) => {
    try {
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        const contacts = JSON.parse(fileData);
        res.json(contacts);
    } catch (error) {
        console.error('Error retrieving contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
