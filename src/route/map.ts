import {Router} from 'express';
import controller from '../controller/map';

const router = Router();

router.get('/', (req, res) => res.send('connected to map route'));
router.get('/generate', controller.generate)

export default router;