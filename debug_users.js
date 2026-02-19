const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Minimal User Schema
const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
    name: String,
    passwordHash: { type: String, select: true }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
    console.log('Connecting to DB...');
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set in .env.local");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const users = await User.find({});
    console.log('--- USERS IN DB ---');
    users.forEach(u => {
        console.log(`Email: ${u.email} | Role: ${u.role} | Name: ${u.name} | HasHash: ${!!u.passwordHash}`);
    });
    console.log('-------------------');

    await mongoose.disconnect();
}

checkUsers().catch(console.error);
