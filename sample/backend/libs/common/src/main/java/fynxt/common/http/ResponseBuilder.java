package fynxt.common.http;

import fynxt.common.enums.ErrorCode;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public interface ResponseBuilder {

	ResponseEntity<ApiResponse<Object>> created(Object data, String message);

	ResponseEntity<ApiResponse<Object>> updated(Object data, String message);

	ResponseEntity<ApiResponse<Object>> get(Object data, String message);

	ResponseEntity<ApiResponse<Object>> getAll(Object data, String message);

	ResponseEntity<ApiResponse<Object>> deleted(String message);

	<T> ResponseEntity<ApiResponse<Object>> paginated(Page<T> page, String message);

	ResponseEntity<ApiResponse<Object>> error(ErrorCode errorCode, String messageOverride, HttpStatus status);
}
