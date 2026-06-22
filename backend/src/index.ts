import { connectDB } from "./db/db";
import { app } from "./app";


const PORT = process.env.PORT || 3000;


connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection failed:", error);
    });
