const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
var multer  =   require('multer');
const { body, validationResult } = require("express-validator");

const app = express();
const path = require('path')

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get("/", (req, res) => res.send("it's uploads route"));

const storage =   multer.diskStorage({
    destination: function (req, file, callback) {
    callback(null, 'uploads/payment-slip'); //upload folder
    },
    filename: function (req, file, callback) {
    callback(null, Date.now()+path.extname(file.originalname));
    }
});
const upload = multer({ storage : storage}).single('slip'); //form element name

router.post('/payment-slip', function(req,res){
    upload(req,res,function(err) {
        // console.log(req.file)
        if(err) {
            return res.end("Error uploading file.");
        }
        console.log(req.file.path)
        res.end("File is uploaded");
        // res.status(200).json(req.file.filename);
    });
});

module.exports = router;
