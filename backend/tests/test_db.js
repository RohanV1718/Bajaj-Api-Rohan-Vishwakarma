import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testConnection = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('abcde')) {
    console.error('❌ MONGO_URI in backend/.env is not configured with a real connection string!');
    console.log('Please edit the backend/.env file and set your MONGO_URI.');
    process.exit(1);
  }

  try {
    console.log('Attempting connection to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connection to MongoDB Atlas successful!');
    
    // Check if we can write a test document
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.models.Test || mongoose.model('TestConnection', testSchema);
    await TestModel.create({ name: 'deskflow-conn-test' });
    await TestModel.deleteOne({ name: 'deskflow-conn-test' });
    console.log('✅ Write/Delete permission test passed!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

testConnection();
