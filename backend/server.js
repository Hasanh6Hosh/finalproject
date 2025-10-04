// Import required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware - allows JSON parsing and CORS
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'project_management'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API Routes

// Get all projects
app.get('/api/projects', (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Create new project
app.post('/api/projects', (req, res) => {
    const { name, image, description, rating } = req.body;
    
    const query = 'INSERT INTO projects (name, image, description, rating) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, image, description, rating], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            id: result.insertId, 
            name, 
            image, 
            description, 
            rating 
        });
    });
});

// Update project
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const { name, image, description, rating } = req.body;
    
    const query = 'UPDATE projects SET name = ?, image = ?, description = ?, rating = ? WHERE id = ?';
    
    db.query(query, [name, image, description, rating, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Project updated successfully' });
    });
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM projects WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Project deleted successfully' });
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});