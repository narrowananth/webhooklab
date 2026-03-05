package webhooklab.auth.config;

import webhooklab.auth.config.properties.AuthProperties;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@EnableConfigurationProperties({AuthProperties.class})
@ComponentScan(basePackages = {"webhooklab.auth.filter", "webhooklab.auth.config"})
public class AuthAutoConfiguration {}
