package webhooklab.webhook.service.mappers;

import webhooklab.mapper.config.MapperCoreConfig;
import webhooklab.webhook.dto.WebhookDto;
import webhooklab.webhook.entity.Webhook;

import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperCoreConfig.class)
public interface WebhookMapper {

	@Mapping(target = "pkId", source = "id")
	@Mapping(target = "id", source = "webhookId")
	@Mapping(target = "url", ignore = true)
	WebhookDto toDto(Webhook entity);

	@BeanMapping(builder = @Builder(disableBuilder = true))
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "webhookId", expression = "java(java.util.UUID.randomUUID())")
	@Mapping(target = "createdAt", ignore = true)
	Webhook toEntity(String name, String slug);
}
