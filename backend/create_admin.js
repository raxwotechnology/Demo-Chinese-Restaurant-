const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const adminEmail = "admin@example.com"; 
    const adminPassword = "admin123password"; 

    // Delete existing admin if any
    await User.deleteOne({ email: adminEmail });
    console.log("Existing admin deleted (if any).");

    const admin = new User({
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword, // Model will hash this automatically
      role: "admin",
      isActive: true
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    
    process.exit();
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
