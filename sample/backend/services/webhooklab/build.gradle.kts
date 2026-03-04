plugins {
    id("build.common")
    id("build.database")
    alias(libs.plugins.spring.boot)
}

dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.jdbc)
    implementation(libs.postgresql)
    implementation(libs.flyway.core)
    implementation(libs.flyway.postgresql)
    implementation(libs.springdoc.openapi.starter.webmvc.ui)

    implementation(project(":libs:common"))
    implementation(project(":libs:database"))
    implementation(project(":libs:mapper"))
}

application {
    mainClass.set("fynxt.webhooklab.WebhooklabApplication")
}
