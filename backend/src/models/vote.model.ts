export interface IVote {
    id: string;
    issueId: string;
    userId: string;
    voteType: "upvote" | "downvote";
}
