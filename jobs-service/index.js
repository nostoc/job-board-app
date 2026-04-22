const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Placeholder for listing basic jobs
app.get('/api/v1/jobs', (req, res) => {
    res.status(200).json({ message: "Jobs Service: Placeholder for listing all jobs" });
});

// Placeholder for creating a draft job
app.post('/api/v1/jobs', (req, res) => {
    res.status(201).json({ message: "Jobs Service: Placeholder for creating a draft job" });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok", service: "jobs-service" });
});

app.listen(PORT, () => {
    console.log(`Jobs Service running on port ${PORT}`);
});