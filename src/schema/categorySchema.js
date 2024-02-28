const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		categoryName: {
			type: String,
			require: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model('Category', categorySchema);
