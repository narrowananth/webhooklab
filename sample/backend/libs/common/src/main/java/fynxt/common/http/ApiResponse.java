package fynxt.common.http;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
	private OffsetDateTime timestamp;

	private String code;
	private String message;
	private T data;
	private String error;
	private ResponseMetadata metadata;

	@Getter
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public static class ResponseMetadata {

		private String requestId;
		private Long processingTime;
		private PaginationInfo pagination;
		private String version;
		private String service;
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
		private Boolean hasNext;
		private Boolean hasPrevious;
	}
}
