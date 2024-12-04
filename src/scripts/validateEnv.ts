import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

try {
  envSchema.parse(process.env);
  console.log('✅ Environment variables are valid');
  process.exit(0);
} catch (error) {
  console.error('❌ Invalid environment variables:', error.errors);
  process.exit(1);
}