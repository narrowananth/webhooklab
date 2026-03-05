package webhooklab.webhook.service;

import webhooklab.webhook.dto.WebhookDto;
import webhooklab.webhook.entity.Webhook;

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
