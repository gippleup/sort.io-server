import {Router} from 'express';
import controller from '../controller/country';

const router = Router();

router.get('/', (req, res) => res.send('연결됨'))
router.get('/icon', controller.icon)

export default router;