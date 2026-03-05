package webhooklab.webhookrequest.service.mappers;

import webhooklab.mapper.config.MapperCoreConfig;
import webhooklab.webhook.entity.Webhook;
import webhooklab.webhookrequest.dto.EventStatsDto;
import webhooklab.webhookrequest.dto.ReplayResultDto;
import webhooklab.webhookrequest.dto.WebhookRequestDto;
import webhooklab.webhookrequest.entity.WebhookRequest;

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
}
