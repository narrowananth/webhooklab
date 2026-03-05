package webhooklab.common.enums;

public enum ErrorCode {
	SUCCESS("0000", "Success"),
	GENERIC_ERROR("1000", "An unexpected error occurred"),
	VALIDATION_ERROR("1001", "Validation failed"),
	INVALID_REQUEST("1002", "Invalid request format"),
	RESOURCE_NOT_FOUND("1003", "Requested resource not found"),
	UNAUTHORIZED("1004", "Unauthorized access"),
	FORBIDDEN("1005", "Access forbidden"),
	CONFLICT("1006", "Resource conflict"),
	DUPLICATE_RESOURCE("1007", "Resource already exists"),
	INVALID_CREDENTIALS("1008", "Invalid credentials"),
	UNEXPECTED_ERROR("1009", "An unexpected error occurred. Please try again later."),
	MISSING_REQUIRED_PARAMETER("1010", "Missing required parameter");

	private final String code;
	private final String message;

	ErrorCode(String code, String message) {
		this.code = code;
		this.message = message;
	}

	public String getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}

	public static ErrorCode fromCode(String code) {
		if (code == null || code.isBlank()) {
			return null;
		}
		for (ErrorCode errorCode : values()) {
			if (errorCode.code.equals(code)) {
				return errorCode;
			}
		}
		return null;
	}

	@Override
	public String toString() {
		return code;
	}
}
