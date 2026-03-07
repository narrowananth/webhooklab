package liveflares.common.exception;

import liveflares.common.enums.ErrorCode;
import liveflares.common.http.ApiResponse;
import liveflares.common.http.ResponseBuilder;

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
		String detail = ex.getCause() != null ? ex.getCause().getMessage() : null;
		return responseBuilder.error(ex.errorCode(), ex.getMessage(), detail, ex.httpStatus());
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiResponse<Object>> handleResponseStatus(ResponseStatusException ex) {
		HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
		ErrorCode resolved = ErrorCode.fromCode(ex.getReason());
		ErrorCode errorCode = resolved != null ? resolved : ErrorCode.GENERIC_ERROR;
		String messageOverride = resolved != null ? null : ex.getReason();
		return responseBuilder.error(errorCode, messageOverride, null, status);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
		LOGGER.error("Unhandled exception", ex);
		String detail = ex.getMessage();
		return responseBuilder.error(ErrorCode.GENERIC_ERROR, null, detail, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
