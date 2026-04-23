const express = require('express');
const { initDB, getJobRepository } = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Create Draft Job
app.post('/api/v1/jobs', async (req, res) => {
    const { employer_id, title, description, salary_min, salary_max } = req.body;
    try {
        const jobRepository = getJobRepository();
        const job = jobRepository.create({
            employer_id,
            title,
            description,
            salary_min,
            salary_max,
            status: 'DRAFT'
        });
        const savedJob = await jobRepository.save(job);
        res.status(201).json(savedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Publish Job
app.put('/api/v1/jobs/:id/publish', async (req, res) => {
    try {
        const jobRepository = getJobRepository();
        const existingJob = await jobRepository.findOneBy({ id: req.params.id });
        if (!existingJob) return res.status(404).json({ error: "Job not found" });

        existingJob.status = 'PUBLISHED';
        const updatedJob = await jobRepository.save(existingJob);
        res.status(200).json(updatedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Delete Job (Saga Rollback)
app.delete('/api/v1/jobs/:id', async (req, res) => {
    try {
        const jobRepository = getJobRepository();
        await jobRepository.delete({ id: req.params.id });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok", service: "jobs-service" });
});


const PORT = process.env.PORT || 3002;
initDB().then(() => {
    app.listen(PORT, () => console.log(`Jobs Service running on port ${PORT}`));
}).catch((error) => {
    console.error('Failed to initialize jobs-service database:', error.message);
    process.exit(1);
});