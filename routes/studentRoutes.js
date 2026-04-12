import express from 'express';
import { isStudent } from '../middleware/authMiddleware.js';
import { getDashboard, placeOrder, cancelOrder, getQueueStatus, getLiveStudentOrders,getProfile, updateProfile,getActiveCoupons } from '../controllers/studentController.js';
const router = express.Router();

router.use(isStudent); // Protect all routes
router.get('/dashboard', getDashboard);
router.post('/order', placeOrder); // AJAX Endpoint
router.post('/order/cancel/:id', cancelOrder);
router.get('/api/orders', getLiveStudentOrders);
router.get('/api/queue-status', getQueueStatus);
router.get('/profile', getProfile);
router.post('/profile/update', updateProfile);
router.get('/api/coupons', getActiveCoupons); 
export default router;
