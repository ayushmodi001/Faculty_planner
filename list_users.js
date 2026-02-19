const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
    name: String,
    passwordHash: { type: String, select: true }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
    if (!process.env.MONGODB_URI) {
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find({});
    let output = '--- REGISTERED USERS ---\n';
    if (users.length === 0) {
        output += 'No users found in database.\n';
    }
    users.forEach(u => {
        output += `Email: ${u.email} | Role: ${u.role} | Name: ${u.name}\n`;
    });

    fs.writeFileSync('users_list.txt', output);
    await mongoose.disconnect();
}

checkUsers().catch(console.error);
