const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = () => {
	mongoose
		.connect(process.env.DATABASE_URL)
		.then(() => {
			console.log('Database connected successfully');
		})
		.catch((error) => {
			console.log(error);
			console.log('Not connected');
		});
};

module.exports = dbConnection;
