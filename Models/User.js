const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: false, unique: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  token: { type: String, default: null },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);


// useSchema is calling two arguments; 'save', and async function(next) {...}
// async function(next) is a callback function that will be executed before the document is saved to the database.
// The 'next' function is also a callback function that must be called to continue the save operation.
// bcrypt.hash is an asynchronous function, hence we use async/await to handle it.
// await pauses the operation until password hashing is complete. Then it calls next() to continue the save operation.