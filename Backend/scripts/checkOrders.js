const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('../models/Orders');
const Order = mongoose.model('Order');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const totalOrders = await Order.countDocuments();
    console.log('Total orders:', totalOrders);
    
    const pickupRequestedOrders = await Order.find({ status: 'pickup_requested' }).select('_id orderNumber status shippingDetails shippingAddress').lean();
    console.log('Orders with pickup_requested status:', pickupRequestedOrders.length);
    if (pickupRequestedOrders.length > 0) {
      console.log('Sample order:', JSON.stringify(pickupRequestedOrders[0], null, 2));
    }
    
    const statuses = await Order.distinct('status');
    console.log('All order statuses:', statuses);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrders();
