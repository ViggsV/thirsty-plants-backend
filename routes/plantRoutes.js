const express = require('express');
const router = express.Router();
const { getPlants, addPlant, updateTodo, deleteTodo } = require('../controllers/plantController');

// Get all plants
router.get('/', getPlants);

// Create new plant
router.post('/', addPlant);

// // update a plant
// router.put("/:id", updateTodo);

// // delete a plant
// router.delete("/:id", deleteTodo);

module.exports = router;