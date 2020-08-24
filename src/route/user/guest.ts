import { Router } from 'express';
import controller from '../../controller/user/guest';

const router = Router();

router.get('/', (req, res) => res.send('connected'));
router.get('/create', controller.create)

export default router;