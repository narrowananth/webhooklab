package liveflares.auth.config;

import liveflares.auth.config.properties.AuthProperties;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@EnableConfigurationProperties({AuthProperties.class})
@ComponentScan(basePackages = {"liveflares.auth.filter", "liveflares.auth.config"})
public class AuthAutoConfiguration {}
