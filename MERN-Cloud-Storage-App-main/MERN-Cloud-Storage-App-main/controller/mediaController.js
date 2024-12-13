import fs from 'fs';
import path from 'path';
import Media from '../modals/mediaModel.js'
import Grid from 'gridfs-stream';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const conn = mongoose.connection;
let gfs, gridfsBucket;
conn.once('open', () => {
    console.log("MongoDB connection opened, initializing GridFS...");
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'media' });
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('media');
    console.log("GridFS initialized successfully.");
});


export const uploadMediaController = async (req, res) => {
    try {
        console.log("Uploading file...");

        if (!req.file) return res.status(400).json({ message: 'No file uploaded.', success: false });
        if (!req.userId) return res.status(400).json({ message: 'User ID is missing.', success: false });

        console.log("File details:", req.file);
        console.log("Request body:", req.body);

        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'media',
            resource_type: "auto",
        });

        console.log("Cloudinary upload successful:", cloudinaryResult);

        await Media.create({
            filename: cloudinaryResult.public_id,
            keywords: req.body.keywords,
            visible: req.body.visible,
            userId: req.userId,
            contentType: req.file.mimetype,
            size: req.file.size,
            cloudinaryUrl: cloudinaryResult.secure_url
        });

        console.log("Media saved to database.");
        res.status(201).json({ message: 'Media uploaded successfully.', success: true });

    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ message: 'Upload failed.', error: error.message });
    }
};



// downloadMediaController - redirect to Cloudinary URL for the file
export const downloadMediaController = async (req, res) => {
    try {
        console.log("Attempting to find media:", req.params.filename);
        const file = await Media.findOne({ filename: req.params.filename });

        if (!file) {
            console.log("File not found");
            return res.status(404).json({ message: 'Media Does Not Exist.', success: false });
        }

        // Redirect to Cloudinary URL for download
        console.log("File found, redirecting to Cloudinary URL:", file.cloudinaryUrl);
        return res.redirect(file.cloudinaryUrl); // Redirect to Cloudinary URL
    } catch (error) {
        console.error("Error while downloading media:", error.message);
        return res.status(500).json({ message: 'Error while getting the Media.', error: error.message, success: false });
    }
};

/* export const downloadMediaController = async (req, res) => {
    try {
        console.log("Attempting to find media:", req.params.filename);
        const file = await Media.findOne({ filename: req.params.filename });
        if (!file) {
            console.log("File not found");
            return res.status(404).json({ message: 'Media Does Not Exist.', success: false });
        }

        // Redirect to Cloudinary URL for download
        console.log("File found, redirecting to Cloudinary URL:", file.cloudinaryUrl);
        return res.redirect(file.cloudinaryUrl); // Redirect to Cloudinary URL for download
    } catch (error) {
        console.error("Error while downloading media:", error.message);
        return res.status(500).json({ message: 'Error while getting the Media.', error: error.message, success: false });
    }
};
 */


export const getMediaController = async (req, res) => {
    try {
        console.log("Fetching media information for:", req.params.filename);
        
        const file = await Media.findOne({ filename: req.params.filename });
        console.log(file.cloudinaryUrl);
        if (!file) {
            console.log("File not found:", req.params.filename);
            return res.status(404).json({ message: 'File Does Not Exist.' });
        }

        // If the file is an image, document, or non-video, redirect to Cloudinary URL
        if (!file.contentType.includes('video')) {
            console.log("Non-video file found, redirecting to Cloudinary URL:", file.cloudinaryUrl);
            return res.redirect(file.cloudinaryUrl);
        }

        // For video files, streaming is required
        const range = req.headers.range;
        if (range) {
            console.log("Range header present for video streaming.");

            const videoSize = file.size;
            const start = Number(range.replace(/\D/g, ""));
            const end = videoSize - 1;
            const contentLength = end - start + 1;

            console.log("Video range:", { start, end, contentLength });

            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": file.contentType,
            };

            console.log("Setting headers for video streaming:", headers);
            res.writeHead(206, headers);

            // Cloudinary streaming via its URL
            return res.redirect(file.cloudinaryUrl); // Adjust streaming method as needed for Cloudinary
        } else {
            console.log("Full file download requested. Redirecting to Cloudinary URL.");
            return res.redirect(file.cloudinaryUrl);
        }
    } catch (error) {
        console.error("Error while fetching media:", error.message);
        return res.status(500).json({ message: 'Error while getting the Media.', error: error.message, success: false });
    }
};


export const getAllMediaController = async (req, res) => {
    try {
        console.log("Fetching all publicly visible media...");
        
        const files = await Media.find({ visible: 'public' }).sort({ createdAt: 'descending' }).limit(9);

        if (files && files.length > 0) {
            return res.status(200).json({ message: 'All Media Fetched Successfully.', success: true, files });
        } else {
            return res.status(404).json({ message: 'No Media Found.', success: false });
        }
    } catch (error) {
        console.error("Error while fetching media:", error.message);
        return res.status(500).json({ message: 'Error while fetching the media.', error: error.message, success: false });
    }
};

/* export const getAllMediaController = async (req, res) => {
    try {
        const files = await Media.find({ visible: 'public' }).sort({ createdAt: 'descending' }).limit(9)
        return res.status(200).json({ message: 'All Media Fetched Successfully.', success: true, files })
    } catch (error) {
        return res.status(500).json({ message: 'Error while All the Media Content.', error, success: false })
    }
}
 */
export const getUserMediaController = async (req, res) => {
    try {
        console.log(req.userId);
        const files = await Media.find({ userId: req.userId }).sort({ createdAt: 'descending' });
        console.log(files);
        return res.status(200).json({ message: 'All User Media Fetched Successfully.', success: true, files })
    } catch (error) {
        return res.status(500).json({ message: 'Error while All the Media Content.', error, success: false })
    }
}


const __dirname = path.dirname(new URL(import.meta.url).pathname)
export const deleteMediaController = async (req, res) => {
    try {
        const { id } = req.params; // Get the media ID from the request parameters

        // Find the media in MongoDB by ID
        const media = await Media.findById(id);

        if (!media) {
            console.log("Media not found.");
            return res.status(404).json({ message: 'Media not found.', success: false });
        }

        // Determine the resource type for Cloudinary based on the content type
        let resourceType = 'image'; // Default to image
        if (media.contentType.startsWith('video/')) {
            resourceType = 'video';
        } else if (media.contentType.startsWith('application/')) {
            resourceType = 'raw'; // For other types like documents
        }

        // Delete from Cloudinary
        const cloudinaryResult = await cloudinary.uploader.destroy(media.filename, {
            resource_type: resourceType // Use the determined resource type
        }); 

         console.log("Cloudinary deletion result:", cloudinaryResult);

        // Check if the deletion was successful
        if (cloudinaryResult.result !== 'ok') {
            console.log("Error deleting media from Cloudinary.");
            return res.status(500).json({ message: 'Error deleting media from Cloudinary.', success: false });
        } 

        // Define the path to the local file
        /* const localFilePath = path.join('D:/Cloud Mini Project/Cloud/uploads/', `${media.filename}.jpg`); // Adjust the file extension as needed

        // Delete the local file
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error("Error deleting local file:", err);
                return res.status(500).json({ message: 'Error deleting local file.', success: false });
            }
            console.log("Local file deleted successfully.");
        });
 */
        // Remove from MongoDB
        await Media.findByIdAndDelete(id);
        console.log("Media deleted from MongoDB successfully.");

        return res.status(200).json({ message: 'Media deleted successfully.', success: true });

    } catch (error) {
        console.error("Error while deleting media:", error.message);
        return res.status(500).json({ message: 'Error while deleting media.', error: error.message, success: false });
    }
};
/* export const deleteMediaController = async (req, res) => {
    try {
        console.log("Deleting media with ID:", req.params.id);
        const file = await Media.findByIdAndDelete(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'Media not found', success: false });
        }

        // Delete file from Cloudinary
        await cloudinary.uploader.destroy(file.filename); // file.filename contains Cloudinary public_id

        console.log("Media deleted from Cloudinary and MongoDB");

        return res.status(200).json({ message: 'Media Deleted Successfully', success: true });
    } catch (error) {
        console.error('Error while deleting media:', error);
        return res.status(500).json({ message: 'Error while deleting the media', error: error.message, success: false });
    }
};
 */
/* export const deleteMediaController = async (req, res) => {
    try {
        console.log("Deleting media with ID:", req.params.id);  // Log the media ID
        const file = await Media.findByIdAndDelete(req.params.id);
        if (!file) {
            console.log("Media not found");
            return res.status(404).json({ message: 'Media not found', success: false });
        }

        console.log("Media found:", file.filename);  // Log the filename
        const gridFsFile = await gfs.files.findOne({ filename: file.filename });
        console.log(gridFsFile)
        if (gridFsFile) {
            console.log("Deleting from GridFS:", gridFsFile._id);  // Log the GridFS ID
            await gridfsBucket.delete(gridFsFile._id);
        }

        return res.status(200).json({ message: 'Media Deleted Successfully', success: true });
    } catch (error) {
        console.error('Error while deleting media:', error);  // Log the error
        return res.status(500).json({ message: 'Error while deleting the media', error: error.message, success: false });
    }
}; */

/* export const deleteMediaController = async (req, res) => {
    try {
        const file = await Media.findByIdAndDelete(req.params.id)
        const gridFsFile = await gfs.files.findOne({ filename: file?.filename })
        gridfsBucket.delete(gridFsFile._id);
        return res.status(200).json({ message: 'Media Deleted Successfully', success: true })
    } catch (error) {
        return res.status(500).json({ message: 'Error while getting the Media.', error, success: false })
    }
} */

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const files = await Media.find({ $or: [{ keywords: { $regex: keyword, $options: "i" }, visible: 'public' }] }).sort({ createdAt: 'descending' })
        if (files) {
            return res.status(200).json({ message: 'Searched files fetched successfully.', success: true, files })
        }
        return res.status(200).json({ message: 'Searched files Not Found', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while fetching search files', error, success: false })
    }
}


export const loadMoreFilesController = async (req, res) => {
    try {
        const perPage = 9;
        const page = req.params.page ? req.params.page : 1;
        const files = await Media.find({ visible: 'public' }).skip((page - 1) * perPage).limit(perPage).sort({ createdAt: 'descending' })
        if (files) {
            return res.status(200).json({ message: 'More files fetched successfully.', success: true, files })
        }
        return res.status(200).json({ message: 'More files dont exist.', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while loading more files', error, success: false })
    }
}

export const editMediaController = async (req, res) => {
    try {
        const { keywords, visibility } = req.body
        if (keywords || visibility) {
            await Media.findByIdAndUpdate(req.params.id, {
                keywords: keywords,
                visible: visibility
            })
            return res.status(200).json({ message: 'Media Details Updated Successfully.', success: true })
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error while updating media details.', error, success: false })
    }
}

export const deleteAllUserFilesController = async (userId) => {
    try {
        const files = await Media.find({ userId: userId })
        files.forEach(async (file) => {
            const gridFsFile = await gfs.files.findOne({ filename: file?.filename })
            await gridfsBucket.delete(gridFsFile._id)
        })
        return true;
    } catch (error) {
        return res.status(500).json({ message: 'Error while Deleting All the user Media.', error, success: false })
    }
}