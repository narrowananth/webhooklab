package fynxt.common.exception;

import fynxt.common.enums.ErrorCode;

import org.springframework.http.HttpStatus;

public abstract class BaseException extends RuntimeException {

	private final ErrorCode errorCode;
	private final ErrorCategory category;

	protected BaseException(String message, ErrorCode errorCode, ErrorCategory category) {
		super(message);
		this.errorCode = errorCode;
		this.category = category;
	}

	protected BaseException(String message, ErrorCode errorCode) {
		this(message, errorCode, ErrorCategory.INTERNAL);
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

	public ErrorCategory category() {
		return category;
	}

	public HttpStatus httpStatus() {
		return category.http();
	}
}
