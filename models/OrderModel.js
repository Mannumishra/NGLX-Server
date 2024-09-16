const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    cartItems: [
        {
            productname: {
                type: String,
                required: true
            },
            productquantity: {
                type: Number,
                required: true
            },
            productimage: {
                type: String,
                required: true
            },
            productprice: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        default: 'Order Is Placed'
    },
    paymentMode: {
        type: String,
        enum: ['Online Payment', 'Cash on Delivery'],
        default: "Online Payment"
    },
    finalAmount: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Checkout = mongoose.model("Checkout", checkoutSchema);

module.exports = Checkout;
