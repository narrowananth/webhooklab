package fynxt.common.exception;

import fynxt.common.enums.ErrorCode;
import fynxt.common.http.ApiResponse;
import fynxt.common.http.ResponseBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	private final ResponseBuilder responseBuilder;

	public GlobalExceptionHandler(ResponseBuilder responseBuilder) {
		this.responseBuilder = responseBuilder;
	}

	@ExceptionHandler(BaseException.class)
	public ResponseEntity<ApiResponse<Object>> handleBaseException(BaseException ex) {
		return responseBuilder.error(ex.errorCode(), ex.getMessage(), ex.httpStatus());
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiResponse<Object>> handleResponseStatus(ResponseStatusException ex) {
		HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
		ErrorCode resolved = ErrorCode.fromCode(ex.getReason());
		ErrorCode errorCode = resolved != null ? resolved : ErrorCode.GENERIC_ERROR;
		String messageOverride = resolved != null ? null : ex.getReason();
		return responseBuilder.error(errorCode, messageOverride, status);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
		LOGGER.error("Unhandled exception", ex);
		return responseBuilder.error(ErrorCode.GENERIC_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
