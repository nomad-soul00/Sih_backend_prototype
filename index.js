import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dataRouter from './routes/Data.routes.js';
import computeRouter from './routes/Compute.routes.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();


const allowedOrigins = ['https://sih-fronted-prototype.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.resolve(__dirname, 'public')));


app.use('/api/v1/data', dataRouter);
app.use('/api/v1/compute', computeRouter);

app.get('/', (req, res) => {
  res.send("Hello");
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
