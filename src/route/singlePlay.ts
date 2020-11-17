import { Router } from 'express';
import controller from '../controller/singlePlay';

const router = Router();

router.get('/', controller.data);
router.post('/save', controller.save);
router.get('/rank', controller.rank);

export default router;