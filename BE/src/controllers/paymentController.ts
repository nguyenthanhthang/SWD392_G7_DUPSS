import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import Appointment from '../models/Appointment';
import { VNPay } from 'vnpay';
import moment from 'moment';
import Payment from '../models/Payment';

dotenv.config();

// Interface cho response từ worldtimeapi
interface WorldTimeResponse {
    datetime: string;
    [key: string]: any;
}

/**
 * Gets network time from worldtimeapi.org
 * This is crucial for VNPay integration as it requires accurate time
 */
async function getNetworkTime(): Promise<Date> {
    try {
        // This API provides accurate time for the specified timezone
        const response = await axios.get<WorldTimeResponse>('http://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh', {
            timeout: 5000 // 5 second timeout
        });
        return new Date(response.data.datetime);
    } catch (error) {
        console.warn("Warning: Could not fetch network time. Falling back to local system time. This may cause issues if the system clock is incorrect. Error:", error);
        return new Date(); // Fallback to system time is crucial
    }
}

export const createMomoPayment = async (req: Request, res: Response) => {
    const { amount, orderInfo } = req.body;

    const partnerCode = process.env.MOMO_PARTNER_CODE as string;
    const accessKey = process.env.MOMO_ACCESS_KEY as string;
    const secretkey = process.env.MOMO_SECRET_KEY as string;
    const requestId = partnerCode + new Date().getTime();
    const orderId = requestId;
    const redirectUrl = "http://localhost:5173/payment/result"; // URL FE receives payment result
    const ipnUrl = "http://localhost:5000/api/payment/momo/callback"; // URL for MoMo to notify payment result
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: 'en'
    });

    try {
        const momoResponse = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(momoResponse.data);
    } catch (error) {
        console.error("Momo payment creation failed: ", error);
        res.status(500).json({ message: "Failed to create MoMo payment", error });
    }
};

export const createVnpayPayment = async (req: Request, res: Response) => {
    try {
        const { amount, orderInfo, orderId, language = 'vn', bankCode = '' } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                message: "Invalid amount", 
                code: 'INVALID_AMOUNT',
                details: "Amount must be greater than 0" 
            });
        }

        if (!orderInfo || !orderId) {
            return res.status(400).json({ 
                message: "Missing required fields", 
                code: 'MISSING_FIELDS',
                details: "orderInfo and orderId are required" 
            });
        }

        console.log("\n=== [BE] Creating VNPay Payment ===");
        console.log("Amount:", amount);
        console.log("OrderInfo:", orderInfo);
        console.log("OrderId:", orderId);

        // Initialize VNPay with error handling
        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMNCODE || '6LY20Q42',
            secureSecret: process.env.VNP_HASHSECRET || '4OTGJB27U06AGS80ND6H3IBM90RS4GM7',
            vnpayHost: process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
            testMode: process.env.NODE_ENV !== 'production',
        });

        // Get network time with timeout
        const now = await getNetworkTime();
        const createDate = moment(now).format('YYYYMMDDHHmmss');

        // Prepare payment data with proper validation
        const paymentData = {
            vnp_Amount: Math.round(amount * 100),
            vnp_TxnRef: orderId,
            vnp_OrderInfo: encodeURIComponent(orderInfo),
            vnp_IpAddr: '127.0.0.1',
            vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
            vnp_IpnUrl: process.env.VNPAY_IPN_URL,
            vnp_CreateDate: createDate,
            vnp_Locale: language,
            vnp_BankCode: bankCode,
            vnp_Command: 'pay',
            vnp_Version: '2.1.0',
            vnp_OrderType: 'other',
            vnp_CurrCode: 'VND' 
        };
        
        // Log paymentData for debugging
        console.log('[VNPay] paymentData:', JSON.stringify(paymentData, null, 2));

        // Build payment URL with error handling
        let payURL;
        try {
            payURL = vnpay.buildPaymentUrl(paymentData as any);
        } catch (error) {
            console.error("Error building VNPay URL:", error);
            return res.status(500).json({ 
                message: "Failed to create payment URL", 
                code: 'URL_BUILD_ERROR',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Enhanced logging for debugging
        console.log("\n=== [BE] VNPay Payment Created ===");
        console.log("Server Time:", new Date().toString());
        console.log("Network Time:", now.toString());
        console.log("VNPay CreateDate:", createDate);
        console.log("Return URL:", paymentData.vnp_ReturnUrl);
        console.log("IPN URL:", paymentData.vnp_IpnUrl);
        console.log("Payment Data:", JSON.stringify(paymentData, null, 2));
        console.log("Payment URL:", payURL);
        console.log("===============================\n");

        // Store payment info in session or cache if needed
        // ... (implement if needed)

        res.json({ 
            payUrl: payURL,
            orderId: orderId,
            amount: amount,
            createDate: createDate
        });

    } catch (error) {
        console.error("\n=== [BE] VNPay Payment Creation Failed ===");
        console.error("Error:", error);
        console.error("===============================\n");
        
        // Send appropriate error response
        res.status(500).json({ 
            message: "Payment creation failed", 
            code: 'PAYMENT_CREATE_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const handleMomoCallback = async (req: Request, res: Response) => {
    const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
    } = req.body;

    const accessKey = process.env.MOMO_ACCESS_KEY as string;
    const secretkey = process.env.MOMO_SECRET_KEY as string;

    // Tạo rawSignature để kiểm tra chữ ký
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    // Tạo chữ ký của riêng bạn để so sánh
    const calculatedSignature = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');

    // --- XÁC THỰC CHỮ KÝ ---
    if (signature !== calculatedSignature) {
        console.error("MoMo Callback: Invalid signature");
        // Không phản hồi gì cho MoMo để MoMo có thể thử gửi lại
        return res.status(400).json({ message: "Invalid signature" });
    }

    // --- XỬ LÝ KẾT QUẢ THANH TOÁN ---
    try {
        // Trích xuất appointmentId từ orderInfo
        // Ví dụ: orderInfo = "Thanh toán cho lịch hẹn 60d21b4667d0d8992e610c85"
        const appointmentId = orderInfo.split(" ").pop();

        if (!appointmentId) {
            console.error("MoMo Callback: Cannot extract appointmentId from orderInfo", orderInfo);
            return res.status(400).json({ message: "Invalid orderInfo" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            console.error(`MoMo Callback: Appointment not found with ID: ${appointmentId}`);
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (resultCode === 0) {
            // Thanh toán thành công
            appointment.status = "completed";
            await appointment.save();
            console.log(`MoMo Callback: Appointment ${appointmentId} status updated to completed.`);
            // Phản hồi cho MoMo với HTTP 204 để xác nhận đã nhận và xử lý thành công
            return res.status(204).send();
        } else {
            // Thanh toán thất bại
            appointment.status = "cancelled"; // Hoặc một trạng thái thất bại khác nếu có
            await appointment.save();
            console.log(`MoMo Callback: Payment failed for appointment ${appointmentId}. Status updated to cancelled.`);
             // Vẫn phản hồi 204 để MoMo không gửi lại IPN
            return res.status(204).send();
        }
    } catch (error) {
        console.error("MoMo Callback: Error processing callback", error);
        // Có lỗi phía server, không trả về 204 để MoMo có thể thử lại
        return res.status(500).json({ message: "Server error" });
    }
};

export const handleVnpayIpn = async (req: Request, res: Response) => {
    try {
        // Initialize VNPay with proper config
        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMNCODE || '6LY20Q42',
            secureSecret: process.env.VNP_HASHSECRET || '4OTGJB27U06AGS80ND6H3IBM90RS4GM7',
            vnpayHost: process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
            testMode: process.env.NODE_ENV !== 'production',
        });

        // Verify IPN signature
        const { isSuccess, ...vnpParams } = vnpay.verifyIpnCall(req.query as any);

        if (!isSuccess) {
            console.error("VNPay IPN: Invalid signature", req.query);
            return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const appointmentId = vnpParams.vnp_TxnRef;
        const vnpResponseCode = vnpParams.vnp_ResponseCode;
        const transactionNo = String(vnpParams.vnp_TransactionNo || '');
        const amount = Number(vnpParams.vnp_Amount) / 100; // Convert back from VNPay format

        // Validate appointment
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            console.error(`VNPay IPN: Appointment not found with ID: ${appointmentId}`);
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
        
        // Prevent duplicate processing
        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            console.log(`VNPay IPN: Appointment ${appointmentId} already processed.`);
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }
        
        // Handle payment result
        if (vnpResponseCode === '00') {
            // Payment successful
            appointment.status = "completed";
            appointment.paymentDetails = {
                transactionNo,
                amount,
                paymentTime: new Date(),
                paymentMethod: 'vnpay'
            };
            await appointment.save();
            
            console.log(`VNPay IPN: Appointment ${appointmentId} status updated to completed.`);
            return res.status(200).json({ RspCode: '00', Message: 'Confirm success' });
        } else {
            // Payment failed
            appointment.status = "cancelled";
            appointment.paymentDetails = {
                transactionNo,
                amount,
                paymentTime: new Date(),
                paymentMethod: 'vnpay',
                failureReason: `VNPay Error Code: ${vnpResponseCode}`
            };
            await appointment.save();
            
            console.log(`VNPay IPN: Payment failed for appointment ${appointmentId}. Status updated to cancelled.`);
            return res.status(200).json({ RspCode: '00', Message: 'Confirm success' }); // Still confirm to VNPay
        }

    } catch (error) {
        console.error("VNPay IPN processing failed: ", error);
        // Always return 200 to VNPay even on error, but with error code
        return res.status(200).json({ 
            RspCode: '99', 
            Message: 'Unknown error',
            Detail: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Tạo payment mới
export const createPayment = async (req: Request, res: Response) => {
  try {
    const payment = new Payment(req.body);
    const saved = await payment.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy tất cả payment
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().populate('customerId').populate('appointmentId');
    res.status(200).json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy payment theo id
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('customerId').populate('appointmentId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(payment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Sửa payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(payment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json({ message: 'Payment deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}; 