import {Router} from 'express';
import userRouter from './user';
import countryRouter from './country';
import mapRouter from './map';

const router = Router();

router.get('/', (req, res) => {
  res.send('ok');
})

router.use('/user', userRouter)
router.use('/country', countryRouter)
router.use('/map', mapRouter)

export default router;