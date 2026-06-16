// @ts-nocheck
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { v4 as uuidv4 } from 'uuid';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  buffer: Buffer,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const publicId = `carevo/${uuidv4()}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed: No result'));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function getSignedDownloadUrl(
  url: string,
): Promise<string> {
  return url;
}

export async function deleteFromCloudinaryByUrl(url: string): Promise<void> {
  try {
    const urlParts = url.split('/');
    const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(parseInt(part.substring(1))));
    
    if (versionIndex !== -1 && urlParts.length > versionIndex + 1) {
      const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/');
      const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;
      
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
  }
}

export { cloudinary };
