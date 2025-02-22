import AWS from 'aws-sdk'



const filebaseKey = process.env.NEXT_PUBLIC_FILEBASE_KEY;
const filebaseSecret = process.env.NEXT_PUBLIC_FILEBASE_SECRET
const filebaseBucket = process.env.NEXT_PUBLIC_FILEBASE_BUCKETNAME
const filebaseGateway = process.env.NEXT_PUBLIC_FILEBASE_GATEWAY

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: filebaseKey,
  secretAccessKey: filebaseSecret,
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  s3ForcePathStyle: true
});




export const uploadJsonToS3 = async (jsonObject, fileName) => {
  try {
    const jsonContent = JSON.stringify(jsonObject);
    const body = Buffer.from(jsonContent);


    const params = {
      Bucket: filebaseBucket,
      Key: fileName,
      ContentType: 'application/json',
      Body: body, 
      ACL: 'public-read',
    };
    const uplaod = await s3.putObject(params).promise();
    const CID = uplaod.$response.httpResponse.headers["x-amz-meta-cid"];
    return `${filebaseGateway}/${CID}`;
  } catch (error) {
    console.error('Error uploading JSON:', error);
    throw new Error(`Failed to upload JSON: ${error.message}`);
  }
};

export const uploadImageToS3 = async (fileName, file) => {
  try {

    const params = {
      Bucket: filebaseBucket, 
      Key: fileName,
      ContentType: file.type,
      Body: file,
      ACL: 'public-read',
    };

    const uplaod = await s3.putObject(params).promise();
    const CID = uplaod.$response.httpResponse.headers["x-amz-meta-cid"];
    return `${filebaseGateway}/${CID}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};