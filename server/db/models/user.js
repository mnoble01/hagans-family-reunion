/* eslint-env node */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  airtableId: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
});

usersSchema.methods.setPassword = function(password) {
  this.password = bcrypt.hashSync(password, 10);
};

usersSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

mongoose.model('Users', usersSchema);

module.exports = usersSchema;
