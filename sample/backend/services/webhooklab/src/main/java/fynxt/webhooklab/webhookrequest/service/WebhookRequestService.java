package fynxt.webhooklab.webhookrequest.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import fynxt.webhooklab.webhook.entity.Webhook;
import fynxt.webhooklab.webhookrequest.dto.EventListResult;
import fynxt.webhooklab.webhookrequest.dto.EventStatsDto;
import fynxt.webhooklab.webhookrequest.dto.ReplayResultDto;
import fynxt.webhooklab.webhookrequest.dto.WebhookRequestDto;
import fynxt.webhooklab.webhookrequest.entity.WebhookRequest;

public interface WebhookRequestService {

	WebhookRequest capture(Webhook webhook, String method, String url,
			java.util.Map<String, String> headers, java.util.Map<String, String> queryParams,
			java.util.Map<String, Object> body, String rawBody, String ip);

	Optional<WebhookRequest> findByEventId(Long eventId);

	Optional<WebhookRequest> findByWebhookIdAndId(UUID webhookId, Long eventId);

	Page<WebhookRequest> listByWebhookId(UUID webhookId, Pageable pageable);

	long countByWebhookId(UUID webhookId);

	long sumPayloadSizeByWebhookId(UUID webhookId);

	void deleteByWebhookId(UUID webhookId);

	Optional<WebhookRequestDto> getEvent(String inboxIdOrSlug, Long eventId);

	Optional<EventStatsDto> getStats(String inboxIdOrSlug);

	Optional<EventListResult> listEvents(String inboxIdOrSlug, int page, int limit);

	boolean clearEvents(String inboxIdOrSlug);

	Optional<ReplayResultDto> replay(Long eventId, String targetUrl);
}
