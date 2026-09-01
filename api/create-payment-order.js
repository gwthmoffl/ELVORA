const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Online payments are not configured yet.' });
  }
  try {
    const { amount, receipt } = req.body || {};
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > 100000000) return res.status(400).json({ error: 'Invalid amount' });
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({
      amount: Math.round(value * 100),
      currency: process.env.RAZORPAY_CURRENCY || 'INR',
      receipt: String(receipt || `ELV-${Date.now()}`).slice(0, 40)
    });
    return res.status(200).json({ id: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    return res.status(500).json({ error: 'Could not create payment order.' });
  }
};
