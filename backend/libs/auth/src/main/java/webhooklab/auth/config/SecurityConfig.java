package webhooklab.auth.config;

import webhooklab.auth.config.properties.AuthProperties;
import webhooklab.auth.filter.CorrelationIdWebFilter;
import webhooklab.auth.filter.FaviconFilter;
import webhooklab.auth.filter.RawBodyCachingFilter;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final AuthProperties authProperties;

	public SecurityConfig(AuthProperties authProperties) {
		this.authProperties = authProperties;
	}

	@Bean
	public RawBodyCachingFilter rawBodyCachingFilter() {
		return new RawBodyCachingFilter();
	}

	@Bean
	public CorrelationIdWebFilter correlationIdWebFilter() {
		return new CorrelationIdWebFilter();
	}

	@Bean
	public FilterRegistrationBean<FaviconFilter> faviconFilterRegistration() {
		FilterRegistrationBean<FaviconFilter> bean = new FilterRegistrationBean<>(new FaviconFilter());
		bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
		bean.addUrlPatterns("/favicon.ico");
		return bean;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			@Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource,
			RawBodyCachingFilter rawBodyCachingFilter,
			CorrelationIdWebFilter correlationIdWebFilter)
			throws Exception {
		http.csrf(csrf -> csrf.disable())
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.authorizeHttpRequests(authz -> authz.requestMatchers("/error", "/favicon.ico")
						.permitAll()
						.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
						.permitAll()
						.requestMatchers("/ws", "/ws/**")
						.permitAll()
						.anyRequest()
						.permitAll())
				.addFilterAfter(rawBodyCachingFilter, SecurityContextHolderFilter.class)
				.addFilterAfter(correlationIdWebFilter, RawBodyCachingFilter.class);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		String frontendUrl = authProperties.frontendUrl();
		if (frontendUrl != null && !frontendUrl.isBlank()) {
			config.setAllowedOriginPatterns(List.of(frontendUrl.split(",")));
		}
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.addAllowedHeader("*");
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	public FilterRegistrationBean<CorsFilter> corsFilter(
			@Qualifier("corsConfigurationSource") CorsConfigurationSource source) {
		FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
		bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
		return bean;
	}
}
