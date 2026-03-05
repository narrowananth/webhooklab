plugins {
    id("build.common")
    id("build.database")
    alias(libs.plugins.spring.boot)
    application
}

dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    implementation(libs.spring.boot.starter.web)
    implementation(libs.flyway.core)
    implementation(libs.flyway.postgresql)
    implementation(libs.springdoc.openapi.starter.webmvc.ui)

    implementation(project(":libs:common"))
    implementation(project(":libs:auth"))
    implementation(project(":libs:database"))
    implementation(project(":libs:mapper"))
    implementation(project(":libs:websocket"))
}

application {
    mainClass.set("webhooklab.WebhooklabApplication")
}
