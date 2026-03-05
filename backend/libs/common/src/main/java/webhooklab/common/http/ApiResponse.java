package webhooklab.common.http;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * API response body: either success with {@code data} or failure with {@code error}.
 * <p>
 * Success: {@code { "data": { ... } }} — single entity, list, or object with pagination.
 * Error:   {@code { "error": { "code", "detail", "message" } }}.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

	private T data;
	private ErrorBody error;

	@Getter
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public static class ErrorBody {
		private String code;
		private String detail;
		private String message;
	}

	@Getter
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public static class PaginationInfo {
		private Integer page;
		private Integer size;
		private Long totalElements;
		private Integer totalPages;
	}
}
