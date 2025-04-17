export class ApiError extends Error {
    constructor(statusCode, message, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = false;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
            error: this.message,
        };
    }
}
