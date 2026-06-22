export interface IComment {
    id: string;
    issueId: string;
    userId: string;
    text: string;
    createdAt?: Date;
}
