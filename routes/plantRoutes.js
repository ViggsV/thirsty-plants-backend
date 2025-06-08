const express = require('express');
const router = express.Router();
const { getPlants, addPlant, updateTodo, deleteTodo } = require('../controllers/plantController');
const authenticate = require('../middleware/authMiddleware');

// Get all plants
router.get('/', authenticate, getPlants);

// Create new plant
router.post('/', authenticate, addPlant);

// // update a plant
// router.put("/:id", updateTodo);

// // delete a plant
// router.delete("/:id", deleteTodo);

module.exports = router;