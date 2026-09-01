const crypto = require('crypto');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !process.env.RAZORPAY_KEY_SECRET) return res.status(400).json({ verified: false });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const verified = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(razorpay_signature)));
    return res.status(200).json({ verified });
  } catch (e) { return res.status(400).json({ verified: false }); }
};
