const mongoose = require('mongoose');
const uploadMetaSchema = require('./schemas/upload-meta.schema');


const adminSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    folder: {
        type: String,
        default: '/Project/studyspher/admin',
        trim: true,
    },
    fileName: {
        type: String,
        default: '',
        trim: true,
    },
    originalFileName: {
        type: String,
        default: '',
        trim: true,
    },
    mimeType: {
        type: String,
        default: '',
        trim: true,
    },
    fileSize: {
        type: Number,
        default: 0,
        min: 0,
    },
    uploadMeta: {
        type: uploadMetaSchema,
        default: null,
    },
    labels: {
        type: [String],
        default: [],
    },
    
}, { timestamps: true })


const adminModel = mongoose.model("admin", adminSchema)

module.exports = adminModel;
