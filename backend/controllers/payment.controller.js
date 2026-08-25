const Razorpay = require("razorpay");
const crypto = require("crypto");

// Get Razorpay Instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummyKey123";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummySecret123";

  return new Razorpay({
    key_id,
    key_secret,
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid order amount is required" });
    }

    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.json({
      success: true,
      message: "Razorpay order created",
      data: {
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_dummyKey123",
      },
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating Razorpay payment order",
    });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay payment verification parameters" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "dummySecret123";

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return res.json({
        success: true,
        message: "Razorpay payment verified successfully!",
        data: {
          razorpay_payment_id,
          razorpay_order_id,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature!",
      });
    }
  } catch (error) {
    console.error("Verify Razorpay Error:", error);
    return res.status(500).json({ success: false, message: "Error verifying Razorpay payment" });
  }
};
