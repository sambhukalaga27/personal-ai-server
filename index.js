import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import { app } from './src/app.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './.env' });
}

// Verify required environment variables
const requiredVars = [
  'PORT',
  'DB_NAME',
  'MONGODB_SRV',
  'CORS_ORIGIN',
  'ACCESS_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRY',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRY',
  'NODE_ENV',
  'GOOGLE_GENAI_MODEL',
  'GOOGLE_GENAI_API_KEY',
];
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars);
  process.exit(1);
}

await connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 9000, () => {
    console.info(`\n ⚙️ Server is running at port : ${process.env.PORT} 🚀 \n`);
  });
}

// Vercel needs to have this exported
export default app;
