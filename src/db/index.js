import mongoose from 'mongoose';

let isConnected = false; // Track the connection status

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_SRV}/${process.env.DB_NAME}`, {
      useNewUrlParser: true, // Ensures the new connection string parser is used.
      useUnifiedTopology: true, // Enables the new unified topology layer for better connection management.
    });

    // Check if the connection is established
    isConnected = connectionInstance.connection.readyState === 1;
    if (!isConnected) {
      throw new Error('MongoDB connection failed');
    }
    console.info(`MongoDB Connected Successfully, DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('connectDB error:', error);
    throw error;
  }
}

export default connectDB
