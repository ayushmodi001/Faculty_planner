/**
 * seed_principal.js
 * ─────────────────
 * Seeds the first PRINCIPAL user for a fresh UAPS deployment.
 *
 * Usage:
 *   node seed_principal.js                          ← uses defaults
 *   node seed_principal.js --email p@uni.ac.in --password Secret@123 --name "Dr. Sharma"
 *   node seed_principal.js --reset                  ← re-hash & update password if user exists
 *
 * It reads MONGODB_URI from .env.local automatically.
 */

'use strict';

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const DEFAULT_EMAIL = 'principal@university.ac.in';
const DEFAULT_PASS  = 'Parul@123';
const DEFAULT_NAME  = 'Principal';

const email    = (flag('email')    || DEFAULT_EMAIL).toLowerCase().trim();
const password =  flag('password') || DEFAULT_PASS;
const name     =  flag('name')     || DEFAULT_NAME;
const forceReset = hasFlag('reset');
const skipConfirm = hasFlag('yes') || hasFlag('y');

// ── Minimal inline schema (mirrors models/User.ts) ───────────────────────────
const UserSchema = new mongoose.Schema(
    {
        email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash:      { type: String, required: true, select: false },
        role:              { type: String, enum: ['PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'ADMIN'], default: 'STUDENT' },
        name:              { type: String, required: true, trim: true },
        department_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
        mobile:            String,
        isActive:          { type: Boolean, default: true },
        mustChangePassword:{ type: Boolean, default: false },
        isInvitePending:   { type: Boolean, default: false },
        facultyGroupIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'FacultyGroup' }],
    },
    { timestamps: true }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function confirm(question) {
    return new Promise((resolve) => {
        if (skipConfirm) return resolve(true);
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question, (ans) => { rl.close(); resolve(ans.trim().toLowerCase() === 'y'); });
    });
}

function printBox(lines, color = '\x1b[36m') {
    const reset = '\x1b[0m';
    const width = Math.max(...lines.map(l => l.length)) + 4;
    const border = '─'.repeat(width);
    console.log(`${color}┌${border}┐${reset}`);
    lines.forEach(l => console.log(`${color}│  ${l.padEnd(width - 2)}│${reset}`));
    console.log(`${color}└${border}┘${reset}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('\x1b[31m✖  MONGODB_URI not found in .env.local\x1b[0m');
        process.exit(1);
    }

    printBox([
        '  UAPS Principal Seed Script',
        '',
        `  Email   : ${email}`,
        `  Name    : ${name}`,
        `  Password: ${'*'.repeat(Math.min(password.length, 12))}`,
        `  Mode    : ${forceReset ? 'Reset (update if exists)' : 'Create (skip if exists)'}`,
    ]);

    const ok = await confirm('\n  Proceed? [y/N] ');
    if (!ok) { console.log('\x1b[33m  Aborted.\x1b[0m'); process.exit(0); }

    console.log('\n  Connecting to MongoDB…');
    await mongoose.connect(uri);
    console.log('  \x1b[32m✔\x1b[0m Connected.');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check for existing
    const existing = await User.findOne({ email }).select('+passwordHash').lean();

    if (existing && !forceReset) {
        printBox([
            `  ✔  Principal already exists: ${email}`,
            '     Run with --reset to update the password.',
        ], '\x1b[33m');
        await mongoose.disconnect();
        return;
    }

    console.log('  Hashing password (bcrypt 12)…');
    const passwordHash = await bcrypt.hash(password, 12);

    if (existing && forceReset) {
        await User.updateOne({ email }, {
            $set: {
                passwordHash,
                name,
                role: 'PRINCIPAL',
                isActive: true,
                mustChangePassword: false,
                isInvitePending: false,
            }
        });
        printBox([
            `  ✔  Password reset for: ${email}`,
        ], '\x1b[32m');
    } else {
        await User.create({
            email,
            passwordHash,
            name,
            role: 'PRINCIPAL',
            isActive: true,
            mustChangePassword: false,
            isInvitePending: false,
        });
        printBox([
            '  ✔  Principal account created!',
            '',
            `     Email    : ${email}`,
            `     Password : ${password}`,
            '     Role     : PRINCIPAL',
            '',
            '  ⚠  Change this password after first login.',
        ], '\x1b[32m');
    }

    await mongoose.disconnect();
    console.log('  Disconnected. Done.\n');
}

seed().catch((err) => {
    console.error('\x1b[31m✖  Seed failed:\x1b[0m', err.message);
    mongoose.disconnect();
    process.exit(1);
});
