import express from 'express';
import { HmpiComputationController } from '../controllers/HmpiCompute.controller.js';
import { MheiComputationController } from '../controllers/MheiCompute.controller.js';

const computeRouter = express.Router();

computeRouter.post('/hmpi', HmpiComputationController);

computeRouter.post('/mhei', MheiComputationController);

export default computeRouter;