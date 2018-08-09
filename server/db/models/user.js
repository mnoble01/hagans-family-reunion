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
  if (!this.password) {
    // Users can sign up with social login, so if they don't have a password
    // then don't allow password comparison
    return false;
  } else {
    return bcrypt.compareSync(password, this.password);
  }
};

mongoose.model('Users', usersSchema);

// Facebook (user id, facebook id)
// Google (user id, google id)
// Twitter (user id, twitter id)

// OR

// OpenIdAccount (user id, open id type, open id)
// type === 'facebook' || 'google' || 'twitter'

module.exports = usersSchema;
