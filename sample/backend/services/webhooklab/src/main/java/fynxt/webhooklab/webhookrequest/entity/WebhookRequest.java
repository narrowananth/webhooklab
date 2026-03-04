package fynxt.webhooklab.webhookrequest.entity;

import java.time.OffsetDateTime;
import java.util.Map;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import fynxt.webhooklab.webhook.entity.Webhook;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookRequest extends AuditingEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "webhook_id", referencedColumnName = "webhook_id", nullable = false)
	private Webhook webhook;

	@Column(name = "method", nullable = false, length = 10)
	private String method;

	@Column(name = "url", nullable = false, columnDefinition = "text")
	private String url;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "headers", columnDefinition = "jsonb")
	@Builder.Default
	private Map<String, String> headers = Map.of();

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "query_params", columnDefinition = "jsonb")
	@Builder.Default
	private Map<String, String> queryParams = Map.of();

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "body", columnDefinition = "jsonb")
	private Map<String, Object> body;

	@Column(name = "raw_body", columnDefinition = "text")
	private String rawBody;

	@Column(name = "ip", length = 100)
	private String ip;

	@Column(name = "status")
	@Builder.Default
	private Integer status = 200;
}
