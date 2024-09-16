const express = require('express')
const productController = require('../controllers/ProductController');
const routes = express.Router()
const { isAuthenticatedUser } = require('../middlewares/auth')
const { createUser, updateUser, getAllUser, getGetSingleUser, login, forgetPassword1, forgetPassword2, forgetPassword3, changePassword } = require("../controllers/Usercontrollers")
const { createCheckout, getAllCheckouts, getCheckoutById, updateCheckoutStatus, deleteCheckout, getCheckOutByUserID, verifyPayment, cancelOrder } = require('../controllers/OrderController')
const { createBanner, createCategory, makeTag, getAllBanners, deleteBanner, getAllCategories, updateCategory, deleteCategory, getAllTags, updateTag, deleteTag, updateBanner } = require('../controllers/webpage')
const { ShipRocketLogin, MakeOrderReadyToShip } = require('../controllers/Shiprocket')
const { RedirectCategoryMake, GetAllRedirectCat, DeleteRedirectCategory } = require('../controllers/Redirect')
const { createVoucher, getAllVouchers, activateVoucher, deactivateVoucher, deleteVoucher, applyVoucher } = require('../controllers/Voucher')
const { createSalesBanner, getAllSalesBanners, deleteSalesBanner, updateSaleBanner } = require('../controllers/SalesBanner');
const { getContacts, createContact, deleteMail } = require('../controllers/ContactController');
const upload = require('../utils/multerConfig');




//====================USER ROUTES=========================//
routes.post("/user", upload.SingleUpload, createUser)
routes.put("/user/:id", updateUser)
routes.get("/user", getAllUser)
routes.get("/user/:id", getGetSingleUser)
routes.post("/user/login", login)
routes.post("/forget-password/send-otp", forgetPassword1)
routes.post("/forget-password/verify-otp", forgetPassword2)
routes.post("/forget-password/reset-password", forgetPassword3)
routes.post("/user/chnage-password", changePassword)

//====================PRODUCT ROUTES=========================//
routes.post('/createProduct', upload.multerUploads, productController.createProducts);
routes.get('/getAllProducts', productController.getAllProducts);
routes.get('/getProductByName/:productName?', productController.getProductByName);
routes.get('/getProductById/:id', productController.getProductByName);
routes.get('/filterProductsByTags', productController.filterProductsByTags);
routes.put('/updateProduct/:id', productController.updateProduct);
routes.delete('/deleteProductById/:id', productController.deleteProductById);
routes.get('/getProductsByCategory/:category', productController.getProductsByCategory);



//====================WEBPAGE Banner Router ROUTES=========================//
routes.post('/create-banners', upload.SingleUpload, createBanner)
routes.get('/get-Banners', getAllBanners)
routes.delete('/delete-Banners/:id', deleteBanner)
routes.put('/update-Banners/:id', upload.SingleUpload, updateBanner)



// ====================== Category =============== //
routes.post('/create-category', upload.SingleUpload, createCategory)
routes.get('/get-category', getAllCategories)
routes.put('/update-category/:id', upload.SingleUpload, updateCategory)
routes.delete('/delete-category/:id', deleteCategory)


// =================Tags======================//
routes.post('/Make-tags', makeTag)
routes.get('/get-tags', getAllTags)
routes.put('/update-tags/:id', updateTag)
routes.delete('/delete-tags/:id', deleteTag)

//=================================================
routes.post('/create-redirect', upload.SingleUpload, RedirectCategoryMake)
routes.get('/all-redirect', GetAllRedirectCat)
routes.delete('/delete-redirect/:id', DeleteRedirectCategory)


routes.post("/checkout", createCheckout);
routes.get('/checkouts', getAllCheckouts);
routes.get('/checkout/:id', getCheckoutById);
routes.put('/checkout/:id', updateCheckoutStatus);
routes.put('/checkout/cancel/:id', cancelOrder);
routes.delete('/checkout/:id', deleteCheckout);
routes.get('/checkout/user/:userId', getCheckOutByUserID);
routes.post("/verify-payment", verifyPayment);



// routes.post('/create-payment',newPayment)
//====================SHIP-ROCKET  ROUTES=========================//
// routes.post('/Ship-Rocket-login', ShipRocketLogin)
// routes.post('/Order-Ship/:id', MakeOrderReadyToShip)



// ====================VOUCHERS====================================//
routes.get('/vouchers', getAllVouchers)
routes.post('/apply-vouchers', applyVoucher)

routes.post('/vouchers/create-vouchers', createVoucher)
routes.put('/vouchers/activateVoucher/:id', activateVoucher)
routes.put('/vouchers/deactivateVoucher/:id', deactivateVoucher)
routes.delete('/vouchers/deleteVoucher/:id', deleteVoucher)

// ======================Sales-Banner=======================//
routes.post('/create-sales-banners', upload.SingleUpload, createSalesBanner)
routes.get('/get-sales-Banners', getAllSalesBanners)
routes.delete('/delete-sales-Banners/:id', deleteSalesBanner)
routes.post('/update-sales-Banners/:id', updateSaleBanner)

// ======================Contact=======================//
routes.get('/getcontact', getContacts);
routes.post('/createcontact', createContact);
routes.delete('/delete-mail/:id', deleteMail)


module.exports = routes