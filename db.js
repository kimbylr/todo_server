const mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/todo', {
//   useMongoClient: true,
// });
mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`,
  { useUnifiedTopology: true, useNewUrlParser: true },
);

const db = mongoose.connection;

// listen for event 'error' – every time
db.on('error', (error) => {
  console.error('connection error: ' + error);
});

// fires first time
db.once('open', (error) => {
  console.log('DB connection successful');
});

module.exports = db;
