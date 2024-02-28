//
const express = require('express');
const route = express.Router();
const { auth, isAdmin } = require('../middelwares/auth');

//maping controllers

const {
	createCategory,
	updateCategory,
	deleteCategory,
	getAllCategory,
	createProduct,
	updateProduct,
	viewAllProduct,
	deleteProduct,
	getAllOrdersList,
} = require('../controllers/adminControllers');

//making routes

//Category

route.post('/create-category', auth, isAdmin, createCategory);
route.put('/update-category/:Id', auth, isAdmin, updateCategory);
route.delete('/delete-category/:Id', auth, isAdmin, deleteCategory);
route.get('/get-category', auth, isAdmin, getAllCategory);

//Products
route.post('/create-product', auth, isAdmin, createProduct);
route.put('/update-product/:productId', auth, isAdmin, updateProduct);
route.delete('/delete-product/:productId', auth, isAdmin, deleteProduct);
route.get('/get-product', auth, isAdmin, viewAllProduct);
route.get('/get-all-orders-list', auth, isAdmin, getAllOrdersList);

//exporting

module.exports = route;
