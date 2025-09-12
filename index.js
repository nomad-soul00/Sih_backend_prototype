import express from 'express';
import path from 'path';
import dotenv from 'dotenv'
import cors from 'cors'

import dataRouter from './routes/Data.routes.js';
import computeRouter from './routes/Compute.routes.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve('public')));

app.use('/api/v1/data', dataRouter);
app.use('/api/v1/compute', computeRouter);



app.get('/', (req,res)=>{
    res.send("Hello");
})

// app.listen(PORT,()=>{
//     console.log(`Server running on port ${PORT}`);
// });

module.exports = app