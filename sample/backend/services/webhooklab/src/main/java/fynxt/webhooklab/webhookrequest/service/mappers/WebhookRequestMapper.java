package fynxt.webhooklab.webhookrequest.service.mappers;

import java.util.List;
import java.util.Map;

import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import fynxt.mapper.config.MapperCoreConfig;
import fynxt.webhooklab.webhook.entity.Webhook;
import fynxt.webhooklab.webhookrequest.dto.EventListResult;
import fynxt.webhooklab.webhookrequest.dto.EventStatsDto;
import fynxt.webhooklab.webhookrequest.dto.ReplayResultDto;
import fynxt.webhooklab.webhookrequest.dto.WebhookRequestDto;
import fynxt.webhooklab.webhookrequest.entity.WebhookRequest;

@Mapper(config = MapperCoreConfig.class)
public interface WebhookRequestMapper {

	@Mapping(target = "createdAt", source = "createdAt")
	WebhookRequestDto toDto(WebhookRequest entity);

	@BeanMapping(builder = @Builder(disableBuilder = true))
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "webhook", source = "webhook")
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
	EventStatsDto toEventStatsDto(int count, long totalSize);

	@Mapping(target = "events", source = "events")
	@Mapping(target = "nextPageToken", source = "nextPageToken")
	@Mapping(target = "total", source = "total")
	@Mapping(target = "pagination", source = "pagination")
	EventListResult toEventListResult(
			List<WebhookRequestDto> events,
			String nextPageToken,
			long total,
			Map<String, Object> pagination);

	@Mapping(target = "status", source = "status")
	@Mapping(target = "statusText", source = "statusText")
	@Mapping(target = "ok", source = "ok")
	ReplayResultDto toReplayResultDto(int status, String statusText, boolean ok);
}
