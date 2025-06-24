import express from 'express';
import { createMomoPayment, handleMomoCallback, createVnpayPayment, handleVnpayIpn, createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/momo/create-payment', createMomoPayment);
router.post('/momo/callback', handleMomoCallback);

// VNPay Routes
router.post('/vnpay/create-payment', createVnpayPayment);
router.get('/vnpay/ipn', handleVnpayIpn);

router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router; 