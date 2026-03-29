export class ApiResponse {
    public status: number;
    public message: string;
    public data: any;
    public success: boolean;

    constructor(statusCode: number, data: any, message: string = "Success") {
        this.status = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
    }
}
