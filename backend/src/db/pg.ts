import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString === "YOUR_NEON_DATABASE_URL") {
    console.warn("⚠️ DATABASE_URL is not set or is using the placeholder. PostgreSQL features will fail.");
}

export const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes("sslmode=require") || connectionString?.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
});

export const connectDB = async () => {
    try {
        console.log("Connecting to PostgreSQL...");
        // Test query
        const res = await pool.query("SELECT NOW()");
        console.log("PostgreSQL Connected: ", res.rows[0].now);

        // Initialize Schema
        await initSchema();
    } catch (error) {
        console.error("PostgreSQL connection error:", error);
        process.exit(1);
    }
};

const initSchema = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Wards Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS wards (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                ward_number INTEGER NOT NULL,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                UNIQUE(name, city)
            );
        `);

        // 2. Departments Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL UNIQUE,
                description TEXT
            );
        `);

        // 3. Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('citizen', 'authority', 'admin')),
                ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
                department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
                avatar TEXT,
                points INTEGER DEFAULT 0,
                issues_resolved INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Issues Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL CHECK (category IN ('road', 'garbage', 'sewage', 'water', 'electricity')),
                images TEXT[] DEFAULT '{}',
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
                department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
                reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
                upvotes INTEGER DEFAULT 0,
                downvotes INTEGER DEFAULT 0,
                resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
                resolved_at TIMESTAMP,
                resolution_images TEXT[] DEFAULT '{}',
                resolution_feedback TEXT,
                resolution_score INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. Votes Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS votes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
                UNIQUE(issue_id, user_id)
            );
        `);

        // 6. Comments Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query("COMMIT");
        console.log("✅ PostgreSQL schema initialized successfully.");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Schema initialization failed:", error);
        throw error;
    } finally {
        client.release();
    }
};
