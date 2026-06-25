import axios from 'axios';
import InventoryMaterialModel from '~/models/InventoryMaterial.model';

const getOcrConfig = () => ({
  apiUrl: process.env.OCR_API_URL || 'https://api-ocr.bittechx.cloud',
  apiKey: process.env.OCR_API_KEY || 'ak_ACCESS.SECRET',
  deviceId: process.env['x-device-id'] || 'backend-server'
});

export const trainProduct = async (material: any, imagesToTrain: string[]) => {
  if (!imagesToTrain || imagesToTrain.length === 0) return;

  const numericId = parseInt(String(material._id).slice(-8), 16);

  try {
    const payload = {
      id: numericId,
      name: material.code,
      price: 1, // Tránh lỗi validation "not price" của backend python khi truyền 0
      images: imagesToTrain
    };

    console.log('payload: ', payload);

    const { apiUrl, apiKey, deviceId } = getOcrConfig();
    const response = await axios.post(`${apiUrl}/api/product/train`, payload, {
      headers: {
        'x-api-key': apiKey,
        'x-device-id': deviceId,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201) {
      await InventoryMaterialModel.findByIdAndUpdate(material._id, {
        $set: { is_embedded: true },
        $inc: { embedded_images_count: imagesToTrain.length }
      });
      console.log(`[OCR Service] Successfully trained product ${material.code}`);
    }
  } catch (error: any) {
    console.error(`[OCR Service] Error training product ${material.code}:`, error?.response?.data || error.message);
  }
};

export const updateProductEmbedding = async (material: any, newImageUrls: string[]) => {
  if (!newImageUrls || newImageUrls.length === 0) return;

  const numericId = parseInt(String(material._id).slice(-8), 16);

  try {
    const formData = new FormData();
    formData.append('product_id', String(numericId));
    formData.append('name', material.code);

    for (const [index, url] of newImageUrls.entries()) {
      const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = (imageResponse.headers['content-type'] as string) || 'image/jpeg';
      const blob = new Blob([imageResponse.data], { type: contentType });
      formData.append('image_files', blob, `image_${index}.jpg`);
    }

    const { apiUrl, apiKey, deviceId } = getOcrConfig();
    const response = await axios.post(`${apiUrl}/api/product/update_embedding`, formData, {
      headers: {
        'x-api-key': apiKey,
        'x-device-id': deviceId
      }
    });

    if (response.status === 200 || response.status === 201) {
      await InventoryMaterialModel.findByIdAndUpdate(material._id, {
        $inc: { embedded_images_count: newImageUrls.length }
      });
      console.log(`[OCR Service] Successfully updated embedding for ${material.code}`);
    }
  } catch (error: any) {
    console.error(
      `[OCR Service] Error updating product embedding ${material.code}:`,
      error?.response?.data || error.message
    );
  }
};
