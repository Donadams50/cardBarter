
import express from "express";

import {
  verifyToken,
 
  isAdminOrSubadmin,

} from "../helpers/jwtTokenUtils";

require('../cloudinary/cloudinary.js')
const upload = require('../cloudinary/multer.js');


import * as  files from "./files.controller";


import * as validator from '../validators/validator';

const {
    expressValidator,
    postFileValidator,
} = validator;


const router = express.Router();
router.post("/upload", verifyToken, upload.single("file"), files.uploadFile);



export { router as uploadFileRouter };

