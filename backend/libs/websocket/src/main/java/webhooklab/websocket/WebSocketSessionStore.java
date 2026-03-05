package webhooklab.websocket;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class WebSocketSessionStore {

	private final Map<String, Set<WebSocketSession>> sessionsByWebhookId = new ConcurrentHashMap<>();

	public void add(String webhookId, WebSocketSession session) {
		sessionsByWebhookId.compute(webhookId, (k, set) -> {
			Set<WebSocketSession> s = set != null ? set : ConcurrentHashMap.newKeySet();
			s.add(session);
			return s;
		});
	}

	public void remove(String webhookId, WebSocketSession session) {
		sessionsByWebhookId.computeIfPresent(webhookId, (k, set) -> {
			set.remove(session);
			return set.isEmpty() ? null : set;
		});
	}

	public void sendToWebhookId(String webhookId, String payload) {
		Set<WebSocketSession> sessions = sessionsByWebhookId.get(webhookId);
		if (sessions == null) return;
		for (WebSocketSession session : sessions) {
			if (session.isOpen()) {
				try {
					session.sendMessage(new org.springframework.web.socket.TextMessage(payload));
				} catch (IOException ignored) {
					// session may be closed; skip
				}
			}
		}
	}
}
