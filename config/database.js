const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("URI:", process.env.-----);

        await mongoose.connect(process.env.-----);

        console.log("✅ MongoDB Atlas Connected Successfully");
    } catch (error) {
        console.log("❌ MongoDB Connection Failed");
        console.log(error); // পুরো Error Object দেখাবে
    }
};

module.exports = connectDB;
