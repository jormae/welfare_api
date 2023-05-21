const express = require("express");
const connection = require("../config/database-connection");
const multer  =   require('multer');
const path = require('path')

const app = express();
app.use(express.json());

const storage =   multer.diskStorage({
    destination: function (req, file, callback) {
    callback(null, 'uploads/payment-slip'); //upload folder
    },
    filename: function (req, file, callback) {
    callback(null, Date.now()+path.extname(file.originalname));
    }
  });
  const upload = multer({ storage : storage}).single('slip'); //form element name
  
const uploadInfo = function (req, res, next) {
    //   const file = req.params.slip //api
      const file = req.params.slip  //react form
    //   console.log('file name ='+file)
        try {
          // if(file){
            upload(req,res,function(err) {
                if(err) {
                    return res.end("Error uploading file.");
                }
            //   req.paymentFilePath = req.file.path //***api upload file
             
              if(req.file){
                req.paymentFilePath = req.file.filename //***react form upload file
                console.log(req.paymentFilePath)
                next();
              }
              else{
                req.paymentFilePath = null
                next();
              }

            });
         
        } catch (err) {
          console.log(err);
          return res.status(500).send();
        } 
    }

module.exports = uploadInfo;