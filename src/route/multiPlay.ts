import { Router } from 'express';
import controller from '../controller/multiPlay';

const router = Router();

router.get('/', (req, res) => res.send('connected'));
router.post('/save', controller.save);
router.get('/rank', controller.rank);

export default router;