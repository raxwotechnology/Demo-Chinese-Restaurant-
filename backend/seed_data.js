const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Menu = require("./models/Menu");
const Employee = require("./models/Employee");
const Order = require("./models/Order");
const Attendance = require("./models/Attendance");
const OtherExpense = require("./models/OtherExpense");
const User = require("./models/User");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Create Admin User for cashierId
    await User.deleteMany({});
    const adminUser = await new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123password", // This will be hashed by the model if there's a pre-save hook
        role: "admin"
    }).save();
    console.log("Seeded Admin User.");

    // 2. Seed Menu
    const menuItems = [
      { name: "Dim Sum Platter", description: "Assorted handmade dumplings", price: 24, cost: 8, category: "Appetizer", currentQty: 100, minimumQty: 20 },
      { name: "Peking Duck", description: "Crispy skin with pancakes", price: 68, cost: 25, category: "Signature", currentQty: 15, minimumQty: 5 },
      { name: "Kung Pao Chicken", description: "Szechuan style", price: 18, cost: 6, category: "Main Course", currentQty: 50, minimumQty: 10 },
      { name: "Mapo Tofu", description: "Silken tofu spicy", price: 16, cost: 4, category: "Main Course", currentQty: 40, minimumQty: 10 },
      { name: "Jasmine Pearl Tea", description: "Premium tea", price: 8, cost: 1, category: "Beverage", currentQty: 200, minimumQty: 50 }
    ];
    await Menu.deleteMany({});
    const seededMenus = await Menu.insertMany(menuItems);
    console.log("Seeded Menus.");

    // 3. Seed Employees
    const employeeData = [
      { id: "EMP001", name: "Alex Chen", nic: "199012345678", phone: "0771234567", role: "admin", basicSalary: 150000 },
      { id: "EMP002", name: "Li Wei", nic: "198587654321", phone: "0777654321", role: "kitchen", basicSalary: 85000 },
      { id: "EMP003", name: "Sarah Silva", nic: "199245678912", phone: "0779876543", role: "cashier", basicSalary: 65000 }
    ];
    await Employee.deleteMany({});
    const employees = await Employee.insertMany(employeeData);
    console.log("Seeded Employees.");

    // 4. Seed Attendance (Last 30 days)
    const attendanceRecords = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        employees.forEach(emp => {
            attendanceRecords.push({
                employeeId: emp._id,
                date: date,
                punches: [
                    { time: "08:00 AM", type: "In" },
                    { time: "05:00 PM", type: "Out" }
                ]
            });
        });
    }
    await Attendance.deleteMany({});
    await Attendance.insertMany(attendanceRecords);
    console.log("Seeded Attendance.");

    // 5. Seed Orders (Last 30 days)
    const orders = [];
    const statuses = ["Completed", "Ready", "Processing", "Pending"];
    const types = ["takeaway", "table", "delivery"];
    for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const total = 1500 + Math.random() * 5000;
        orders.push({
            invoiceNo: `INV-${2000 + i}`,
            customerName: `Customer ${i}`,
            customerPhone: "0771234567",
            tableNo: "T1",
            items: [{ 
                menuId: seededMenus[0]._id,
                name: seededMenus[0].name, 
                quantity: 2, 
                price: seededMenus[0].price,
                netProfit: seededMenus[0].price - seededMenus[0].cost
            }],
            subtotal: total,
            totalPrice: total,
            cashierId: adminUser._id,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            orderType: types[Math.floor(Math.random() * types.length)],
            payment: { cash: total, card: 0, bankTransfer: 0, totalPaid: total, changeDue: 0 },
            createdAt: date
        });
    }
    await Order.deleteMany({});
    await Order.insertMany(orders);
    console.log("Seeded Orders.");

    // 6. Seed Expenses
    const expenses = [];
    for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        expenses.push({
            title: `Operational Expense ${i}`,
            amount: 500 + Math.random() * 2000,
            category: "General",
            date: date
        });
    }
    await OtherExpense.deleteMany({});
    await OtherExpense.insertMany(expenses);
    console.log("Seeded Expenses.");

    console.log("DATABASE FULLY POPULATED WITH VALIDATED RECORDS.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
