import {Router} from 'express';
import controller from '../controller/multi';

const router = Router();
router.get('/', (req, res) => res.send('connected to multi router'))
router.get('/match', controller.match)

export default router;