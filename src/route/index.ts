import {Router} from 'express';
import userRouter from './user';
import countryRouter from './country';
import mapRouter from './map';
import singlePlayRouter from './singlePlay';
import multiPlayRouter from './multiPlay';

const router = Router();

router.get('/', (req, res) => {
  res.send('ok');
})

router.use('/user', userRouter)
router.use('/country', countryRouter)
router.use('/map', mapRouter)
router.use('/singlePlay', singlePlayRouter)
router.use('/multiPlay', multiPlayRouter)

export default router;