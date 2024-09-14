const axios = require('axios');
const Orders = require('../models/OrderModel');

exports.ShipRocketLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Making the POST request to ShipRocket login endpoint
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: email,
            password: password
        });

        //console.log(req.body)
        // Logging the response data
        //console.log(response.data);

        // Sending a success response to the client
        return res.status(200).json({
            success: true,
            data:response.data,
            msg: "Login successful"
        });
    } catch (error) {
        // Handling errors
        // //console.log(error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // //console.log(error.response.data);
            // //console.log(error.response.status);
            // //console.log(error.response.headers);
            return res.status(error.response.status).json({
                success: false,
                msg: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            //console.log(error.request);
            return res.status(500).json({
                success: false,
                msg: "No response from ShipRocket server"
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            //console.log('Error', error.message);
            return res.status(500).json({
                success: false,
                msg: "Internal Server Error"
            });
        }
    }
};


exports.MakeOrderReadyToShip = async (req, res) => {
    try {
        const OrderId = req.params.id;
        const { length, breadth, height, weight, token } = req.body
        //console.log(req.body)
        if (!OrderId) {
            return res.status(403).json({
                success: false,
                msg: "Please Provide Order id"
            });
        }
        const OrderDetail = await Orders.findById(OrderId)
        // //console.log(OrderDetail.UserInfo)
        const user = OrderDetail.UserInfo
        const Address = OrderDetail.UserDeliveryAddress
        const OrderItems = OrderDetail.items
        const utcTimestamp = OrderDetail.OrderDate;
        const orderItemsArray = OrderItems.map(item => ({
            name: item.Productname,
            sku: item.Sku || "123", // Set your SKU here
            units: parseInt(item.Quantity),
            selling_price: parseFloat(item.price),
            discount: "", // Set discount if applicable
            tax: "", // Set tax if applicable
            hsn: 441122 // Set HSN if applicable
        }));
        const data = {
            "order_id": OrderDetail._id,
            "order_date": utcTimestamp,
            "billing_customer_name": user.Name,
            "billing_last_name": "las",
            "billing_address": Address.Street,
            "billing_address_2": Address.HouseNo + Address.landMark,
            "billing_city": Address.City,
            "billing_pincode": Address.Pincode,
            "billing_state": Address.State,
            "billing_country": Address.City,
            "billing_email": user.Email,
            "billing_phone": user.Phone || "9876543210",
            "shipping_is_billing": true,

            "order_items": orderItemsArray,
            "payment_method": OrderDetail.PaymentMode,
            "shipping_charges": 0,
            "giftwrap_charges": 0,
            "transaction_charges": 0,
            "total_discount": 0,
            "sub_total": OrderDetail.FinalPrice,
            "length": length,
            "breadth": breadth,
            "height": height,
            "weight": weight
        };

        //console.log(token)
        axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Replace 'your-token' with your actual token
            }
        })
            .then(response => {
                //console.log('Response:', response.data);
                // Assuming response.data contains order details from Shiprocket
                // You can process the response as needed
            })
            .catch(error => {
                console.error('Error:', error.response.data);
                // Handle errors here
                const errorMessage = error.response.data.message;
                const errors = error.response.data.errors;
                const statusCode = error.response.data.status_code;
                // You can format and send the error response back to the client
                return res.status(statusCode).json({
                    success: false,
                    msg: errorMessage,
                    errors: errors
                });
            });

        res.status(201).json({
            success: true,
            msg: "Shipping is Done"
        });
    } catch (error) {
        //console.log('Error', error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

