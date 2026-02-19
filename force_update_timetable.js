const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define a simple JSON structure for timetable
const newTimetable = {
    Monday: [
        { startTime: "10:00", endTime: "11:00", room: "LT-1" },
        { startTime: "14:00", endTime: "15:00", room: "LT-1" }
    ],
    Tuesday: [
        { startTime: "11:00", endTime: "12:00", room: "Lab-2" }
    ],
    Wednesday: [
        { startTime: "10:00", endTime: "11:00", room: "LT-1" },
        { startTime: "15:00", endTime: "16:00", room: "LT-1" }
    ],
    Thursday: [
        { startTime: "09:00", endTime: "10:00", room: "LT-3" }
    ],
    Friday: [
        { startTime: "14:00", endTime: "15:00", room: "LT-1" }
    ]
};

async function forceUpdate() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Find piet-cse-7th
    // Using strict: false model to bypass schema if needed, but schema should support Map
    const FacultyGroup = mongoose.models.FacultyGroup || mongoose.model('FacultyGroup', new mongoose.Schema({}, { strict: false }));

    const group = await FacultyGroup.findOne({ name: "piet-cse-7th" });
    if (!group) {
        console.log("Group not found!");
    } else {
        console.log("Updating group:", group.name);

        // Use updateOne to completely replace the timetable field
        const res = await FacultyGroup.updateOne(
            { _id: group._id },
            { $set: { timetable: newTimetable } }
        );
        console.log("Update result:", res);

        // Verify
        const updated = await FacultyGroup.findById(group._id).lean();
        console.log("New Timetable Keys:", Object.keys(updated.timetable || {}));
    }

    await mongoose.disconnect();
}

forceUpdate().catch(console.error);
