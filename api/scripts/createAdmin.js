// Creates the owner account for ADMIN_EMAIL, or resets its password if it already exists.
// Usage: npm run create-admin
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import readline from 'readline/promises';
import User from '../models/user.model.js';
dotenv.config();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!email) {
  console.error('Set ADMIN_EMAIL in the .env file first.');
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const password = process.env.ADMIN_PASSWORD || (await rl.question(`Password for ${email}: `));
rl.close();
if (password.length < 6) {
  console.error('Password must be at least 6 characters.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO);
const hashedPassword = bcryptjs.hashSync(password, 10);
const existing = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

if (existing) {
  existing.email = email;
  existing.password = hashedPassword;
  await existing.save();
  console.log(`Password reset for ${email}.`);
} else {
  let username = email.split('@')[0];
  if (await User.exists({ username })) username += Math.floor(Math.random() * 10000);
  await User.create({ username, email, password: hashedPassword });
  console.log(`Owner account created for ${email} (username: ${username}).`);
}

await mongoose.disconnect();
