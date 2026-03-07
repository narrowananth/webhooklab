package liveflares.webhook.entity;

import liveflares.database.audit.AuditingEntity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
		name = "webhooks",
		uniqueConstraints = {@UniqueConstraint(columnNames = "webhook_id")})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Webhook extends AuditingEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "webhook_id", nullable = false, unique = true)
	private UUID webhookId;

	@Column(name = "name", length = 255)
	private String name;

	@Column(name = "slug", length = 100, unique = true)
	private String slug;
}
