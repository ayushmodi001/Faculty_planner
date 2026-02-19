const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixEmail() {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGODB_URI);

    const oldEmail = 'ayushmodi@paruluniveristy.ac.in';
    const newEmail = 'ayushmodi@paruluniversity.ac.in';

    const user = await User.findOne({ email: oldEmail });
    if (user) {
        console.log(`Found user with typo: ${user.email}`);
        user.email = newEmail;
        await user.save();
        console.log(`Updated to: ${user.email}`);
    } else {
        console.log('User with typo not found (maybe already fixed?)');
    }

    await mongoose.disconnect();
}

fixEmail().catch(console.error);
