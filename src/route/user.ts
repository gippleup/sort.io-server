import {Router} from 'express';
import controller from '../controller/user';
import guestRouter from './user/guest';

const router = Router();

router.get('/', (req, res) => res.send('connected'));

router.get('/ticket', controller.ticket.get);
router.post('/ticket', controller.ticket.post);

router.get('/playdata', controller.playdata.get);
router.post('/playdata', controller.playdata.post);

router.get('/gold', controller.gold.get);
router.post('/gold', controller.gold.post);

router.get('/ticket', controller.ticket.get);
router.post('/ticket', controller.ticket.post);

router.post('/update', controller.update);

router.post('/signup', controller.signup)
router.post('/signin', controller.signin)
router.get('/signout', controller.signout)
router.get('/delete', controller.delete)

router.use('/guest', guestRouter);
router.get('/purchase', controller.purchase.get);
router.post('/purchase', controller.purchase.post);

export default router;