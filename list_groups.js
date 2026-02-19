const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const FacultyGroupSchema = new mongoose.Schema({
    name: String,
    timetable: mongoose.Schema.Types.Mixed
});
const FacultyGroup = mongoose.models.FacultyGroup || mongoose.model('FacultyGroup', FacultyGroupSchema);

async function listGroups() {
    if (!process.env.MONGODB_URI) process.exit(1);
    await mongoose.connect(process.env.MONGODB_URI);

    const groups = await FacultyGroup.find({}).lean();
    console.log('--- GROUPS ---');
    groups.forEach(g => {
        console.log(`ID: ${g._id} | Name: ${g.name} | TimetableKeys: ${Object.keys(g.timetable || {})}`);
    });

    await mongoose.disconnect();
}

listGroups().catch(console.error);
