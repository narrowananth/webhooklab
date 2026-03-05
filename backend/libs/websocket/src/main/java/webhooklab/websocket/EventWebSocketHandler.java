package webhooklab.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class EventWebSocketHandler extends TextWebSocketHandler {

	private final WebSocketSessionStore sessionStore;

	public EventWebSocketHandler(WebSocketSessionStore sessionStore) {
		this.sessionStore = sessionStore;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		String webhookId = webhookIdFrom(session);
		if (webhookId == null || webhookId.isBlank()) {
			session.close(CloseStatus.POLICY_VIOLATION.withReason("Missing webhookId"));
			return;
		}
		sessionStore.add(webhookId, session);
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		String webhookId = webhookIdFrom(session);
		if (webhookId != null) {
			sessionStore.remove(webhookId, session);
		}
	}

	private static String webhookIdFrom(WebSocketSession session) {
		String query = session.getUri() != null ? session.getUri().getQuery() : null;
		if (query == null) return null;
		return UriComponentsBuilder.fromUriString("/?" + query)
				.build()
				.getQueryParams()
				.getFirst("webhookId");
	}
}
