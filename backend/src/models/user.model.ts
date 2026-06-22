export type UserRole = "citizen" | "authority" | "admin";

export interface IUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    wardId?: string;
    departmentId?: string;
    avatar?: string;
    points: number;
    issuesResolved: number;
    createdAt?: Date;
}
