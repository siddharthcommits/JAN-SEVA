// Vercel serverless entry point
import "../src/models/user.model";
import "../src/models/ward.model";
import "../src/models/department.model";
import "../src/models/issue.model";
import "../src/models/vote.model";
import "../src/models/comment.model";

import { connectDB } from "../src/db/db";
import { app } from "../src/app";

// Connect to DB once (cached across warm invocations)
connectDB();

export default app;
