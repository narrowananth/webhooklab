package fynxt.webhooklab.webhook.service.impl;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fynxt.webhooklab.config.ApiProperties;
import fynxt.webhooklab.webhook.dto.WebhookDto;
import fynxt.webhooklab.webhook.entity.Webhook;
import fynxt.webhooklab.webhook.repository.WebhookRepository;
import fynxt.webhooklab.webhook.service.WebhookService;
import fynxt.webhooklab.webhook.service.mappers.WebhookMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebhookServiceImpl implements WebhookService {

	private final WebhookRepository webhookRepository;
	private final WebhookMapper webhookMapper;
	private final ApiProperties apiProperties;

	@Override
	@Transactional
	public WebhookDto create(String name, String slug) {
		String cleanSlug = (slug != null && slug.matches("^[a-zA-Z0-9_-]{3,100}$"))
				? slug.toLowerCase()
				: null;
		Webhook webhook = webhookMapper.toEntity(name, cleanSlug);
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
	public Optional<WebhookDto> getByIdOrSlug(String idOrSlug, String requestOrigin) {
		return findEntityByWebhookIdOrSlug(idOrSlug)
				.map(entity -> {
					WebhookDto dto = webhookMapper.toDto(entity);
					dto.setUrl(buildWebhookUrl(entity, getWebhookBaseUrl(requestOrigin)));
					return dto;
				});
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
		String base = apiProperties.getFrontendUrl();
		if (base != null && !base.isEmpty() && !"*".equals(base)) {
			return base.replaceAll("/$", "");
		}
		if (requestOrigin != null && !requestOrigin.isEmpty()) {
			return requestOrigin.replaceAll("/$", "");
		}
		return "http://localhost:5173";
	}

	@Override
	public String buildWebhookUrl(Webhook webhook, String baseUrl) {
		String path = webhook.getSlug() != null
				? "webhook/" + webhook.getSlug()
				: "webhook/" + webhook.getWebhookId();
		return baseUrl + "/" + path;
	}
}
