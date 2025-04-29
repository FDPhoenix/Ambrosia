const Dish = require('../models/Dish')
const cloudinary = require("../config/cloudinary");
const Category = require('../models/Category');

exports.searchByNameAndCategory = async (req, res) => {
    const { name, categoryId } = req.query;
    const filter = {};

    try {
        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        const dishes = await Dish.find(filter);

        if (dishes.length == 0) {
            return res.status(404).json({
                message: 'There are no dish available',
                success: false
            })
        }

        return res.status(200).json({
            message: 'Finding dish successful',
            dishes,
            success: true
        });
    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: "An error occurred while fetching dishes.",
            success: false,
        });
    }
}

exports.listAllDish = async (req, res) => {
    try {
        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 12;

        const skip = (page - 1) * limit;

        const allDish = await Dish.find({ isAvailable: true })
            .populate({ path: "categoryId", select: "name" })
            .select("_id name imageUrl description price")
            .skip(skip)
            .limit(limit);

        const dishes = allDish.map(dish => ({
            _id: dish._id,
            name: dish.name,
            imageUrl: dish.imageUrl,
            categoryName: dish.categoryId ? dish.categoryId.name : null,
            description: dish.description,
            price: dish.price,
        }));

        const totalDishes = await Dish.countDocuments({ isAvailable: true });
        const totalPages = Math.ceil(totalDishes / limit);

        return res.status(200).json({
            message: 'All dish will display',
            currentPage: page,
            totalPages,
            totalDishes,
            dishes,
            success: true,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "An error occurred while fetching dishes.",
            success: false
        });
    }
}

exports.getDish = async (req, res) => {
    try {
        const dishes = await Dish.find()
            .populate("categoryId", "name")
            .select("_id name imageUrl price isAvailable categoryId");

        const response = dishes.map(dish => ({
            _id: dish._id,
            name: dish.name,
            imageUrl: dish.imageUrl,
            categoryName: dish.categoryId.name,
            price: dish.price,
            isAvailable: dish.isAvailable
        }));

        res.status(200).json({
            message: 'Fetching dish successful',
            response,
            success: true
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

exports.getDishDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const dish = await Dish.findById(id).populate('categoryId', 'name');

        if (!dish) {
            return res.status(404).json({
                message: "Dish not found!",
                success: false
            });
        }

        const dishData = {
            _id: dish._id,
            name: dish.name,
            imageUrl: dish.imageUrl,
            categoryName: dish.categoryId ? dish.categoryId.name : 'Unknown Category',
            description: dish.description,
            price: dish.price,
            isAvailable: dish.isAvailable
        };

        res.status(200).json({
            message: 'Fetching dish successful',
            dish: dishData,
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

exports.addDish = async (req, res) => {
    try {
        const { name, categoryId, price } = req.body;
        let imageUrl = "";

        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: "Name cannot be blank or null",
                success: false
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                message: "Category not found",
                success: false
            });
        }

        if (!price || price < 1000) {
            return res.status(400).json({
                message: "Price cannot be null or lower than 1000",
                success: false
            });
        }

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "restaurant_images" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        } else {
            return res.status(400).json({
                message: "Image is required",
                success: false
            });
        }

        const newDish = new Dish({
            categoryId,
            name,
            description: "",
            price,
            isAvailable: true,
            imageUrl,
        });

        await newDish.save();
        res.status(201).json({
            message: "Dish added successfully",
            dish: newDish,
            success: true
        });
    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

exports.updateDish = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId, price } = req.body;
        let imageUrl;

        const dish = await Dish.findById(id);
        if (!dish) {
            return res.status(404).json({
                message: "Dish not found",
                success: false
            });
        }

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "restaurant_images" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }

        dish.categoryId = categoryId || dish.categoryId;
        dish.name = name || dish.name;
        dish.price = price || dish.price;
        if (imageUrl) dish.imageUrl = imageUrl;

        await dish.save();
        res.status(200).json({
            message: "Dish updated successfully",
            dish,
            success: true
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

exports.updateDishStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;

        const dish = await Dish.findByIdAndUpdate(id, { isAvailable }, { new: true });

        if (!dish) {
            return res.status(404).json({
                message: "Dish not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Dish status updated successfully",
            success: true
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};
