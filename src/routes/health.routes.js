import { Router } from 'express';
import sequelize from '../config/database.js';

const router = Router();

router.get('/live', (req, res) => {
res.status(200).json({
status: 'ok',
});
});

router.get('/ready', async (req, res) => {
try {
await sequelize.authenticate();

res.status(200).json({
  status: 'ok',
  database: 'connected',
});

} catch (error) {
res.status(503).json({
status: 'error',
database: 'unavailable',
});
}
});

export default router;
