const Ingredient = require('../models/Ingredient');
const jwt = require('jsonwebtoken');
const Dish = require('../models/Dish');

exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find().populate('dishId');

    res.status(200).json({
      success: true,
      ingredients: ingredients.map(ingredient => ({
        _id: ingredient._id,
        dishId: ingredient.dishId,
        name: ingredient.name,
        description: ingredient.description,
        type: ingredient.type,
        quantity: ingredient.quantity,
        status: ingredient.status
      }))
    });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

exports.getIngredientByDishId = async (req, res) => {
  const { dishId } = req.params;

  try {
    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({
      message: 'Dish not found',
      success: false
    });

    const ingredients = await Ingredient.find({ dishId: dishId });

    res.status(200).json({
      message: 'Find ingredient successfully',
      ingredients: ingredients.map(ingredient => ({
        _id: ingredient._id,
        dishId: ingredient.dishId,
        name: ingredient.name,
        description: ingredient.description,
        type: ingredient.type,
        quantity: ingredient.quantity,
        status: ingredient.status
      })),
      success: true
    });
  } catch (error) {
    console.error("Error finding ingredient:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

exports.addIngredient = async (req, res) => {
  try {
    const { dishId, name, description, type, quantity, status } = req.body;

    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({ message: "Dish not found", success: false });

    const newIngredient = new Ingredient({
      dishId,
      name,
      description,
      type,
      quantity,
      status
    });

    await newIngredient.save();

    res.status(201).json({
      success: true,
      message: "Ingredient added successfully",
      ingredient: newIngredient
    });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

exports.updateIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { name, dishId, description, type, quantity, status } = req.body;

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({
        message: "Ingredient not found",
        success: false
      });
    }

    if (name) ingredient.name = name;
    if (dishId) ingredient.dishId = dishId;
    if (description) ingredient.description = description;
    if (type !== undefined) ingredient.type = type;
    if (quantity !== undefined) ingredient.quantity = quantity;
    if (status) ingredient.status = status;

    await ingredient.save();

    res.status(200).json({
      success: true,
      message: "Ingredient updated successfully",
      ingredient
    });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) return res.status(404).json({
      message: "Ingredient not found",
      success: false
    });

    if (ingredient.status == 'Available') {
      ingredient.status = 'Unavailable';
    } else {
      ingredient.status = 'Available';
    }

    await ingredient.save();

    res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting ingredient:", error);

    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

exports.getIngredientsByType = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type query parameter is required"
      });
    }

    const ingredients = await Ingredient.find({ type }).populate('dishId');

    res.status(200).json({
      success: true,
      message: "Filtered ingredients successfully",
      ingredients: ingredients.map(ingredient => ({
        _id: ingredient._id,
        dishId: ingredient.dishId,
        name: ingredient.name,
        description: ingredient.description,
        type: ingredient.type,
        quantity: ingredient.quantity,
        status: ingredient.status
      }))
    });
  } catch (error) {
    console.error("Error filtering ingredients by type:", error);

    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};