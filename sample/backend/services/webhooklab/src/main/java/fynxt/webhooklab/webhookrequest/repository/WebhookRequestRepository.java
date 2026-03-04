package fynxt.webhooklab.webhookrequest.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fynxt.webhooklab.webhookrequest.entity.WebhookRequest;

@Repository
public interface WebhookRequestRepository extends JpaRepository<WebhookRequest, Long> {

	Page<WebhookRequest> findByWebhook_WebhookIdOrderByCreatedAtDesc(UUID webhookId, Pageable pageable);

	Optional<WebhookRequest> findByWebhook_WebhookIdAndId(UUID webhookId, Long id);

	@Modifying
	@Query("DELETE FROM WebhookRequest r WHERE r.webhook.webhookId = :webhookId")
	void deleteByWebhookId(@Param("webhookId") UUID webhookId);

	@Query("SELECT COUNT(r) FROM WebhookRequest r WHERE r.webhook.webhookId = :webhookId")
	long countByWebhookId(@Param("webhookId") UUID webhookId);

	@Query(value = "SELECT COALESCE(SUM(LENGTH(COALESCE(raw_body, body::text, ''))), 0) FROM requests WHERE webhook_id = :webhookId", nativeQuery = true)
	long sumPayloadSizeByWebhookId(@Param("webhookId") UUID webhookId);
}
