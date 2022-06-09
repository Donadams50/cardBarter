import mongoose from 'mongoose';

import dotenv from 'dotenv';

dotenv.config();

const mongo_url = process.env.DB_URL || '';

export const mongoConfig = mongoose.connect(mongo_url).then(
        () => {
                console.log('Connected to the database!');
        },
        (err) => {
                console.log('Cannot connect to the database!', err);
                process.exit();
        }
);