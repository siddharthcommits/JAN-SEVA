import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import "../models/user.model";
import "../models/ward.model";
import "../models/department.model";
import "../models/issue.model";
import "../models/vote.model";

import { User } from "../models/user.model";
import { Ward } from "../models/ward.model";
import { Department } from "../models/department.model";
import { Issue } from "../models/issue.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://theswastik111_db_user:eatQlXrfU0Znlm9u@cluster0.chypbze.mongodb.net/?appName=Cluster0";

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding");

        // Clear existing data
        await Issue.deleteMany({});
        await Ward.deleteMany({});
        await Department.deleteMany({});
        await User.deleteMany({});
        
        console.log("Cleared existing data");

        // Wards
        const ward1 = await Ward.create({ name: "Downtown", wardNumber: 1, city: "Metropolis", state: "State" });
        const ward2 = await Ward.create({ name: "Uptown", wardNumber: 2, city: "Metropolis", state: "State" });

        // Departments
        const roadDept = await Department.create({ name: "Roads & Highways", description: "Maintenance of roads" });
        const sanitationDept = await Department.create({ name: "Sanitation", description: "Waste management" });
        const waterDept = await Department.create({ name: "Water Supply", description: "Water and sewage" });
        const powerDept = await Department.create({ name: "Power", description: "Electricity grid" });

        // Users - password is 'password123' (will be hashed automatically by user model pre-save hook)
        const citizenUser = await User.create({
            name: "John Citizen",
            email: "citizen@example.com",
            phone: "+1234567890",
            password: "password123",
            role: "citizen",
            wardId: ward1._id
        });

        const authorityUser = await User.create({
            name: "Officer Smith",
            email: "authority@example.com",
            phone: "+1987654321",
            password: "password123",
            role: "authority",
            wardId: ward1._id,
            departmentId: roadDept._id
        });

        // Issues
        const issues = [
            {
                title: "Large Pothole on Main Street",
                description: "There is a massive pothole causing traffic delays and vehicle damage. Please fix ASAP.",
                category: "road",
                images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800"],
                location: { type: "Point", coordinates: [-73.935242, 40.730610] },
                wardId: ward1._id,
                departmentId: roadDept._id,
                reportedBy: citizenUser._id,
                status: "open",
                upvotes: 15,
                downvotes: 1
            },
            {
                title: "Overflowing Garbage Bins",
                description: "The garbage hasn't been collected for 3 days near the central park entrance.",
                category: "garbage",
                images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800"],
                location: { type: "Point", coordinates: [-73.135242, 40.230610] },
                wardId: ward2._id,
                departmentId: sanitationDept._id,
                reportedBy: citizenUser._id,
                status: "open",
                upvotes: 8,
                downvotes: 0
            },
            {
                title: "Burst Water Pipe",
                description: "Water is flooding the sidewalk and causing a hazard for pedestrians.",
                category: "water",
                images: ["https://images.unsplash.com/photo-1519961234850-29c88248de30?auto=format&fit=crop&q=80&w=800"],
                location: { type: "Point", coordinates: [-73.535242, 40.530610] },
                wardId: ward1._id,
                departmentId: waterDept._id,
                reportedBy: citizenUser._id,
                status: "resolved",
                upvotes: 24,
                downvotes: 2,
                resolvedBy: authorityUser._id,
                resolvedAt: new Date()
            },
            {
                title: "Streetlight not working",
                description: "The main streetlight is out, making it very unsafe to walk at night.",
                category: "electricity",
                images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"],
                location: { type: "Point", coordinates: [-73.835242, 40.830610] },
                wardId: ward2._id,
                departmentId: powerDept._id,
                reportedBy: citizenUser._id,
                status: "open",
                upvotes: 5,
                downvotes: 0
            }
        ];

        await Issue.insertMany(issues);
        console.log("Seeded database successfully with dummy posts");

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();