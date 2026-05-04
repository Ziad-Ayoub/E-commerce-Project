const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

//create order by user on backend
// Create order securely on the backend
exports.createOrder = async (req, res) => {
    try {
        //Fetch the user and populate their cart to get secure database pricing
        const user = await User.findById(req.user._id).populate('cart.product');

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Cannot checkout an empty cart.' });
        }

        let calculatedTotal = 0;
        let totalQty = 0;
        let itemNames = [];

        //Loop through the cart to calculate secure totals AND update inventory
        for (const item of user.cart) {
            // Ensure the product wasn't deleted by an admin
            if (item.product) {
                // Calculate secure price
                calculatedTotal += (item.product.price * item.quantity);
                totalQty += item.quantity;
                itemNames.push(`${item.quantity}x ${item.product.title}`);

                //Decrement the stock in the database!
                await Product.findByIdAndUpdate(item.product._id, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        const itemString = itemNames.join(', ');
        const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        //Create the secure order
        const order = await Order.create({
            customer: user.name,
            qty: totalQty,
            item: itemString,
            total: calculatedTotal,
            timestamp
        });

        //Empty the user's cart securely on the backend
        user.cart = [];
        await user.save();

        res.status(201).json(order);
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: error.message });
    }
};