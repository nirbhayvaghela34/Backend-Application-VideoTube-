class ApiResponse {
  constructor(stautsCode, data, message = "success") {
    this.stautsCode = stautsCode;
    this.data = data;
    this.message = message;
    this.success = stautsCode < 400;
  }
}

export { ApiResponse };
