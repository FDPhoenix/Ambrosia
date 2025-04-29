const Category = require("../models/Category");
const Dish = require("../models/Dish");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // Lấy toàn bộ danh mục

        return res.status(200).json({
            message: "Categories retrieved successfully.",
            success: true,
            categories
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error.",
            success: false
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Kiểm tra xem danh mục đã tồn tại chưa
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists.",
                success: false
            });
        }

        const newCategory = new Category({ name, description });
        await newCategory.save();

        return res.status(201).json({
            message: "Category added successfully.",
            success: true,
            category: newCategory
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error.",
            success: false
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: "Không tìm thấy danh mục.",
                success: false
            });
        }

        if (name !== undefined) category.name = name;
        if (description !== undefined) category.description = description;

        await category.save();

        return res.status(200).json({
            message: "Cập nhật danh mục thành công.",
            success: true,
            category
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ.",
            success: false
        });
    }
};

exports.hideCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: "Không tìm thấy danh mục.",
                success: false
            });
        }

        
        if (!category.isHidden) {
            const dishesCount = await Dish.countDocuments({ categoryId: id });
            if (dishesCount > 0) {
                return res.status(400).json({
                    message: `Có ${dishesCount} món ăn thuộc danh mục này.`,
                    success: false
                });
            }
        }

        category.isHidden = !category.isHidden;
        await category.save();

        return res.status(200).json({
            message: `Danh mục đã được ${category.isHidden ? "ẩn" : "hiển thị"} thành công.`,
            success: true,
            category
        });
    } catch (error) {
        console.error("Lỗi khi ẩn danh mục:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ.",
            success: false
        });
    }
};
