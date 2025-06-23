import express from 'express';
import { createMomoPayment, handleMomoCallback, createVnpayPayment, handleVnpayIpn } from '../controllers/paymentController';

const router = express.Router();

router.post('/momo/create-payment', createMomoPayment);
router.post('/momo/callback', handleMomoCallback);

// VNPay Routes
router.post('/vnpay/create-payment', createVnpayPayment);
router.get('/vnpay/ipn', handleVnpayIpn);

export default router; 