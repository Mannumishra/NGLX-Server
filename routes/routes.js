const express = require('express')
const productController = require('../controllers/ProductController');
const routes = express.Router()
const { register, LoginUser, Logout, getAllUsers, getTokenFromCookies, verifyOtpForSignIn, ResendSignOtp, PasswordChangeRequest, VerifyOtp } = require('../controllers/Usercontrollers')
const { isAuthenticatedUser } = require('../middlewares/auth')
const { createCheckout, getAllCheckouts, getCheckoutById, updateCheckoutStatus, deleteCheckout, getCheckOutByUserID, verifyPayment } = require('../controllers/OrderController')
const { createBanner, createCategory, makeTag, getAllBanners, deleteBanner, getAllCategories, updateCategory, deleteCategory, getAllTags, updateTag, deleteTag, updateBanner } = require('../controllers/webpage')
const { ShipRocketLogin, MakeOrderReadyToShip } = require('../controllers/Shiprocket')
const { RedirectCategoryMake, GetAllRedirectCat, DeleteRedirectCategory } = require('../controllers/Redirect')
const { createVoucher, getAllVouchers, activateVoucher, deactivateVoucher, deleteVoucher, applyVoucher } = require('../controllers/Voucher')
const { createSalesBanner, getAllSalesBanners, deleteSalesBanner, updateSaleBanner } = require('../controllers/SalesBanner');
const { getContacts, createContact, deleteMail } = require('../controllers/ContactController');
const upload = require('../utils/multerConfig');




//====================USER ROUTES=========================//
routes.post('/register', register)
routes.post('/Verify-sign-Otp', verifyOtpForSignIn)
routes.post('/resend-sign-Otp', ResendSignOtp)
routes.post('/Password-change-request', PasswordChangeRequest)

routes.post('/Verify-Otp/:email/:newPassword', VerifyOtp)


routes.post('/login', LoginUser)
routes.get('/Logout', isAuthenticatedUser, Logout)
routes.get('/All-users', getAllUsers)
routes.get('/Token', isAuthenticatedUser, getTokenFromCookies)

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


//====================ORDERS ROUTES=========================//
routes.post("/checkout", createCheckout)
routes.get('/checkouts', getAllCheckouts);
routes.get('/checkout/:id', getCheckoutById);
routes.put('/checkout/:id', updateCheckoutStatus);
routes.delete('/checkout/:id', deleteCheckout);
routes.get('/checkout/user/:userId', getCheckOutByUserID);
routes.post("/verify-payment", verifyPayment)



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