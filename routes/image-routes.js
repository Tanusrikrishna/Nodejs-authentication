const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware=require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {uploadImageController, fetchImagesController,deleteImageController} = require("../controllers/image-controller");

const router = express.Router();

//upload the image

router.post("/upload",authMiddleware,adminMiddleware,uploadMiddleware.single("image"),uploadImageController);

//delete image
//680ee79d0cd23024c55b7d14
router.delete("/delete/:id",authMiddleware,adminMiddleware,deleteImageController);
//to get the images

router .get ("/get",authMiddleware,fetchImagesController);

module.exports=router;