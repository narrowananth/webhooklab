package fynxt.webhooklab.webhook.service.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import fynxt.webhooklab.webhook.dto.WebhookDto;
import fynxt.webhooklab.webhook.entity.Webhook;

@Mapper(componentModel = "spring")
public interface WebhookMapper {

	@Mapping(target = "pkId", source = "id")
	@Mapping(target = "id", source = "webhookId")
	@Mapping(target = "url", ignore = true)
	WebhookDto toDto(Webhook entity);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "webhookId", expression = "java(java.util.UUID.randomUUID())")
	@Mapping(target = "createdAt", ignore = true)
	Webhook toEntity(String name, String slug);
}
