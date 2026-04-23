require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();
const { JobEntity } = require('./entities/job.entity');

const appDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [JobEntity],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
});

const initDB = async () => {
    await appDataSource.initialize();
    console.log("jobs_db initialized");
};

const getJobRepository = () => appDataSource.getRepository('Job');

module.exports = { appDataSource, initDB, getJobRepository };