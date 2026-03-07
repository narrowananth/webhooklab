package liveflares.webhook.repository;

import liveflares.webhook.entity.Webhook;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, Long> {

	Optional<Webhook> findByWebhookId(UUID webhookId);

	Optional<Webhook> findBySlug(String slug);
}
