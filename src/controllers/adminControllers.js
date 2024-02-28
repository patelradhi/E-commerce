const User = require('../schema/userSchema');
const Order = require('../schema/orderSchema');
const Product = require('../schema/productSchema');
const Category = require('../schema/categorySchema');
const { isFileTypeSupported } = require('../utils');
const { fileUploadToCloudinary } = require('../utils');
const cloudinary = require('cloudinary').v2;

//......................................Category................................................................./

//.........................create category......................................../

exports.createCategory = async (req, res) => {
	try {
		//destructured category name from req.body

		const { categoryName } = req.body;

		//validation

		if (!categoryName) {
			return res.status(400).json({
				success: false,
				message: 'Provide category name',
			});
		}

		//create entry in db

		const response = await Category.create({ categoryName });

		//response

		res.status(200).json({
			success: true,
			message: 'Category created successfully',
			data: response,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while creating category',
		});
	}
};

//.........................update category......................................../

exports.updateCategory = async (req, res) => {
	try {
		//destructured category name from req.body

		const { categoryName } = req.body;

		//destructured category name from req.params

		const { Id } = req.params;

		//validation

		if (!categoryName || !Id) {
			return res.status(400).json({
				success: false,
				message: 'Provide category name and Id',
			});
		}

		//check that category is exist or not

		const existCategory = await Category.findOne({ _id: Id });

		if (!existCategory) {
			return res.status(400).json({
				success: false,
				message: 'Category is not exist',
			});
		}

		//create entry in db

		const response = await Category.findOneAndUpdate(
			{ _id: Id },
			{
				$set: {
					categoryName: categoryName,
				},
			}
		);

		//response

		res.status(200).json({
			success: true,
			message: 'Category updated successfully',
			data: response,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while updating category',
		});
	}
};

//.........................delete category......................................../

exports.deleteCategory = async (req, res) => {
	try {
		//destructured category name from req.params

		const { Id } = req.params;

		//validation

		if (!Id) {
			return res.status(400).json({
				success: false,
				message: 'Provide category id',
			});
		}

		//check that category is exist or not

		const existCategory = await Category.findOne({ _id: Id });

		if (!existCategory) {
			return res.status(400).json({
				success: false,
				message: 'Category is not exist',
			});
		}

		//create entry in db

		const response = await Category.findByIdAndDelete({ _id: Id });

		//response

		res.status(200).json({
			success: true,
			message: 'Category deleted successfully',
			data: response,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while deleting category',
		});
	}
};

//.........................views category......................................../

exports.getAllCategory = async (req, res) => {
	try {
		const allCategory = await Category.find();

		//response

		res.status(200).json({
			success: true,
			message: 'Category get successfully',
			data: allCategory,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while getting category',
		});
	}
};

//............................................ Products............................................................./

//............create products.................................../

exports.createProduct = async (req, res) => {
	try {
		//destructured feilds from req.body

		const { name, price, description, qty, categoryId } = req.body;
		console.log('body', req.body);

		const productImg = req.files.img;
		console.log('files', req.files);
		console.log('productImg', productImg);

		//validation

		if (!name || !price || !description || !qty || !productImg || !categoryId) {
			return res.status(400).json({
				success: false,
				message: 'All fiels are required',
			});
		}

		//check if category is exist or not

		const ans = await Category.findById(categoryId);
		console.log('ans', ans);

		if (!ans) {
			return res.json({
				success: false,
				message: 'Category is not exist',
			});
		}

		//check if file type supported or not

		const supportedFile = ['jpg', 'jpeg', 'png'];
		const fileType = productImg.name.split('.')[1].toLowerCase();

		console.log(fileType);

		if (!isFileTypeSupported(fileType, supportedFile)) {
			return res.status(415).json({
				message: 'File format not supported',
			});
		}

		//file upload to cloudinary
		const response = await fileUploadToCloudinary(productImg, 'E-commerce');
		console.log(response);

		if (!response) {
			return res.status(400).json({
				success: false,
				message: 'file not upload to cloudinary',
			});
		}

		console.log(response);

		//entry in db

		const createdProduct = await Product.create({
			name,
			price,
			description,
			qty,
			categoryId: categoryId,
			img: response.secure_url,
			public_id: response.public_id,
		});

		createdProduct.secure_url = undefined;
		createdProduct.public_id = undefined;
		createdProduct.img = undefined;
		//response

		res.status(200).json({
			success: true,
			message: 'Product created successfully',
			data: createdProduct,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while creating products',
		});
	}
};

//............update products................................................/

exports.updateProduct = async (req, res) => {
	try {
		//destructured feilds from req.body

		const { productId } = req.params;
		const { name, price, description, qty, categoryId } = req.body;
		console.log('body', req.body);

		const productImg = req.files.img;

		//validation

		if (!productId) {
			return res.json({
				success: false,
				message: 'Provide Product Id',
			});
		}

		//check if category is exist or not
		if (categoryId) {
			const ans = await Category.findById(categoryId);

			if (!ans) {
				return res.json({
					success: false,
					message: 'Category is not exist',
				});
			}
		}

		//check if file type supported or not

		const supportedFile = ['jpg', 'jpeg', 'png'];
		const fileType = productImg.name.split('.')[1].toLowerCase();

		console.log(fileType);

		if (!isFileTypeSupported(fileType, supportedFile)) {
			return res.status(415).json({
				message: 'File format not supported',
			});
		}

		//file upload to cloudinary
		const response = await fileUploadToCloudinary(productImg, 'E-commerce');
		console.log(response);

		if (!response) {
			return res.status(400).json({
				success: false,
				message: 'file not upload to cloudinary',
			});
		}

		console.log('response', response);

		//fetch old data

		const oldProduct = await Product.findOne({ _id: productId });
		console.log('old', oldProduct);

		//entry in db
		const updated = await Product.findByIdAndUpdate(
			{ _id: productId, categoryId: categoryId },
			{
				$set: {
					name: name,
					price: price,
					description: description,
					qty: qty,
					categoryId: categoryId,
					img: response.secure_url,
					public_id: response.public_id,
				},
			}
		);

		updated.secure_url = undefined;
		updated.public_id = undefined;
		updated.img = undefined;

		//post update at cloudinary........................

		// Public ID of the image you want to delete
		const publicId = oldProduct.public_id;

		// Delete image
		cloudinary.uploader.destroy(publicId, (error, result) => {
			if (error) {
				console.error('Error deleting image:', error);
			} else {
			}
		});

		//response

		res.status(200).json({
			success: true,
			message: 'Product updating successfully',
			data: updated,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while updating products',
		});
	}
};

//............delete products................................................/

exports.deleteProduct = async (req, res) => {
	try {
		//destructured category name from req.params

		const { productId } = req.params;

		//validation

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: 'Provide product id',
			});
		}

		//check that category is exist or not

		const existProduct = await Product.findOne({ _id: productId });

		if (!existProduct) {
			return res.status(400).json({
				success: false,
				message: 'Product is not exist',
			});
		}

		//delete post from db

		const response = await Product.findByIdAndDelete({ _id: productId });

		// Function to delete image from Cloudinary
		async function deleteImageFromCloudinary(publicId) {
			try {
				const result = await cloudinary.uploader.destroy(publicId);
				console.log('Deleted image:', result);
			} catch (error) {
				console.error('Error deleting image:', error);
			}
		}

		const publicId = existProduct.public_id;

		deleteImageFromCloudinary(publicId);

		//response

		res.status(200).json({
			success: true,
			message: 'Product deleted successfully',
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while deleting product',
		});
	}
};

//...........................views all products...................................../

exports.viewAllProduct = async (req, res) => {
	try {
		//find product from db

		const allProduct = await Product.find();

		//response

		res.status(200).json({
			success: true,
			message: 'Product fetched successfully',
			allproducts: allProduct,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while fetching product',
		});
	}
};

//..........................view all ordera.........................../

exports.getAllOrdersList = async (req, res) => {
	try {
		//fetch order

		const ViewOrdersList = await Order.find().populate('user', '-password').exec();
		if (!ViewOrdersList) {
			return res.json({
				success: false,
				message: 'No oredrs found',
			});
		}

		//response

		res.status(400).json({
			success: true,
			message: 'Orders fetched Successfully',
			orders: ViewOrdersList,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Internal Server error',
		});
	}
};
