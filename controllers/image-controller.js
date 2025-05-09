const Image = require("../models/image");
const {uploadToCloudinary} = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary")

const uploadImageController=async(req,res)=>{
    try{
        //check if file is missing in req object

        if(!req.file){
            return res.status(400).json({
                success:false,
                message : "File is not present. Please upload an image"
            })
        }

        //upload to cloudinary

        const {url,publicId}= await uploadToCloudinary(req.file.path)

        //store the image url and public id along with the uploaded user id in database

        const newlyUploadedImage=new Image({
            url,
            publicId,
            uploadedBy : req.userInfo.userId

        })

        await newlyUploadedImage.save();

        //delete the file from localstorage

        //fs.unlinkSync(req.file.path);

        res.status(201).json({
            success :true,
            message : "Image uploaded successfully",
            image : newlyUploadedImage
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Something went wrong! Please try again"
        })
        
    }
}
//fetch
const fetchImagesController = async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page-1)*limit;

        const sortBy = req.query.sortBy || 'createdat' ;
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1 ;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages/limit)

        const sortObj = {};
        sortObj[sortBy] = sortOrder
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        if(images){
            res.status(200).json({
                success : true,
                currentPage : page,
                totalPages : totalPages,
                totalImages : totalImages,
                data : images
            })
        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Something went wrong! Please try again"
        })
    }
}

//delete imageController

const deleteImageController = async(req,res)=>{
    try{
        const getCurrentImageId = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getCurrentImageId);
        if(!image) {
            return res.status(404).json({
                success:false,
                message : "Image not found"
            })
        }

        //check if the current user uploaded that image or not to delete this image

        if(image.uploadedBy.toString() !== userId){
            return res.status(403).json({
                success : false,
                message : "You are not authorized to delete this image"
            })
        }

        //delete this image first from cloudinary storage
        await cloudinary.uploader.destroy(image.publicId);

        //delete it from mongodb database

        await Image.findByIdAndDelete(getCurrentImageId);

        res.status(200).json({
            success : true,
            message : "Image deleted successfully"
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Something went wrong! Please try again"
        })
    }
}
module.exports ={
    uploadImageController,
    fetchImagesController,
    deleteImageController
}