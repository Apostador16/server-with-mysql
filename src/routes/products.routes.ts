import { Router } from 'express';
import * as controller from '../controllers/products.controller';

const router = Router();

router.get('/getAll', controller.getAll);
router.get('/getById/:id', controller.getById);
router.post('/create', controller.create);
router.put('/update/:id', controller.update);
router.delete('/delete/:id', controller.logicalDelete);
router.patch('/change-price/:id', controller.changePrice);

export default router;