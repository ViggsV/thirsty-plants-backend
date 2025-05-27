const Plant = require("../Models/Plant");
const User = require("../Models/User");

exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPlant = async (req, res) => {
  console.log("addPlant");
  console.log(req.headers);
  console.log(req.body);

  const userToken = req.headers.authorization.split(" ")[1];

  console.log(userToken);

  if (!userToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userInDB = await User.findOne({ token: userToken });

  console.log(userInDB);

  if (!userInDB) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const plant = new Plant({
    title: req.body.title,
    description: req.body.description,
    wateringFrequency: req.body.wateringFrequency,
    userId: userInDB._id,
  });
  try {
    const newPlant = await plant.save();
    res.status(201).json(newPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
