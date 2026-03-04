package fynxt.webhooklab.webhook.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fynxt.webhooklab.webhook.entity.Webhook;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, Long> {

	Optional<Webhook> findByWebhookId(UUID webhookId);

	Optional<Webhook> findBySlug(String slug);
}
