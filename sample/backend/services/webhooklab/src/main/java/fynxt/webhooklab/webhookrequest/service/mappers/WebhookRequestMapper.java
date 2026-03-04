package fynxt.webhooklab.webhookrequest.service.mappers;

import java.util.List;
import java.util.Map;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Param;

import fynxt.webhooklab.webhook.entity.Webhook;
import fynxt.webhooklab.webhookrequest.dto.EventListResult;
import fynxt.webhooklab.webhookrequest.dto.EventStatsDto;
import fynxt.webhooklab.webhookrequest.dto.ReplayResultDto;
import fynxt.webhooklab.webhookrequest.dto.WebhookRequestDto;
import fynxt.webhooklab.webhookrequest.entity.WebhookRequest;

@Mapper(componentModel = "spring")
public interface WebhookRequestMapper {

	@Mapping(target = "timestamp", source = "createdAt")
	WebhookRequestDto toDto(WebhookRequest entity);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	WebhookRequest toEntity(
			Webhook webhook,
			String method,
			String url,
			Map<String, String> headers,
			Map<String, String> queryParams,
			Map<String, Object> body,
			String rawBody,
			String ip,
			Integer status);

	@Mapping(target = "count", source = "count")
	@Mapping(target = "totalSize", source = "totalSize")
	EventStatsDto toEventStatsDto(@Param("count") int count, @Param("totalSize") long totalSize);

	@Mapping(target = "events", source = "events")
	@Mapping(target = "nextPageToken", source = "nextPageToken")
	@Mapping(target = "total", source = "total")
	@Mapping(target = "pagination", source = "pagination")
	EventListResult toEventListResult(
			@Param("events") List<WebhookRequestDto> events,
			@Param("nextPageToken") String nextPageToken,
			@Param("total") long total,
			@Param("pagination") Map<String, Object> pagination);

	@Mapping(target = "status", source = "status")
	@Mapping(target = "statusText", source = "statusText")
	@Mapping(target = "ok", source = "ok")
	ReplayResultDto toReplayResultDto(
			@Param("status") int status,
			@Param("statusText") String statusText,
			@Param("ok") boolean ok);
}
