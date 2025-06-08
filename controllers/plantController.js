const Plant = require("../Models/Plant");
const User = require("../Models/User");
const Authenticate = require("../middleware/authMiddleware");


exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPlant = async (req, res) => {
  try {
    const plant = new Plant({
      title: req.body.title,
      description: req.body.description,
      wateringFrequency: req.body.wateringFrequency,
      userId: req.user.id, // comes from JWT
    });

    const newPlant = await plant.save();
    res.status(201).json(newPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
