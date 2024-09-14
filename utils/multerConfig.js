const multer = require('multer');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const SingleUpload = upload.single("image")
const multerUploads = upload.array("images", "8")

module.exports = {
  SingleUpload, multerUploads
};
