package liveflares.webhook.service;

import liveflares.webhook.dto.WebhookDto;
import liveflares.webhook.entity.Webhook;

import java.util.Optional;

public interface WebhookService {

	WebhookDto create(String name, String slug);

	WebhookDto createWithUrl(String name, String slug, String requestOrigin);

	WebhookDto getBySlug(String slug, String requestOrigin);

	WebhookDto getByIdOrSlug(String idOrSlug, String requestOrigin);

	Optional<Webhook> findEntityByWebhookIdOrSlug(String webhookIdOrSlug);

	String getWebhookBaseUrl(String requestOrigin);

	String buildWebhookUrl(Webhook webhook, String baseUrl);
}
