import {Router} from 'express';
import controller from '../controller/user';
import guestRouter from './user/guest';

const router = Router();

router.get('/', (req, res) => res.send('connected'));

router.get('/playdata', controller.playdata.get);
router.post('/playdata', controller.playdata.post);

router.post('/signup', controller.signup)
router.get('/signin', controller.signin)
router.get('/signout', controller.signout)
router.get('/delete', controller.delete)

router.use('/guest', guestRouter);

export default router;