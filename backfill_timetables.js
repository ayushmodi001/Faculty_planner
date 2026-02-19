const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const timetable = {
    Monday: [{ startTime: "10:00", endTime: "11:00" }, { startTime: "14:00", endTime: "15:00" }],
    Tuesday: [{ startTime: "11:00", endTime: "12:00" }, { startTime: "15:00", endTime: "16:00" }],
    Wednesday: [{ startTime: "10:00", endTime: "11:00" }, { startTime: "14:00", endTime: "15:00" }],
    Thursday: [{ startTime: "09:00", endTime: "10:00" }, { startTime: "13:00", endTime: "14:00" }],
    Friday: [{ startTime: "14:00", endTime: "15:00" }]
};

const GroupSchema = new mongoose.Schema({
    name: String,
    subjects: [String],
    timetable: mongoose.Schema.Types.Map
}, { strict: false }); // Strict false to allow updating fields not in partial schema

const FacultyGroup = mongoose.models.FacultyGroup || mongoose.model('FacultyGroup', GroupSchema);

async function backfillTimetables() {
    if (!process.env.MONGODB_URI) {
        console.error("No MONGODB_URI");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const groups = await FacultyGroup.find({});
    console.log(`Found ${groups.length} groups.`);

    for (const group of groups) {
        // Check if timetable is missing or empty
        const hasTimetable = group.timetable && Object.keys(group.timetable || {}).length > 0;

        if (!hasTimetable) {
            console.log(`Backfilling timetable for group: ${group.name}`);
            // Mongoose Map update requires special handling or set()
            // Using updateOne to force set the field
            await FacultyGroup.updateOne(
                { _id: group._id },
                { $set: { timetable: timetable } }
            );
        } else {
            console.log(`Group ${group.name} already has a timetable.`);
        }
    }

    console.log("Backfill complete.");
    await mongoose.disconnect();
}

backfillTimetables().catch(console.error);
