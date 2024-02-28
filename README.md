# Project Overview

"E-Commerce" is a sophisticated online shopping platform that offers users a seamless and secure shopping experience. Users can easily sign up, log in, and manage their profiles. They can browse through products with pagination, create and manage carts, place orders, and view order history.

For administrators, the platform provides efficient tools for managing categories and products, ensuring a well-organized and up-to-date store

# Key Features

## Users Features

-   User Login
-   User Signup

    User can not access below functionality without his/ her authentication

-   View-Product-List --> (User can view product list by pagination)
-   Create-Cart
-   View-Cart --> (User can veiw his/her cart)
-   Update-Quantity (User can update quantity of product that is added into his/her cart)
-   Delete-Product (User can delete product that is added into his/her cart)
-   Create-Order
-   View-Order --> (User can veiw his/her order list)
-   Cancel-Order

## Admin Features

-   Create-Category
-   Update-Category
-   Delete-Category
-   View-Category
-   Create-Product
-   Update-Product
-   Delete-Product
-   View-Product
-   Get-All-Order-List

# Schema

### User-Schema

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);
```

### Category-Schema

```js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		categoryName: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);
```

### Product-Schema

```js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
		},
		img: {
			type: String,
			required: true,
		},
		public_id: {
			type: String,
			required: true,
		},

		qty: {
			type: Number,
			required: true,
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);
```

### Cart-Schema

```js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		default: 1,
	},
	price: {
		type: Number,
		required: true,
	},
});

const cartSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		items: [cartItemSchema],
		totalQuantity: {
			type: Number,
			default: 0,
		},
		totalPrice: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);
```

### Order-Schema

```js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		default: 1,
	},
	price: {
		type: Number,
		required: true,
	},
});

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		items: [orderItemSchema],
		totalPrice: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);
```
