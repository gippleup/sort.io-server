import { Router } from 'express';
import controller from '../controller/match';

const router = Router();

router.get('/', (req, res) => res.send('connected'));

router.post('/save', controller.save);

export default router;