import {Router} from 'express';
import userRouter from './user';
import countryRouter from './country';

const router = Router();

router.get('/', (req, res) => {
  res.send('ok');
})

router.use('/user', userRouter)
router.use('/country', countryRouter)

export default router;