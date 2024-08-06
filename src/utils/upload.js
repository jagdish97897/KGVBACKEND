import 'dotenv/config';
import AWS from 'aws-sdk';

export const uploadToS3 = async (req, res) => {

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        apiVersion: '2010-12-01'
    });

    try {
        const uploadPromises = req.files.map((file) => {
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET,
                Key: file.originalname, // Use the original file name as the S3 key
                Body: file.buffer,
                ContentType: file.mimetype, // Set the appropriate content type
            };

            return s3.upload(uploadParams).promise();
        });

        const results = await Promise.all(uploadPromises);

        const uploadedFiles = results.map(result => result.Location);

        res.send(`Files uploaded successfully to: ${uploadedFiles.join(', ')}`);

    } catch (error) {
        console.error('Error uploading files to S3:', error.message);
        res.status(500).send('Error uploading files');
    }
}