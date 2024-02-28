//
const express = require('express');
const route = express.Router();
const { auth, isUser } = require('../middelwares/auth');

//maping controllers

const {
	signUp,
	logIn,
	veiwAllProductList,
	addToCart,
	viewCart,
	updateCart,
	deleteProductFromCart,
	createOrder,
	getOrder,
	cancelOrder,
} = require('../controllers/userControllers');

//making routes

route.post('/signUp', signUp);
route.post('/logIn', logIn);
route.get('/view-all-product-list', auth, isUser, veiwAllProductList);
route.put('/add-to-cart', auth, isUser, addToCart);
route.get('/view-cart', auth, isUser, viewCart);
route.put('/update-cart/:productId', auth, isUser, updateCart);
route.delete('/delete-product-from-cart/:productId', auth, isUser, deleteProductFromCart);
route.post('/create-order', auth, isUser, createOrder);
route.get('/get-order', auth, isUser, getOrder);
route.delete('/cancel-order/:orderId', auth, isUser, cancelOrder);

//exporting

module.exports = route;
