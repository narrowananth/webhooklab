package liveflares.webhookrequest.service.mappers;

import liveflares.mapper.config.MapperCoreConfig;
import liveflares.webhook.entity.Webhook;
import liveflares.webhookrequest.dto.EventNewMessageDto;
import liveflares.webhookrequest.dto.EventStatsDto;
import liveflares.webhookrequest.dto.ReplayResultDto;
import liveflares.webhookrequest.dto.StatsSnapshotMessageDto;
import liveflares.webhookrequest.dto.WebhookRequestDto;
import liveflares.webhookrequest.entity.WebhookRequest;

import java.util.Map;

import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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

	@Mapping(target = "status", source = "status")
	@Mapping(target = "statusText", source = "statusText")
	@Mapping(target = "ok", source = "ok")
	ReplayResultDto toReplayResultDto(int status, String statusText, boolean ok);

	@Mapping(target = "type", constant = "event:new")
	@Mapping(target = "event", source = "request")
	@Mapping(target = "stats", source = "stats")
	EventNewMessageDto toEventNewMessageDto(WebhookRequest request, EventStatsDto stats);

	@Mapping(target = "type", constant = "stats:snapshot")
	@Mapping(target = "count", source = "count")
	@Mapping(target = "totalSize", source = "totalSize")
	StatsSnapshotMessageDto toStatsSnapshotMessageDto(EventStatsDto stats);
}
