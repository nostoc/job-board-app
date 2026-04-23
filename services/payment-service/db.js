require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();
const { PaymentEntity } = require('./entities/payment.entity');

const appDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [PaymentEntity],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
});

const initDB = async () => {
    await appDataSource.initialize();
    console.log("payments_db initialized");
};

const getPaymentRepository = () => appDataSource.getRepository('Payment');

module.exports = { appDataSource, initDB, getPaymentRepository };