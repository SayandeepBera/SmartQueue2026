import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import sharp from 'sharp';

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary from buffer
export const uploadToCloudinary = async (buffer, folder = "destinations", resourceType = "image") => {
    try {
        // Optimize image using sharp
        const optimizeBuffer = await sharp(buffer).resize({
            width: 1200,
            withoutEnlargement: true
        })
            .jpeg({ quality: 80 })
            .toBuffer();

        return new Promise((resolve, reject) => {
            // Create upload stream
            const uploadStream = cloudinary.v2.uploader.upload_stream(
                {
                    folder,
                    resource_type: resourceType,
                    access_mode: "public"
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        format: result.format,
                        resource_type: result.resource_type
                    });
                }
            );

            // Convert buffer to stream and pipe to uploadStream
            streamifier.createReadStream(optimizeBuffer).pipe(uploadStream);
        });
    } catch (error) {
        console.error("Image Optimization Error:", error);
        throw error;
    }
};

// Delete image from Cloudinary by public_id
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        // Find and delete the image by public_id
        const res = await cloudinary.v2.uploader.destroy(publicId, { resource_type: resourceType });
        return res;
    } catch (error) {
        throw error;
    }
};