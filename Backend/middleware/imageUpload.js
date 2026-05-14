import multer from "multer";

// Configure multer to store uploaded files in memory as Buffer objects
const storage = multer.memoryStorage();

// Only allow image files (e.g., PNG, JPEG) and reject other file types (e.g., PDF, DOCX)
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        // If the file is not an image (e.g., PDF, DOCX), reject it with an error
        cb(new Error(`Only image files are allowed for ${file.fieldname}!`), false);
    }
};

// Limit file size to 5MB and only allow image files (e.g., PNG, JPEG)
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

export default upload;