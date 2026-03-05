package webhooklab.webhook.service.impl;

import webhooklab.auth.config.properties.AuthProperties;
import webhooklab.common.enums.ErrorCode;
import webhooklab.webhook.dto.WebhookDto;
import webhooklab.webhook.entity.Webhook;
import webhooklab.webhook.repository.WebhookRepository;
import webhooklab.webhook.service.WebhookService;
import webhooklab.webhook.service.mappers.WebhookMapper;

import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WebhookServiceImpl implements WebhookService {

	private final WebhookRepository webhookRepository;
	private final WebhookMapper webhookMapper;
	private final AuthProperties authProperties;

	@Override
	@Transactional
	public WebhookDto create(String name, String slug) {
		String cleanSlug = (slug != null && slug.matches("^[a-zA-Z0-9_-]{3,100}$")) ? slug.toLowerCase() : null;
		Webhook webhook = webhookMapper.toEntity(name, cleanSlug);
		if (webhook == null) {
			webhook = new Webhook();
			webhook.setWebhookId(java.util.UUID.randomUUID());
			webhook.setName(name);
			webhook.setSlug(cleanSlug);
		}
		Webhook saved = webhookRepository.save(webhook);
		return webhookMapper.toDto(saved);
	}

	@Override
	@Transactional
	public WebhookDto createWithUrl(String name, String slug, String requestOrigin) {
		WebhookDto dto = create(name, slug);
		String baseUrl = getWebhookBaseUrl(requestOrigin);
		findEntityByWebhookIdOrSlug(dto.getId().toString())
				.ifPresent(entity -> dto.setUrl(buildWebhookUrl(entity, baseUrl)));
		return dto;
	}

	@Override
	public WebhookDto getBySlug(String slug, String requestOrigin) {
		Webhook entity = webhookRepository
				.findBySlug(slug)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
		WebhookDto dto = webhookMapper.toDto(entity);
		dto.setUrl(buildWebhookUrl(entity, getWebhookBaseUrl(requestOrigin)));
		return dto;
	}

	@Override
	public WebhookDto getByIdOrSlug(String idOrSlug, String requestOrigin) {
		Webhook entity = findEntityByWebhookIdOrSlug(idOrSlug)
				.orElseThrow(() ->
						new ResponseStatusException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.getCode()));
		WebhookDto dto = webhookMapper.toDto(entity);
		dto.setUrl(buildWebhookUrl(entity, getWebhookBaseUrl(requestOrigin)));
		return dto;
	}

	@Override
	public Optional<Webhook> findEntityByWebhookIdOrSlug(String webhookIdOrSlug) {
		try {
			UUID uuid = UUID.fromString(webhookIdOrSlug);
			return webhookRepository.findByWebhookId(uuid);
		} catch (IllegalArgumentException e) {
			return webhookRepository.findBySlug(webhookIdOrSlug);
		}
	}

	@Override
	public String getWebhookBaseUrl(String requestOrigin) {
		String base = authProperties.frontendUrl();
		if (base != null && !base.isEmpty() && !"*".equals(base)) {
			return base.replaceAll("/$", "");
		}
		if (requestOrigin != null && !requestOrigin.isEmpty()) {
			return requestOrigin.replaceAll("/$", "");
		}
		return base;
	}

	@Override
	public String buildWebhookUrl(Webhook webhook, String baseUrl) {
		String path = webhook.getSlug() != null ? "webhook/" + webhook.getSlug() : "webhook/" + webhook.getWebhookId();
		return baseUrl + "/" + path;
	}
}
