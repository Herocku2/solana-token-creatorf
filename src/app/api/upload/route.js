import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configuración de Filebase
const filebaseKey = process.env.FILEBASE_KEY;
const filebaseSecret = process.env.FILEBASE_SECRET;
const filebaseBucket = process.env.FILEBASE_BUCKETNAME;
const filebaseGateway = process.env.FILEBASE_GATEWAY;

// Inicializar S3 client
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: filebaseKey,
  secretAccessKey: filebaseSecret,
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  s3ForcePathStyle: true
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'image' o 'json'
    const name = formData.get('name') || uuidv4();
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Manejar diferentes tipos de archivos
    if (type === 'json') {
      const jsonData = JSON.parse(formData.get('jsonData'));
      const result = await uploadJsonToS3(jsonData, name);
      return NextResponse.json({ success: true, url: result });
    } else {
      // Convertir el archivo a buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadFileToS3(buffer, name, file.type);
      return NextResponse.json({ success: true, url: result });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Error uploading file' },
      { status: 500 }
    );
  }
}

// Función para subir JSON a S3
async function uploadJsonToS3(jsonObject, fileName) {
  const jsonContent = JSON.stringify(jsonObject);
  const body = Buffer.from(jsonContent);

  const params = {
    Bucket: filebaseBucket,
    Key: fileName,
    ContentType: 'application/json',
    Body: body,
    ACL: 'public-read',
  };

  const upload = await s3.putObject(params).promise();
  const CID = upload.$response.httpResponse.headers["x-amz-meta-cid"];
  return `${filebaseGateway}/${CID}`;
}

// Función para subir archivos a S3
async function uploadFileToS3(buffer, fileName, contentType) {
  const params = {
    Bucket: filebaseBucket,
    Key: fileName,
    ContentType: contentType,
    Body: buffer,
    ACL: 'public-read',
  };

  const upload = await s3.putObject(params).promise();
  const CID = upload.$response.httpResponse.headers["x-amz-meta-cid"];
  return `${filebaseGateway}/${CID}`;
}