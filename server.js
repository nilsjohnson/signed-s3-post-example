const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const AWS = require('aws-sdk');

const HTTP_PORT_NUM = 3000;
const BUCKET_NAME = "bucket name here"; // put your bucket name here
const MAX_UPLOAD_SIZE = 1; // MB

app.use(bodyParser.json());
// serve the build directory
app.use(express.static(path.join(__dirname, 'build'), { index: false }));
// serve the public directory
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

AWS.config.update({
	region: 'us-east-1',
	/* you should load these from your environment */
	// accessKeyId: 'AKID', 
	// secretAccessKey: 'SECRET'
});

let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

/*
	Endpoint for getting the presigned post info
 */
app.post('/getPresignedPost', function (req, res) {
	const { fileName, fileType } = req.body;
	let contentType;

	// Figure out the appropriate content type for the file.
	// This is just an example - choose what works for what you're doing.
	switch (fileType) {
		case 'mp4':
			contentType = 'video/mp4';
			break;
		case 'mov':
			contentType = 'video/mp4';
			break;
		case 'jpg':
			contentType = 'image/jpeg';
			break;
		case 'gif':
			contentType = 'image/gif';
			break;
		default:
			contentType = "text/plain";	
	}

	let params = {
		Bucket: BUCKET_NAME,
		Expires: 60, // seconds
		Fields: {
			key: fileName, // it's better to use some form of UID here instead
			'Content-Type': contentType, // this is important for how you want the file to be treated.
										 // for example: if you dont set this form an image, it won't display in the browser.
			ACL: 'public-read',
		},
		Conditions: [
			["content-length-range", 0, 1_000_000 * MAX_UPLOAD_SIZE]
		]
	};

	s3.createPresignedPost(params, (err, data) => {
		if (err) {
			console.log('Presigning post data encountered an error', err);
			res.send(500);
		}
		else {
			console.log(`The post data for signedPost:`);
			console.log(data);
			res.json({
				url: data.url,
				fields: data.fields
			});
		}
	});
});


/*
Starts server listening.
*/
app.listen(HTTP_PORT_NUM, function () {
	console.log('App is listening on port ' + HTTP_PORT_NUM)
});
























