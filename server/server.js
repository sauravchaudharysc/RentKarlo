import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import { DATABASE } from './config.js';
import authRoutes from './routes/auth.js';

const app = express();

//Database connection
mongoose.connect(DATABASE)
    .then(() => console.log('Database is connected'))
    .catch((err) => console.log(err));

//Middlewares
app.use(express.json());
app.use(morgan('dev')); 
app.use(cors());


//Routes Middlewares
app.use('/api', authRoutes);



/*
//Routes
//(URL, callback) {callback has access to request and response}
app.get('/', (req, res) => {
    res.json({
        message: 'Chalo Rent Karo'
    });
});
*/

app.listen(8000,() => console.log('Server is running on port 8000'));