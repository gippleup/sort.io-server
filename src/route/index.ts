import {Router} from 'express';
import userRouter from './user';

const router = Router();

router.get('/', (req, res) => {
  res.send('ok');
})

router.use('/user', userRouter)


export default router;