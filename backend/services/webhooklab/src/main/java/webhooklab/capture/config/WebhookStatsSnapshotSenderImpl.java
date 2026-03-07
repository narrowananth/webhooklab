package webhooklab.capture.config;

import webhooklab.webhookrequest.dto.EventStatsDto;
import webhooklab.webhookrequest.service.WebhookRequestService;
import webhooklab.webhookrequest.service.mappers.WebhookRequestMapper;
import webhooklab.websocket.WebhookStatsSnapshotSender;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Component
@RequiredArgsConstructor
public class WebhookStatsSnapshotSenderImpl implements WebhookStatsSnapshotSender {

	private static final Logger LOGGER = LoggerFactory.getLogger(WebhookStatsSnapshotSenderImpl.class);

	private final WebhookRequestService webhookRequestService;
	private final WebhookRequestMapper webhookRequestMapper;
	private final ObjectMapper objectMapper;

	@Override
	public void sendToSession(WebSocketSession session, String webhookId) {
		if (!session.isOpen()) return;
		try {
			EventStatsDto stats = webhookRequestService.getStats(webhookId);
			var dto = webhookRequestMapper.toStatsSnapshotMessageDto(stats);
			String payload = objectMapper.writeValueAsString(dto);
			session.sendMessage(new TextMessage(payload));
		} catch (JsonProcessingException e) {
			LOGGER.debug("Failed to build stats snapshot JSON", e);
		} catch (Exception e) {
			LOGGER.debug("Failed to send stats snapshot to session", e);
		}
	}
}
