package fynxt.common.exception;

import fynxt.common.enums.ErrorCode;

public class AppException extends BaseException {

	public AppException(String message, ErrorCode errorCode) {
		super(message, errorCode);
	}

	public AppException(String message, ErrorCode errorCode, ErrorCategory category) {
		super(message, errorCode, category);
	}
}
