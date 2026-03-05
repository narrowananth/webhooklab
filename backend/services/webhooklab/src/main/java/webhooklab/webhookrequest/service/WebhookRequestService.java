package webhooklab.webhookrequest.service;

import webhooklab.webhook.entity.Webhook;
import webhooklab.webhookrequest.dto.EventStatsDto;
import webhooklab.webhookrequest.dto.ReplayResultDto;
import webhooklab.webhookrequest.dto.WebhookRequestDto;
import webhooklab.webhookrequest.entity.WebhookRequest;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WebhookRequestService {

	WebhookRequest capture(
			Webhook webhook,
			String method,
			String url,
			Map<String, String> headers,
			Map<String, String> queryParams,
			Map<String, Object> body,
			String rawBody,
			String ip);

	Optional<WebhookRequest> findByEventId(Long eventId);

	Optional<WebhookRequest> findByWebhookIdAndId(UUID webhookId, Long eventId);

	Page<WebhookRequest> listByWebhookId(UUID webhookId, Pageable pageable);

	long countByWebhookId(UUID webhookId);

	long sumPayloadSizeByWebhookId(UUID webhookId);

	void deleteByWebhookId(UUID webhookId);

	WebhookRequestDto getEvent(String inboxIdOrSlug, Long eventId);

	EventStatsDto getStats(String inboxIdOrSlug);

	Page<WebhookRequestDto> listEvents(
			String inboxIdOrSlug, Pageable pageable, String method, String statusFilter, String ip, Long requestId);

	void clearEvents(String inboxIdOrSlug);

	ReplayResultDto replay(Long eventId, String targetUrl);
}
