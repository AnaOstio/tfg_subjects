import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import subjectRouter from './routers/subject.router';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3005;

// Database connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/subjects', subjectRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 