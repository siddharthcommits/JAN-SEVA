import { UserRole } from "../models/user.model";

declare global {
    namespace Express {
        interface AuthenticatedUser {
            id: string;
            role: UserRole;
            wardId?: string;
            departmentId?: string;
        }

        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export {};
