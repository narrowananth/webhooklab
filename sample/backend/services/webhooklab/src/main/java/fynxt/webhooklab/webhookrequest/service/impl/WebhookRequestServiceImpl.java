package fynxt.webhooklab.webhookrequest.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fynxt.webhooklab.webhook.service.WebhookService;
import fynxt.webhooklab.webhook.entity.Webhook;
import fynxt.webhooklab.webhookrequest.dto.EventListResult;
import fynxt.webhooklab.webhookrequest.dto.EventStatsDto;
import fynxt.webhooklab.webhookrequest.dto.ReplayResultDto;
import fynxt.webhooklab.webhookrequest.dto.WebhookRequestDto;
import fynxt.webhooklab.webhookrequest.entity.WebhookRequest;
import fynxt.webhooklab.webhookrequest.repository.WebhookRequestRepository;
import fynxt.webhooklab.webhookrequest.service.WebhookRequestService;
import fynxt.webhooklab.webhookrequest.service.mappers.WebhookRequestMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebhookRequestServiceImpl implements WebhookRequestService {

	private final WebhookRequestRepository requestRepository;
	private final WebhookService webhookService;
	private final WebhookRequestMapper webhookRequestMapper;

	@Override
	@Transactional
	public WebhookRequest capture(Webhook webhook, String method, String url,
			Map<String, String> headers, Map<String, String> queryParams,
			Map<String, Object> body, String rawBody, String ip) {
		WebhookRequest request = webhookRequestMapper.toEntity(
				webhook,
				method,
				url,
				headers != null ? headers : Map.of(),
				queryParams != null ? queryParams : Map.of(),
				body,
				rawBody,
				ip,
				200);
		return requestRepository.save(request);
	}

	@Override
	public Optional<WebhookRequest> findByEventId(Long eventId) {
		return requestRepository.findById(eventId);
	}

	@Override
	public Optional<WebhookRequest> findByWebhookIdAndId(UUID webhookId, Long eventId) {
		return requestRepository.findByWebhook_WebhookIdAndId(webhookId, eventId);
	}

	@Override
	public Page<WebhookRequest> listByWebhookId(UUID webhookId, Pageable pageable) {
		return requestRepository.findByWebhook_WebhookIdOrderByCreatedAtDesc(webhookId, pageable);
	}

	@Override
	public long countByWebhookId(UUID webhookId) {
		return requestRepository.countByWebhookId(webhookId);
	}

	@Override
	public long sumPayloadSizeByWebhookId(UUID webhookId) {
		return requestRepository.sumPayloadSizeByWebhookId(webhookId);
	}

	@Override
	@Transactional
	public void deleteByWebhookId(UUID webhookId) {
		requestRepository.deleteByWebhookId(webhookId);
	}

	@Override
	public Optional<WebhookRequestDto> getEvent(String inboxIdOrSlug, Long eventId) {
		return webhookService.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.flatMap(webhook -> findByWebhookIdAndId(webhook.getWebhookId(), eventId))
				.map(webhookRequestMapper::toDto);
	}

	@Override
	public Optional<EventStatsDto> getStats(String inboxIdOrSlug) {
		return webhookService.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.map(webhook -> {
					int count = (int) countByWebhookId(webhook.getWebhookId());
					long totalSize = sumPayloadSizeByWebhookId(webhook.getWebhookId());
					return webhookRequestMapper.toEventStatsDto(count, totalSize);
				});
	}

	@Override
	public Optional<EventListResult> listEvents(String inboxIdOrSlug, int page, int limit) {
		return webhookService.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.map(webhook -> {
					int safeLimit = Math.min(100, Math.max(1, limit));
					int safePage = Math.max(1, page);
					Pageable pageable = PageRequest.of(safePage - 1, safeLimit);
					var eventPage = listByWebhookId(webhook.getWebhookId(), pageable);
					long total = eventPage.getTotalElements();
					List<WebhookRequestDto> events = eventPage.getContent().stream()
							.map(webhookRequestMapper::toDto)
							.toList();
					String nextPageToken = (safePage * safeLimit) < total ? String.valueOf(safePage + 1) : null;
					Map<String, Object> pagination = Map.of(
							"page", safePage,
							"limit", safeLimit,
							"total", total,
							"totalPages", (int) Math.ceil((double) total / safeLimit));
					return webhookRequestMapper.toEventListResult(events, nextPageToken, total, pagination);
				});
	}

	@Override
	@Transactional
	public boolean clearEvents(String inboxIdOrSlug) {
		return webhookService.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.map(webhook -> {
					deleteByWebhookId(webhook.getWebhookId());
					return true;
				})
				.orElse(false);
	}

	@Override
	public Optional<ReplayResultDto> replay(Long eventId, String targetUrl) {
		return findByEventId(eventId)
				.map(req -> doReplay(req, targetUrl));
	}

	private ReplayResultDto doReplay(WebhookRequest req, String targetUrl) {
		try {
			java.net.http.HttpRequest.Builder builder = java.net.http.HttpRequest.newBuilder()
					.uri(java.net.URI.create(targetUrl))
					.method(req.getMethod(), req.getRawBody() != null
							? java.net.http.HttpRequest.BodyPublishers.ofString(req.getRawBody())
							: java.net.http.HttpRequest.BodyPublishers.noBody());
			if (req.getHeaders() != null) {
				req.getHeaders().forEach(builder::header);
			}
			java.net.http.HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
					.send(builder.build(), java.net.http.HttpResponse.BodyHandlers.ofString());
			int status = response.statusCode();
			String statusText = status == 200 ? "OK" : "Error";
			boolean ok = status >= 200 && status < 300;
			return webhookRequestMapper.toReplayResultDto(status, statusText, ok);
		} catch (Exception e) {
			return webhookRequestMapper.toReplayResultDto(500, "Error", false);
		}
	}
}
