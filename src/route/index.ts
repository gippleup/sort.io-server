import {Router} from 'express';
import userRouter from './user';
import countryRouter from './country';
import mapRouter from './map';
import multiRouter from './multi';

const router = Router();

router.get('/', (req, res) => {
  res.send('ok');
})

router.use('/user', userRouter)
router.use('/country', countryRouter)
router.use('/map', mapRouter)
router.use('/multi', multiRouter)

export default router;