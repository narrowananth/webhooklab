package fynxt.common.http;

import fynxt.common.enums.ErrorCode;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class ResponseBuilderImpl implements ResponseBuilder {

	private static final String SUCCESS_CODE = ErrorCode.SUCCESS.getCode();

	@Override
	public ResponseEntity<ApiResponse<Object>> created(Object data, String message) {
		return buildSuccess(data, message, HttpStatus.CREATED);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> updated(Object data, String message) {
		return buildSuccess(data, message, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> get(Object data, String message) {
		return buildSuccess(data, message, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> getAll(Object data, String message) {
		return buildSuccess(data, message, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> deleted(String message) {
		return buildSuccess(null, message, HttpStatus.NO_CONTENT);
	}

	@Override
	public <T> ResponseEntity<ApiResponse<Object>> paginated(Page<T> page, String message) {
		ApiResponse.PaginationInfo pagination = ApiResponse.PaginationInfo.builder()
				.page(page.getNumber())
				.size(page.getSize())
				.totalElements(page.getTotalElements())
				.totalPages(page.getTotalPages())
				.hasNext(page.hasNext())
				.hasPrevious(page.hasPrevious())
				.build();

		ApiResponse.ResponseMetadata metadata =
				ApiResponse.ResponseMetadata.builder().pagination(pagination).build();

		return buildSuccess(page.getContent(), message, HttpStatus.OK, metadata);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> error(ErrorCode errorCode, String messageOverride, HttpStatus status) {
		String message =
				messageOverride != null && !messageOverride.isBlank() ? messageOverride : errorCode.getMessage();
		return ResponseEntity.status(status)
				.body(ApiResponse.builder()
						.timestamp(now())
						.code(errorCode.getCode())
						.message(message)
						.build());
	}

	private OffsetDateTime now() {
		return OffsetDateTime.now(ZoneOffset.UTC);
	}

	private ResponseEntity<ApiResponse<Object>> buildSuccess(Object data, String message, HttpStatus status) {
		return buildSuccess(data, message, status, null);
	}

	private ResponseEntity<ApiResponse<Object>> buildSuccess(
			Object data, String message, HttpStatus status, ApiResponse.ResponseMetadata metadata) {
		ApiResponse.ApiResponseBuilder<Object> builder = ApiResponse.builder()
				.timestamp(now())
				.code(SUCCESS_CODE)
				.message(message)
				.data(data);
		if (metadata != null) {
			builder.metadata(metadata);
		}
		return ResponseEntity.status(status).body(builder.build());
	}
}
