const jwt = require('jsonwebtoken');
require('dotenv').config();

//.........................Authantication......................

exports.auth = async (req, res, next) => {
	try {
		//destructured token from req.cookie

		const { token } = req.cookies;

		//validation
		if (!token) {
			return res.json({
				success: false,
				message: 'Token missing',
			});
		}

		//try to decode token

		try {
			const decode = await jwt.decode(token, process.env.SECRET_KEY);

			req.user = decode;
		} catch (error) {
			console.log(error);
			res.json({
				success: false,
				message: 'Found some error while decoding token',
			});
		}
		next();
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'Found some error in authantication',
		});
	}
};

//...........................authorization................................/

//user

exports.isUser = async (req, res, next) => {
	try {
		if (req.user.role !== 0) {
			return res.json({
				success: false,
				message: 'You can not access this resource',
			});
		}
		next();
	} catch (error) {
		consolelog(error);
		res.json({
			success: false,
			message: 'Found some error while  check role of user',
		});
	}
};

//admin

exports.isAdmin = async (req, res, next) => {
	try {
		if (req.user.role !== 1) {
			return res.json({
				success: false,
				message: 'You can not access this resource',
			});
		}
		next();
	} catch (error) {
		consolelog(error);
		res.json({
			success: false,
			message: 'Found some error while  check role of admin',
		});
	}
};
