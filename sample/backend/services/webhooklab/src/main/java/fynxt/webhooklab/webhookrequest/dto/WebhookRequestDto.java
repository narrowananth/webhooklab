package fynxt.webhooklab.webhookrequest.dto;

import java.time.OffsetDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WebhookRequestDto extends AuditingEntity {

	private Long id;
	private String method;
	private String url;
	private Map<String, String> headers;
	private Map<String, String> queryParams;
	private Map<String, Object> body;
	private String rawBody;
	private String ip;
	private Integer status;

	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime createdAt;
}
