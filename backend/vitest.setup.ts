import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Use Node.js 20.6+ native env file loading
  process.loadEnvFile(path.resolve(__dirname, '.env.test'));
} catch (error) {
  console.error('Failed to load .env.test', error);
}
