import logger from '@/utils/logger';

// Función para subir JSON a través de nuestra API
export const uploadJsonToS3 = async (jsonObject, fileName) => {
  try {
    // Crear FormData para la solicitud
    const formData = new FormData();
    formData.append('type', 'json');
    formData.append('name', fileName);
    formData.append('jsonData', JSON.stringify(jsonObject));
    formData.append('file', new Blob([JSON.stringify(jsonObject)], { type: 'application/json' }));

    // Enviar solicitud a nuestra API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error uploading JSON');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    logger.error('Error uploading JSON', { error });
    throw new Error(`Failed to upload JSON: ${error.message}`);
  }
};

// Función para subir imágenes a través de nuestra API
export const uploadImageToS3 = async (fileName, file) => {
  try {
    // Crear FormData para la solicitud
    const formData = new FormData();
    formData.append('type', 'image');
    formData.append('name', fileName);
    formData.append('file', file);

    // Enviar solicitud a nuestra API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error uploading image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    logger.error('Error uploading image', { error });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};