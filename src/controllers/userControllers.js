const User = require('../schema/userSchema');
const Order = require('../schema/orderSchema');
const Cart = require('../schema/cartSchema');
const { hashpassword } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../schema/productSchema');
const { json } = require('express');
require('dotenv').config();

//..................signUp.............................................................//

exports.signUp = async (req, res) => {
	try {
		//Destructured feilds from req.body
		const { userName, email, password } = req.body;

		//validation
		if (!userName || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'All feilds are required',
			});
		}

		//if user allready exist then return with error message

		const existUser = await User.findOne({ email });
		if (existUser) {
			return res.status(400).json({
				success: false,
				message: 'User allready exist',
			});
		}

		//if user not exist then encripted password

		const encryptedPassword = await hashpassword(password, 10);

		//create entry in db

		const createUser = await User.create({
			userName,
			email,
			password: encryptedPassword,
		});

		//create cart for user

		const createCart = await Cart.create({
			user: createUser._id,
			items: [],
		});

		//response

		res.status(200).json({
			success: true,
			message: 'User created successfully',
			data: createUser,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while creating user',
		});
	}
};

//................................logIn.............................................................

exports.logIn = async (req, res) => {
	try {
		//destructured feild from req.body

		const { email, password, userName } = req.body;

		//validation

		if (!password || (!email && !userName)) {
			return res.status(400).json({
				success: false,
				message: 'Full fill all details',
			});
		}

		//check if user not exist then return with error message

		let existUser;
		if (email) {
			existUser = await User.findOne({ email });
		} else {
			existUser = await User.findOne({ userName });
		}

		if (!existUser) {
			return res.status(400).json({
				success: false,
				message: 'User not exist',
			});
		}

		//if user exist then compare the password

		const comparedPassword = await bcrypt.compare(password, existUser.password);

		if (comparedPassword) {
			const payload = {
				email: existUser.email,
				role: existUser.role,
				id: existUser._id,
			};

			const token = jwt.sign(payload, process.env.SECRET_KEY, {
				expiresIn: '3h',
			});

			let ans;

			if (email) {
				ans = await User.findOne({ email }, { email: 1, userName: 1, role: 1 });
			} else {
				ans = await User.findOne({ userName }, { email: 1, userName: 1, role: 1 });
			}

			//response

			let Options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};

			//

			res.status(200)
				.cookie('token', token, Options)
				.json({
					success: true,
					message: 'Login successfully',
					data: {
						...ans._doc,
						token,
					},
				});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while login user',
		});
	}
};

//.......................... view product list..................................................../

exports.veiwAllProductList = async (req, res) => {
	const page = +req.query.page || 1;
	try {
		const ITEMS_PER_PAGE = 10;

		const totalProducts = await Product.countDocuments();
		const products = await Product.find()
			.skip((page - 1) * ITEMS_PER_PAGE)
			.limit(ITEMS_PER_PAGE);

		res.json({
			currentPage: page,
			totalPages: Math.ceil(totalProducts / ITEMS_PER_PAGE),
			totalProducts,
			products,
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'Found some error while fetch product list',
		});
	}
};

//****************************************** CART********************************************************************* */

//...............................add to cart.............................../

exports.addToCart = async (req, res) => {
	try {
		//destructured feild from req.body

		const { productId, qty } = req.body;

		const userId = req.user.id;

		//validation

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: 'Provide product id',
			});
		}

		//check product id is exist or not

		const findProduct = await Product.findById(productId);

		if (!findProduct) {
			return res.status(400).json({
				success: false,
				message: 'This product is not exist',
			});
		}

		//check that stock is available for that product or not

		const avilableQty = findProduct.qty;

		if (qty > avilableQty) {
			return res.json({
				success: false,
				message: `only ${avilableQty} of this avilable`,
			});
		}

		//check that crat is exist or not

		const findCart = await Cart.findOne({ user: userId });

		if (!findCart) {
			return res.status(400).json({
				success: false,
				message: 'Cart not found',
			});
		}

		// Find the index of the product in the cart items array
		const itemIndex = findCart.items.findIndex((item) => item.product.equals(productId));

		// If the product is not in the cart then add product into cart
		if (itemIndex === -1) {
			const item = {
				product: productId,
				quantity: qty,
				price: findProduct.price * qty,
			};

			let newTotalQuantity = findCart.totalQuantity + item.quantity;
			let newTotalPrice = findCart.totalPrice + item.price;

			//create addd to cart
			const updatedCart = await Cart.findOneAndUpdate(
				{
					user: userId,
				},
				{
					$push: {
						items: item,
					},
					totalPrice: newTotalPrice,
					totalQuantity: newTotalQuantity,
				},
				{
					new: true,
				}
			);
			//response
			res.status(200).json({
				success: true,
				message: 'Cart updated successfully',
				data: updatedCart,
			});
		} else {
			if (findProduct.qty > findCart.items[itemIndex].quantity) {
				findCart.items[itemIndex].quantity++;
				findCart.items[itemIndex].price = findProduct.price * findCart.items[itemIndex].quantity;
			} else {
				return res.status(400).json({
					success: false,
					message: 'Quantity not available',
				});
			}

			// Recalculate total quantity and total price
			findCart.totalQuantity = findCart.items.reduce((total, item) => total + item.quantity, 0);
			findCart.totalPrice = findCart.items.reduce((total, item) => total + item.price, 0);

			// Save the updated cart
			await findCart.save();

			//response
			res.status(200).json({
				success: true,
				message: 'Cart updated successfully',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while updating cart',
		});
	}
};

//..................................view his/her cart......................................../

exports.viewCart = async (req, res) => {
	try {
		//destructured userId from req.user

		const userId = req.user.id;

		//view cart

		const viewCart = await Cart.findOne({ user: userId });

		//response

		res.status(200).json({
			success: true,
			message: 'Crat fetching successfully',
			viewCart,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while fetching error',
		});
	}
};

//................................update quantity of add to cart................................../

exports.updateCart = async (req, res) => {
	const { productId } = req.params;

	//action = inc or dec
	const { action } = req.body;

	try {
		// Find the cart for the current user
		let cart = await Cart.findOne({ user: req.user.id });

		//find product based on productid
		const findProduct = await Product.findById(productId);

		// Find the index of the product in the cart items array
		const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));

		// If the product is not in the cart, return an error
		if (itemIndex === -1) {
			return res.status(404).json({ message: 'Product not found in cart' });
		}

		// Increment or decrement the quantity based on the action
		if (action === 'inc') {
			if (findProduct.qty > cart.items[itemIndex].quantity) {
				cart.items[itemIndex].quantity++;
				cart.items[itemIndex].price = findProduct.price * cart.items[itemIndex].quantity;
			} else {
				return res.status(400).json({
					success: false,
					message: 'Quantity not available',
				});
			}
		} else if (action === 'dec') {
			// If the quantity is 1 and the user wants to decrease, remove the product from the cart
			if (cart.items[itemIndex].quantity === 1) {
				cart.items.splice(itemIndex, 1);
			} else {
				cart.items[itemIndex].quantity--;
				cart.items[itemIndex].price = findProduct.price * cart.items[itemIndex].quantity;
			}
		} else {
			return res.status(400).json({
				success: false,
				message: 'Invalid action. Allowed actions are "inc" or "dec"',
			});
		}

		// Recalculate total quantity and total price
		cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
		cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

		// Save the updated cart
		await cart.save();

		// Respond with the updated cart

		res.status(200).json({
			success: true,
			cart,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

//...............................delete product from add to cart........................../

exports.deleteProductFromCart = async (req, res) => {
	try {
		//destructured product id from req.params
		const { productId } = req.params;

		//validation
		if (!productId) {
			return res.status(404).json({
				success: false,
				message: 'Product id is required',
			});
		}

		// Find the cart for the current user
		let cart = await Cart.findOne({ user: req.user.id });

		// Find the index of the product in the cart items array
		const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));

		// If the product is not in the cart, return an error
		if (itemIndex === -1) {
			return res.status(404).json({ message: 'Product not found in cart' });
		}

		const a = cart.items[itemIndex].quantity;
		//delete product from the cart

		const newCart = await Cart.findByIdAndUpdate(
			cart._id,
			{
				$pull: {
					items: {
						product: {
							$in: [productId],
						},
					},
				},
			},
			{
				new: true,
			}
		);

		// Recalculate total quantity and total price

		cart.totalQuantity = newCart.items.reduce((total, item) => total + item.quantity, 0);
		cart.totalPrice = newCart.items.reduce((total, item) => total + item.price, 0);

		await cart.save();
		//make update into product quantity

		const findProduct = await Product.findById(productId);
		if (newCart) {
			const ProductUpdate = await Product.findByIdAndUpdate(productId, {
				$set: {
					qty: findProduct.qty + a,
				},
			});
		}
		//response

		res.status(200).json({
			success: true,
			message: 'Product deleted succefully from cart',
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Internal Server error',
		});
	}
};

//...........................................create order........................................./

exports.createOrder = async (req, res) => {
	try {
		//destructured feild from req.body

		const { productId, qty } = req.body;
		const userId = req.user.id;

		// Retrieve the user's cart items
		const cart = await Cart.findOne({ user: userId }).populate('items.product');

		if (!cart) {
			return res.status(404).json({ message: 'Cart not found' });
		}

		//validation

		if (productId || qty) {
			const findProduct = await Product.findById(productId);

			if (!findProduct) {
				return res.json({
					success: false,
					message: 'Product is not  exist',
				});
			}

			//check that stock is available for that product or not

			const avilableQty = findProduct.qty;

			if (qty > avilableQty) {
				return res.json({
					success: false,
					message: `only ${avilableQty} of this avilable`,
				});
			}

			// Calculate item price
			const itemPrice = findProduct.price * qty;

			const itemArray = {
				product: productId,
				price: itemPrice,
				quantity: qty,
			};

			//create new order

			totalPrice = itemArray.price;

			const ab = await Order.create({
				user: userId,
				items: [itemArray],
				totalPrice: itemPrice,
			});

			//update atual quantity of product

			const updatedProduct = await Product.findByIdAndUpdate(productId, {
				$set: {
					qty: findProduct.qty - qty,
				},
			});
			//response

			res.status(200).json({
				success: true,
				message: 'Order created Succefully a',
				data: ab,
			});
		} else {
			//find user cart

			const newCart = await Cart.findOne({ user: userId });

			if (!newCart) {
				return res.json({
					success: false,
					message: 'Cart is not exist',
				});
			}

			//calculate total price from cart items

			let totalPrice = 0;
			const items = newCart.items.map((item) => {
				totalPrice = totalPrice + item.price * item.quantity;

				return {
					product: item.product,
					quantity: item.quantity,
					price: item.price,
				};
			});

			//create new order

			const newOrder = await Order.create({
				user: userId,
				items: items,
				totalPrice: totalPrice,
			});

			// Clear the user's cart after creating the order

			cart.items = [];
			cart.totalPrice = 0;
			cart.totalQuantity = 0;
			await cart.save();

			//response

			res.status(200).json({
				success: true,
				message: 'Order created Succefully',
				data: newOrder,
			});
		}
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'Internal server error',
		});
	}
};

//..........................view his/her order.........................../

exports.getOrder = async (req, res) => {
	try {
		//take userId from req.user

		const userId = req.user.id;

		//fetch order

		const ViewOrders = await Order.findOne({ user: userId });
		if (!ViewOrders) {
			return res.json({
				success: false,
				message: 'No oredrs found',
			});
		}

		//response

		res.status(400).json({
			success: true,
			message: 'Orders fetched Successfully',
			orders: ViewOrders,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Internal Server error',
		});
	}
};

//................................cancel order....................................................................../

exports.cancelOrder = async (req, res) => {
	try {
		//destructured orderId from req.params

		const { orderId } = req.params;

		//validation

		if (!orderId) {
			return res.json({
				success: false,
				message: 'Order id is required',
			});
		}

		//check that order is exist or not

		const findOrder = await Order.findById(orderId);

		if (!findOrder) {
			res.status(404).json({
				success: false,
				message: 'Order not found',
			});
		}

		//delete order by id
		const deleteOrder = await Order.findByIdAndDelete(orderId);

		// //make update in product quantity

		const response = await findOrder.items.map(async (item) => {
			// Update product quantity
			await Product.findByIdAndUpdate(
				item.product,
				{ $inc: { qty: item.quantity } }, // Increment the quantity by the item's quantity
				{ new: true }
			);
		});

		//response

		res.status(200).json({
			success: true,
			message: 'Order cancel successfully',
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};
