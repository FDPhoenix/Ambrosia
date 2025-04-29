const express = require('express');
const { searchByNameAndCategory, listAllDish, getDish, addDish, updateDishStatus, updateDish, getDishDetail } = require('../controllers/DishController');
const dishRouter = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

dishRouter.use(express.json());

dishRouter.get('/', searchByNameAndCategory);
dishRouter.get('/all', listAllDish);
dishRouter.get('/admin/all', getDish);
dishRouter.get('/detail/:id', getDishDetail);
dishRouter.post("/add", upload.single("image"), addDish);
dishRouter.put("/update/:id", upload.single("image"), updateDish);
dishRouter.patch("/hide/:id", updateDishStatus);

module.exports = dishRouter;

