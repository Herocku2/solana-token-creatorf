import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Configuración de Pinata
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
const pinataGateway = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

// Validar que todas las variables de entorno estén presentes
if (!pinataApiKey || !pinataSecretApiKey) {
  console.error('Missing Pinata environment variables:', {
    hasApiKey: !!pinataApiKey,
    hasSecretKey: !!pinataSecretApiKey
  });
}

export async function POST(request) {
  try {
    // Verificar variables de entorno
    if (!pinataApiKey || !pinataSecretApiKey) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'image' o 'json'
    const name = formData.get('name') || uuidv4();
    
    console.log('Upload request:', { type, name, hasFile: !!file });
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Manejar diferentes tipos de archivos
    if (type === 'json') {
      const jsonDataString = formData.get('jsonData');
      if (!jsonDataString) {
        return NextResponse.json(
          { error: 'No JSON data provided' },
          { status: 400 }
        );
      }
      
      const jsonData = JSON.parse(jsonDataString);
      const result = await uploadJsonToPinata(jsonData, name);
      console.log('JSON upload successful:', result);
      return NextResponse.json({ success: true, url: result });
    } else {
      // Convertir el archivo a buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadFileToPinata(buffer, name, file.type);
      console.log('File upload successful:', result);
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

// Función para subir JSON a Pinata
async function uploadJsonToPinata(jsonObject, fileName) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  const data = {
    pinataContent: jsonObject,
    pinataMetadata: {
      name: fileName,
      keyvalues: {
        type: 'metadata'
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataSecretApiKey
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata JSON upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return `${pinataGateway}/${result.IpfsHash}`;
}

// Función para subir archivos a Pinata
async function uploadFileToPinata(buffer, fileName, contentType) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  
  // Crear FormData usando la implementación de Node.js
  const FormData = require('form-data');
  const formData = new FormData();
  
  // Agregar el archivo como buffer
  formData.append('file', buffer, {
    filename: fileName,
    contentType: contentType
  });
  
  // Agregar metadata
  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      type: 'image'
    }
  });
  formData.append('pinataMetadata', metadata);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...formData.getHeaders(),
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataSecretApiKey
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata file upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return `${pinataGateway}/${result.IpfsHash}`;
}