const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('✖  MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`✔  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`✖  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () =>
  console.warn('⚠  MongoDB disconnected — attempting to reconnect…')
);
mongoose.connection.on('reconnected', () =>
  console.log('✔  MongoDB reconnected')
);

module.exports = connectDB;
