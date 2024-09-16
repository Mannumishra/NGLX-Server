const Checkout = require('../models/OrderModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { transporter } = require('../utils/mailTransporter');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY || "rzp_test_XPcfzOlm39oYi8",
    key_secret: process.env.RAZORPAY_API_SECRET || "Q79P6w7erUar31TwW4GLAkpa",
});

const createCheckout = async (req, res) => {
    try {
        console.log(req.body)
        const { userId, name, email, phone, address, state, city, pin, cartItems, totalPrice, transactionId, orderStatus, paymentMode, paymentStatus, finalAmount, shippingFee } = req.body;
        const errorMessage = [];
        if (!userId) errorMessage.push("UserId is required.");
        if (!name) errorMessage.push("Name is required.");
        if (!email) errorMessage.push("Email is required.");
        if (!phone) errorMessage.push("Phone is required.");
        if (!address) errorMessage.push("Address is required.");
        if (!state) errorMessage.push("State is required.");
        if (!city) errorMessage.push("City is required.");
        if (!pin) errorMessage.push("Pin code is required.");
        if (!Array.isArray(cartItems) || cartItems.length === 0) errorMessage.push("Cart items are required.");
        if (typeof totalPrice !== 'number' || totalPrice <= 0) errorMessage.push("Total price must be a positive number.");
        if (errorMessage.length > 0) {
            return res.status(400).json({ errors: errorMessage });
        }
        if (paymentMode === "Cash on Delivery") {
            const newCheckout = new Checkout({
                userId,
                name,
                email,
                phone,
                address,
                state,
                city,
                pin,
                cartItems,
                totalPrice,
                transactionId: null,
                orderStatus,
                paymentMode,
                paymentStatus: 'Pending',
                finalAmount, shippingFee
            });
            const savedCheckout = await newCheckout.save();
            // Send confirmation email
            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'Order Confirmation',
                html: `
                    <html>
                    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; box-sizing: border-box;">
                            <img src="https://urjjafrontend-git-main-mannu-s-projects.vercel.app/static/media/ZENS%20logo%20TM%20CDR%20(1).20ad0761e23f3c801c7f.png" alt="Zens Logo" style="display: block; margin: 0 auto; width: 200px;"/>
                            <h2 style="color: #0056b3; font-size: 24px; margin: 0 0 10px;">Order Confirmation</h2>
                            <p style="font-size: 16px; margin: 0 0 10px;">Thank you for your order, ${name}!</p>
                            <p style="font-size: 16px; margin: 0 0 10px;">Here are the details of your order:</p>
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Name:</strong> ${name}</li>
                                <li><strong>Email:</strong> ${email}</li>
                                <li><strong>Phone:</strong> ${phone}</li>
                                <li><strong>Address:</strong> ${address}, ${city}, ${state}, ${pin}</li>
                                <li><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</li>
                                <li><strong>Order Status:</strong> ${orderStatus}</li>
                                <li><strong>Payment Mode:</strong> ${paymentMode}</li>
                                <li><strong>Payment Status:</strong> ${paymentStatus}</li>
                            </ul>
                            <p style="font-size: 14px; color: #555; margin: 0 0 20px;">If you have any questions or need further assistance, please contact our support team.</p>
                            <p style="margin: 0 0 10px;">Thank you,<br><strong>Zens</strong></p>
                            <p style="font-size: 12px; color: #aaa; margin: 0;">If you did not place this order, please contact our support team immediately.</p>
                        </div>
                    </body>
                    </html>
                `
            };
            await transporter.sendMail(mailOptions);

            res.status(200).json(savedCheckout);
        }
        else if (paymentMode === 'Online Payment') {
            const options = {
                amount: Math.round(totalPrice * 100), // Convert to paise
                currency: 'INR',
                receipt: `receipt_${Date.now()}`, // Unique receipt ID
            };
            const order = await razorpay.orders.create(options);
            if (!order) {
                return res.status(500).json({ message: "Razorpay order creation failed." });
            }
            const newCheckout = new Checkout({
                userId,
                name,
                email,
                phone,
                address,
                state,
                city,
                pin,
                cartItems,
                totalPrice,
                transactionId: order.id, // Save the Razorpay Order ID
                orderStatus: 'Pending',
                paymentMode,
                paymentStatus: 'Pending', // Payment is pending until verified ,
                finalAmount, shippingFee
            });
            const savedCheckout = await newCheckout.save();
            res.status(200).json({
                message: 'Order created successfully. Proceed with payment.',
                checkout: savedCheckout,
                razorpayOrderId: order.id,
                amount: options.amount,
                currency: options.currency,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred while creating checkout." });
    }
};

const createRazorpayOrder = async (amount) => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`, // Unique receipt ID
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return null;
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Create HMAC with your Razorpay API Secret
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET || "Q79P6w7erUar31TwW4GLAkpa");
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Payment verified successfully, update the checkout status
            const updatedCheckout = await Checkout.findOneAndUpdate(
                { transactionId: razorpay_order_id },
                { paymentStatus: 'Successfull', orderStatus: 'Confirmed' },
                { new: true }
            );
            if (!updatedCheckout) {
                return res.status(404).json({ message: "Order not found." });
            }
            res.status(200).json({ message: 'Payment successful and order confirmed.', checkout: updatedCheckout });
        } else {
            res.status(400).json({ message: 'Invalid signature, payment verification failed.' });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ message: 'Server error during payment verification.' });
    }
};





const getAllCheckouts = async (req, res) => {
    try {
        // console.log("I am hit")
        const checkouts = await Checkout.find({});
        res.status(200).json(checkouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred while retrieving checkouts." });
    }
};

const getCheckoutById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const checkout = await Checkout.findById(id);
        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found." });
        }
        res.status(200).json(checkout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred while retrieving checkout." });
    }
};

const deleteCheckout = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCheckout = await Checkout.findByIdAndDelete(id);
        if (!deletedCheckout) {
            return res.status(404).json({ message: "Checkout not found." });
        }
        res.status(200).json({ message: "Checkout deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred while deleting checkout." });
    }
};

const updateCheckoutStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;
        const updatedCheckout = await Checkout.findByIdAndUpdate(
            id,
            { orderStatus, paymentStatus },  // Fields to update
            { new: true, runValidators: true } // Return updated document and run validators
        );
        if (!updatedCheckout) {
            return res.status(404).json({ message: "Checkout not found." });
        }
        res.status(200).json(updatedCheckout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred while updating checkout status." });
    }
};

const getCheckOutByUserID = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await Checkout.find({ userId });  // find based on userId, not findOne
        if (!data.length) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params; // Get the order ID from the request parameters

        // Find and update the order status to 'Cancelled'
        const updatedOrder = await Checkout.findByIdAndUpdate(
            id,
            { orderStatus: 'Cancelled' }, // Assuming 'Cancelled' is a valid status in your system
            { new: true, runValidators: true } // Return the updated document and run validators
        );

        // Check if the order was found and updated
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Send a successful response with the updated order
        res.status(200).json({ message: "Order cancelled successfully.", updatedOrder });
    } catch (error) {
        // Log the error and send a server error response
        console.error('Error cancelling the order:', error);
        res.status(500).json({ message: "Server error occurred while cancelling the order." });
    }
};



module.exports = {
    createCheckout,
    getAllCheckouts,
    getCheckoutById,
    deleteCheckout,
    updateCheckoutStatus,
    getCheckOutByUserID,
    verifyPayment,
    cancelOrder
};
