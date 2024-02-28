const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

//......function for password hashing...................../

exports.hashpassword = async (password, num) => {
	try {
		const response = await bcrypt.hash(password, num);
		return response;
	} catch (error) {
		console.log(error);
	}
};

//.........function for check type of img/vedios

exports.isFileTypeSupported = function (fileType, supportedFile) {
	return supportedFile.includes(fileType);
};

//........function for upload img to cloudinary

exports.fileUploadToCloudinary = async (file, folder) => {
	const Options = { folder };
	Options.resource_type = 'auto';
	return await cloudinary.uploader.upload(file.tempFilePath, Options);
};
