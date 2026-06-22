export type IssueCategory =
    | "road"
    | "garbage"
    | "sewage"
    | "water"
    | "electricity";

export type IssueStatus = "open" | "resolved";

export interface IIssue {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    images?: string[];
    latitude: number;
    longitude: number;
    wardId: string;
    departmentId: string;
    reportedBy: string;
    status: IssueStatus;
    upvotes: number;
    downvotes: number;
    resolvedBy?: string;
    resolvedAt?: Date;
    resolutionImages?: string[];
    resolutionFeedback?: string;
    resolutionScore?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
