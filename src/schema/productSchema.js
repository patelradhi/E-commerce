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
			require: true,
		},
		public_id: {
			type: String,
			require: true,
		},

		qty: {
			type: Number,
			require: true,
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

module.exports = mongoose.model('Product', productSchema);
