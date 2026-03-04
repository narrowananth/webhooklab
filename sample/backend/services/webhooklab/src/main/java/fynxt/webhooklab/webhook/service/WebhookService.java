package fynxt.webhooklab.webhook.service;

import java.util.Optional;
import java.util.UUID;

import fynxt.webhooklab.webhook.dto.WebhookDto;
import fynxt.webhooklab.webhook.entity.Webhook;

public interface WebhookService {

	WebhookDto create(String name, String slug);

	/** Create webhook and set URL using request origin. */
	WebhookDto createWithUrl(String name, String slug, String requestOrigin);

	Optional<WebhookDto> getByIdOrSlug(String idOrSlug, String requestOrigin);

	Optional<Webhook> findEntityByWebhookIdOrSlug(String webhookIdOrSlug);

	String getWebhookBaseUrl(String requestOrigin);

	String buildWebhookUrl(Webhook webhook, String baseUrl);
}
