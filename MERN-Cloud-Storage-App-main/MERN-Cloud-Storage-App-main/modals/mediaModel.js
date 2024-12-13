import mongoose from "mongoose";

const fileSchema = mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    visible: {
        type: String,
        required: true
    },
    keywords: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    size: {
        type: Number, // File size in bytes
        required: true
    },
    cloudinaryUrl: {
        type: String, // Store Cloudinary URL
        required: true
    }
}, { timestamps: true });

const Media = mongoose.model('media.files', fileSchema);

export default Media;