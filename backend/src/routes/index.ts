import {Router} from "express"
const router = Router();

router.get('/teste', (req, res) => {
    res.send('API is running...');
}
);
export default router;