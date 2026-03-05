package webhooklab.common.http;

import webhooklab.common.enums.ErrorCode;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class ResponseBuilderImpl implements ResponseBuilder {

	@Override
	public ResponseEntity<ApiResponse<Object>> created(Object data, String message) {
		return buildSuccess(data, HttpStatus.CREATED);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> updated(Object data, String message) {
		return buildSuccess(data, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> get(Object data, String message) {
		return buildSuccess(data, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> getAll(Object data, String message) {
		return buildSuccess(data, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> deleted(String message) {
		return buildSuccess(null, HttpStatus.NO_CONTENT);
	}

	@Override
	public <T> ResponseEntity<ApiResponse<Object>> paginated(Page<T> page, String message) {
		ApiResponse.PaginationInfo pagination = ApiResponse.PaginationInfo.builder()
				.page(page.getNumber() + 1)
				.size(page.getSize())
				.totalElements(page.getTotalElements())
				.totalPages(page.getTotalPages())
				.build();
		Object data = Map.of("content", page.getContent(), "pagination", pagination);
		return buildSuccess(data, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<ApiResponse<Object>> error(
			ErrorCode errorCode, String messageOverride, String detail, HttpStatus status) {
		String message =
				messageOverride != null && !messageOverride.isBlank() ? messageOverride : errorCode.getMessage();
		ApiResponse.ErrorBody errorBody = ApiResponse.ErrorBody.builder()
				.code(errorCode.getCode())
				.detail(detail)
				.message(message)
				.build();
		return ResponseEntity.status(status)
				.body(ApiResponse.builder().error(errorBody).build());
	}

	private ResponseEntity<ApiResponse<Object>> buildSuccess(Object data, HttpStatus status) {
		return ResponseEntity.status(status)
				.body(ApiResponse.builder().data(data).build());
	}
}
