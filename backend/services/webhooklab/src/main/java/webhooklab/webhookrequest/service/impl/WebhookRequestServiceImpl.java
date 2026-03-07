package webhooklab.webhookrequest.service.impl;

import webhooklab.common.enums.ErrorCode;
import webhooklab.webhook.entity.Webhook;
import webhooklab.webhook.service.WebhookService;
import webhooklab.webhookrequest.dto.EventStatsDto;
import webhooklab.webhookrequest.dto.ReplayResultDto;
import webhooklab.webhookrequest.dto.WebhookRequestDto;
import webhooklab.webhookrequest.entity.WebhookRequest;
import webhooklab.webhookrequest.repository.WebhookRequestRepository;
import webhooklab.webhookrequest.service.WebhookRequestService;
import webhooklab.webhookrequest.service.mappers.WebhookRequestMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WebhookRequestServiceImpl implements WebhookRequestService {

	private final WebhookRequestRepository requestRepository;
	private final WebhookService webhookService;
	private final WebhookRequestMapper webhookRequestMapper;

	@Override
	@Transactional
	public WebhookRequest capture(
			Webhook webhook,
			String method,
			String url,
			Map<String, String> headers,
			Map<String, String> queryParams,
			Map<String, Object> body,
			String rawBody,
			String ip) {
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
		return requestRepository.findByWebhook_WebhookIdOrderByIdDesc(webhookId, pageable);
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
	public WebhookRequestDto getEvent(String inboxIdOrSlug, Long eventId) {
		return webhookService
				.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.flatMap(webhook -> findByWebhookIdAndId(webhook.getWebhookId(), eventId))
				.map(webhookRequestMapper::toDto)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
	}

	@Override
	public EventStatsDto getStats(String inboxIdOrSlug) {
		Webhook webhook = webhookService
				.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
		int count = (int) countByWebhookId(webhook.getWebhookId());
		long totalSize = sumPayloadSizeByWebhookId(webhook.getWebhookId());
		return webhookRequestMapper.toEventStatsDto(count, totalSize);
	}

	@Override
	public Page<WebhookRequestDto> listEvents(
			String inboxIdOrSlug, Pageable pageable, String method, String statusFilter, String ip, Long requestId) {
		Webhook webhook = webhookService
				.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
		UUID webhookId = webhook.getWebhookId();

		Page<WebhookRequest> eventPage;
		if (method == null
				&& (statusFilter == null || statusFilter.isBlank())
				&& (ip == null || ip.isBlank())
				&& requestId == null) {
			eventPage = listByWebhookId(webhookId, pageable);
		} else {
			Pageable withSort = PageRequest.of(
					pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "id"));
			eventPage =
					requestRepository.findAll(buildListSpec(webhookId, method, statusFilter, ip, requestId), withSort);
		}

		List<WebhookRequestDto> content =
				eventPage.getContent().stream().map(webhookRequestMapper::toDto).toList();
		return new PageImpl<>(content, eventPage.getPageable(), eventPage.getTotalElements());
	}

	private Specification<WebhookRequest> buildListSpec(
			UUID webhookId, String method, String statusFilter, String ip, Long requestId) {
		return (root, query, cb) -> {
			query.distinct(true);
			Join<WebhookRequest, Webhook> webhookJoin = root.join("webhook");
			List<Predicate> list = new ArrayList<>();
			list.add(cb.equal(webhookJoin.get("webhookId"), webhookId));
			if (method != null && !method.isBlank()) {
				list.add(cb.equal(cb.upper(root.get("method")), method.toUpperCase()));
			}
			if (requestId != null) {
				list.add(cb.equal(root.get("id"), requestId));
			}
			if (ip != null && !ip.isBlank()) {
				list.add(cb.like(cb.lower(root.get("ip")), "%" + ip.toLowerCase() + "%"));
			}
			if (statusFilter != null && !statusFilter.isBlank()) {
				var status = root.get("status");
				var coalesce = cb.coalesce(status, cb.literal(200));
				Expression<Integer> num = coalesce.as(Integer.class);
				switch (statusFilter) {
					case "2xx" -> list.add(cb.and(cb.ge(num, 200), cb.le(num, 299)));
					case "4xx" -> list.add(cb.and(cb.ge(num, 400), cb.le(num, 499)));
					case "5xx" -> list.add(cb.and(cb.ge(num, 500), cb.le(num, 599)));
					default -> {
						/* ignore invalid */
					}
				}
			}
			return cb.and(list.toArray(new Predicate[0]));
		};
	}

	@Override
	@Transactional
	public void clearEvents(String inboxIdOrSlug) {
		Webhook webhook = webhookService
				.findEntityByWebhookIdOrSlug(inboxIdOrSlug)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
		deleteByWebhookId(webhook.getWebhookId());
	}

	@Override
	public ReplayResultDto replay(Long eventId, String targetUrl) {
		return findByEventId(eventId)
				.map(req -> doReplay(req, targetUrl))
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
	}

	private ReplayResultDto doReplay(WebhookRequest req, String targetUrl) {
		try {
			HttpRequest.BodyPublisher bodyPublisher = req.getRawBody() != null
					? HttpRequest.BodyPublishers.ofString(req.getRawBody())
					: HttpRequest.BodyPublishers.noBody();
			HttpRequest.Builder builder =
					HttpRequest.newBuilder().uri(URI.create(targetUrl)).method(req.getMethod(), bodyPublisher);
			if (req.getHeaders() != null) {
				req.getHeaders().forEach(builder::header);
			}

			boolean hasContentType = req.getHeaders() != null
					&& req.getHeaders().entrySet().stream().anyMatch(e -> "content-type".equalsIgnoreCase(e.getKey()));
			if (!hasContentType && (req.getRawBody() != null || req.getBody() != null)) {
				String inferred = inferContentType(req);
				if (inferred != null) {
					builder.header("Content-Type", inferred);
				}
			}
			HttpResponse<String> response =
					HttpClient.newHttpClient().send(builder.build(), HttpResponse.BodyHandlers.ofString());
			int status = response.statusCode();
			String statusText = status == 200 ? "OK" : "Error";
			boolean ok = status >= 200 && status < 300;
			return webhookRequestMapper.toReplayResultDto(status, statusText, ok);
		} catch (Exception e) {
			return webhookRequestMapper.toReplayResultDto(500, "Error", false);
		}
	}

	private static String inferContentType(WebhookRequest req) {
		String raw = req.getRawBody();
		if (raw != null && !raw.isBlank()) {
			String t = raw.trim();
			if (t.startsWith("<")) return "application/xml";
			if (t.startsWith("{") || t.startsWith("[")) return "application/json";
			if (t.contains("=") && t.contains("&")) return "application/x-www-form-urlencoded";
		}
		if (req.getBody() != null) return "application/json";
		return null;
	}
}
