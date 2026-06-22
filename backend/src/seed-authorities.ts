import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { pool, connectDB } from "./db/pg";

dotenv.config();

const categories = ["road", "garbage", "sewage", "water", "electricity"] as const;

// Real coordinates from Delhi – Dwarka and Burari
const dwarkaLocations = [
    { lat: 28.5921, lng: 77.0460, label: "Dwarka Sector 10" },
    { lat: 28.5823, lng: 77.0509, label: "Dwarka Sector 12" },
    { lat: 28.5718, lng: 77.0412, label: "Dwarka Sector 21" },
    { lat: 28.6020, lng: 77.0320, label: "Dwarka Sector 3" },
    { lat: 28.5870, lng: 77.0630, label: "Dwarka Sector 7" },
];

const burariLocations = [
    { lat: 28.7535, lng: 77.1960, label: "Burari Main Road" },
    { lat: 28.7580, lng: 77.1900, label: "Burari Chowk" },
    { lat: 28.7620, lng: 77.2010, label: "Mukund Pur" },
    { lat: 28.7490, lng: 77.1880, label: "Sant Nagar Burari" },
    { lat: 28.7450, lng: 77.2050, label: "Jagatpur" },
];

// Sample issue titles per category
const issueTitles: Record<string, string[]> = {
    road: [
        "Massive pothole near metro station",
        "Broken speed breaker causing accidents",
        "Road caved in after heavy rain",
    ],
    garbage: [
        "Garbage dump overflowing for 3 days",
        "No dustbin placement in market area",
        "Waste burning in open near school",
    ],
    sewage: [
        "Sewage overflow on main road",
        "Blocked drain causing waterlogging",
        "Open manhole dangerously uncovered",
    ],
    water: [
        "No water supply for 2 days",
        "Leaking pipeline wasting water",
        "Contaminated water from taps",
    ],
    electricity: [
        "Street lights not working at night",
        "Exposed live wires on electric pole",
        "Frequent power cuts in residential area",
    ],
};

const issueDescriptions: Record<string, string[]> = {
    road: [
        "A massive pothole has formed near the metro station entrance, making it dangerous for two-wheelers and pedestrians.",
        "The speed breaker is broken and has sharp edges, two accidents have already occurred this week.",
        "A large section of road has caved in after last night's rain, vehicles are taking detour through narrow lanes.",
    ],
    garbage: [
        "The garbage dump at the market has not been cleared for 3 days, causing a terrible stench and attracting stray animals.",
        "No dustbins have been placed in the newly constructed market area, people are forced to throw waste on the road.",
        "Waste is being burned openly near the primary school, children are facing breathing issues.",
    ],
    sewage: [
        "Sewage water is overflowing onto the main road, making it impossible for pedestrians to walk without wading through dirty water.",
        "The drain near the intersection is completely blocked, causing severe waterlogging every time it rains.",
        "A manhole cover is missing on a busy footpath, extremely dangerous for children and elderly citizens.",
    ],
    water: [
        "Our entire block has had no water supply for 2 days. Families are forced to buy water tankers at high cost.",
        "A major pipeline is leaking heavily, wasting thousands of liters of water daily.",
        "The tap water has turned yellow and has a foul smell. Multiple families have reported stomach illnesses.",
    ],
    electricity: [
        "All the street lights on the main road have been off for over a week. Several theft incidents have been reported.",
        "Exposed live wires are hanging from an electric pole near a park where children play. Extremely dangerous.",
        "Residential area has been facing 4-5 hour power cuts daily for the past two weeks. No response from helpline.",
    ],
};

const seed = async () => {
    try {
        await connectDB();

        // 1. Create/find Departments
        const departmentMap: Record<string, string> = {};
        for (const cat of categories) {
            let res = await pool.query("SELECT id FROM departments WHERE name = $1", [cat]);
            let id = res.rows[0]?.id;
            if (!id) {
                res = await pool.query(
                    "INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING id",
                    [cat, `${cat.charAt(0).toUpperCase() + cat.slice(1)} Department`]
                );
                id = res.rows[0].id;
                console.log(`✅ Created department: ${cat}`);
            }
            departmentMap[cat] = id;
        }

        // 2. Create/find Wards for Dwarka and Burari
        const wards = [
            { name: "Dwarka", wardNumber: 1, city: "New Delhi", state: "Delhi" },
            { name: "Burari", wardNumber: 2, city: "New Delhi", state: "Delhi" },
        ];
        const wardMap: Record<string, string> = {};
        for (const w of wards) {
            let res = await pool.query("SELECT id FROM wards WHERE name = $1 AND city = $2", [w.name, w.city]);
            let id = res.rows[0]?.id;
            if (!id) {
                res = await pool.query(
                    "INSERT INTO wards (name, ward_number, city, state) VALUES ($1, $2, $3, $4) RETURNING id",
                    [w.name, w.wardNumber, w.city, w.state]
                );
                id = res.rows[0].id;
                console.log(`✅ Created ward: ${w.name}`);
            }
            wardMap[w.name] = id;
        }

        // 3. Create Authority users – split across Dwarka/Burari
        const authorityWardAssignment: Record<string, string> = {
            road: "Dwarka",
            garbage: "Dwarka",
            sewage: "Dwarka",
            water: "Burari",
            electricity: "Burari",
        };

        for (const cat of categories) {
            const email = `auth.${cat}@janseva.com`;
            let res = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
            let id = res.rows[0]?.id;
            if (!id) {
                const hashedPassword = await bcrypt.hash("test123", 10);
                await pool.query(
                    `INSERT INTO users (name, email, phone, password, role, department_id, ward_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        `${cat.charAt(0).toUpperCase() + cat.slice(1)} Authority`,
                        email,
                        `987654320${categories.indexOf(cat)}`,
                        hashedPassword,
                        "authority",
                        departmentMap[cat],
                        wardMap[authorityWardAssignment[cat]]
                    ]
                );
                console.log(`✅ Created authority: ${email} (ward: ${authorityWardAssignment[cat]})`);
            } else {
                // Update existing authority with correct dept/ward
                await pool.query(
                    "UPDATE users SET department_id = $1, ward_id = $2 WHERE id = $3",
                    [departmentMap[cat], wardMap[authorityWardAssignment[cat]], id]
                );
                console.log(`🔄 Updated authority: ${email} (ward: ${authorityWardAssignment[cat]})`);
            }
        }

        // 4. Create a citizen user for reporting
        let citizenRes = await pool.query("SELECT id FROM users WHERE email = $1", ["citizen@janseva.com"]);
        let citizenId = citizenRes.rows[0]?.id;
        if (!citizenId) {
            const hashedPassword = await bcrypt.hash("test123", 10);
            const insertCitizenRes = await pool.query(
                `INSERT INTO users (name, email, phone, password, role, ward_id)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                ["Test Citizen", "citizen@janseva.com", "9876543210", hashedPassword, "citizen", wardMap["Dwarka"]]
            );
            citizenId = insertCitizenRes.rows[0].id;
            console.log("✅ Created test citizen: citizen@janseva.com");
        }

        // 5. Seed issues – mix of Dwarka and Burari locations for each category
        const countRes = await pool.query("SELECT COUNT(*)::int FROM issues");
        const existingIssueCount = countRes.rows[0].count;
        if (existingIssueCount > 0) {
            console.log(`⏭️  Skipping issue seeding (${existingIssueCount} issues already exist)`);
        } else {
            const allLocations = [...dwarkaLocations, ...burariLocations];
            let issueIndex = 0;

            for (const cat of categories) {
                const titles = issueTitles[cat];
                const descriptions = issueDescriptions[cat];

                for (let i = 0; i < titles.length; i++) {
                    const loc = allLocations[issueIndex % allLocations.length];
                    const wardName = loc.lat > 28.7 ? "Burari" : "Dwarka";

                    await pool.query(
                        `INSERT INTO issues (title, description, category, images, latitude, longitude, ward_id, department_id, reported_by, status, upvotes, downvotes)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                        [
                            titles[i],
                            descriptions[i],
                            cat,
                            [],
                            loc.lat,
                            loc.lng,
                            wardMap[wardName],
                            departmentMap[cat],
                            citizenId,
                            "open",
                            Math.floor(Math.random() * 25),
                            Math.floor(Math.random() * 3)
                        ]
                    );

                    issueIndex++;
                }
                console.log(`✅ Seeded ${titles.length} ${cat} issues`);
            }
        }

        console.log("\n🎉 Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seed();
