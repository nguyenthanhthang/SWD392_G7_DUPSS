import express from 'express';
import { createMomoPayment, handleMomoCallback, createVnpayPayment, handleVnpayIpn, createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment, getTotalRevenue, getWeeklyRevenue, getMonthlyRevenue, getRevenueByService, getPaymentByAppointmentId } from '../controllers/paymentController';

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

// Thêm các routes thống kê doanh thu
router.get('/statistics/total', getTotalRevenue);
router.get('/statistics/weekly', getWeeklyRevenue);
router.get('/statistics/monthly', getMonthlyRevenue);
router.get('/statistics/by-service', getRevenueByService);

// Thêm route lấy payment theo appointmentId
router.get('/by-appointment/:appointmentId', getPaymentByAppointmentId);

export default router; 