package fynxt.webhooklab.webhookrequest.dto;

import java.util.List;
import java.util.Map;

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
public class EventListResult {

	private List<WebhookRequestDto> events;
	private String nextPageToken;
	private long total;
	private Map<String, Object> pagination;
}
