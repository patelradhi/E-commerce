const express = require('express');
const app = express();
const dbConnection = require('./config/database');
require('dotenv').config();
const userRouters = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const { cloudinaryConnection } = require('./config/cloudinary');
//middelwares
//to parse JSON data sent in the request body
app.use(express.json());

//
app.use(cookieParser());

//for interact with file
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: '/tmp/',
	})
);

//mounting
app.use('/api/v1', userRouters);
app.use('/api/v1', adminRoutes);

//port
const PORT = process.env.PORT || 5690;

//db call
dbConnection();

//cloudinary call
cloudinaryConnection();

//server connection
app.listen(PORT, () => {
	console.log(`Server connected successfully at port number ${PORT}`);
});
