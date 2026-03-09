const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// =========================================================
// ✏️ SET YOUR CUSTOM CREDENTIALS HERE
// =========================================================
const ADMIN_EMAIL = 'principle@paruluniversity.ac.in';
const ADMIN_PASS = 'Parul@123';
const ADMIN_NAME = 'Piet Principal';
// =========================================================

// We define a minimal schema here to interact with the database directly 
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function provisionInstitution() {
    try {
        console.log('🔄 Connecting to UAPS Database...');
        if (!process.env.MONGODB_URI) {
            throw new Error("❌ MONGODB_URI is totally missing from environment. Did you run with --env-file=.env.local ?");
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB.');

        console.log(`\n🔒 Provisioning Root Institutional Account: ${ADMIN_EMAIL}`);

        if (ADMIN_PASS.length < 8) {
            console.log('\n❌ Provisioning Aborted: Password must be at least 8 characters long.');
            process.exit(1);
        }

        // Hash password securely
        const passwordHash = await bcrypt.hash(ADMIN_PASS, 10);

        // UPSERT: This will create the user if it doesn't exist, OR update the password if it does!
        const result = await User.findOneAndUpdate(
            { role: 'PRINCIPAL' }, // Find the existing Principal
            { 
                $set: {
                    email: ADMIN_EMAIL,
                    passwordHash: passwordHash,
                    name: ADMIN_NAME,
                    isActive: true
                }
            },
            { upsert: true, new: true } // Create if missing
        );

        console.log('🚀 SUCCESS: Institutional Master Admin Updated/Created.');
        console.log(`➡️  You may now login at http://localhost:3000/login using email: ${ADMIN_EMAIL}\n`);
        
    } catch (error) {
        console.error('❌ Provisioning Failed:\n', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

provisionInstitution();
