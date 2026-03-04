package fynxt.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCategory {
	NOT_FOUND,
	BAD_REQUEST,
	UNAUTHORIZED,
	FORBIDDEN,
	CONFLICT,
	DUPLICATE,
	INTERNAL;

	public HttpStatus http() {
		return switch (this) {
			case NOT_FOUND -> HttpStatus.NOT_FOUND;
			case BAD_REQUEST -> HttpStatus.BAD_REQUEST;
			case UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
			case FORBIDDEN -> HttpStatus.FORBIDDEN;
			case CONFLICT, DUPLICATE -> HttpStatus.CONFLICT;
			case INTERNAL -> HttpStatus.INTERNAL_SERVER_ERROR;
		};
	}
}
