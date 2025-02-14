require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 80;
const mongoURI = process.env.MONGO_URI;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Student Schema
const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Student = mongoose.model('Student', studentSchema);

// Student Registration API (POST)
app.post('/register', async (req, res) => {
    try {
        const { studentId, name, email, password } = req.body;
        if (!studentId || !name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newStudent = new Student({ studentId, name, email, password });
        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully', student: newStudent });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Student Login API (POST)
app.post('/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        const student = await Student.findOne({ studentId, password });
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({ message: 'Login successful', student });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Search Student API (GET)
app.get('/search', async (req, res) => {
    try {
        const { studentId } = req.query;
        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Update Student Profile API (PUT)
app.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const updatedStudent = await Student.findOneAndUpdate(
            { studentId: id },  // Match by studentId instead of _id
            { name, email },
            { new: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Profile updated successfully', student: updatedStudent });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete Student API (DELETE)
app.delete('/delete/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find and delete the student by studentId
        const deletedStudent = await Student.findOneAndDelete({ studentId });

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
