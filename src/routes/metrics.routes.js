import { Router } from 'express';
import { register } from '../monitoring/metrics.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});

export default router;