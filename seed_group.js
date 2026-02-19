const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const timetable = {
    Monday: [{ startTime: "10:00", endTime: "11:00" }, { startTime: "14:00", endTime: "15:00" }],
    Tuesday: [{ startTime: "11:00", endTime: "12:00" }],
    Wednesday: [{ startTime: "10:00", endTime: "11:00" }, { startTime: "15:00", endTime: "16:00" }],
    Thursday: [{ startTime: "09:00", endTime: "10:00" }],
    Friday: [{ startTime: "14:00", endTime: "15:00" }, { startTime: "15:00", endTime: "16:00" }]
};

const GroupSchema = new mongoose.Schema({
    name: String,
    subjects: [String],
    timetable: mongoose.Schema.Types.Map
});
const FacultyGroup = mongoose.models.FacultyGroup || mongoose.model('FacultyGroup', GroupSchema);

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await FacultyGroup.findOne({ name: "Demo Group (CS-Sem6)" });
    if (!existing) {
        await FacultyGroup.create({
            name: "Demo Group (CS-Sem6)",
            subjects: ["Software Testing", "Cloud Computing"],
            timetable: timetable
        });
        console.log("Created Demo Group.");
    } else {
        console.log("Demo Group already exists.");
    }

    await mongoose.disconnect();
}

seed().catch(console.error);
