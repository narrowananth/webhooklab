plugins {
    id("build.library")
}

dependencies {
    implementation(platform(libs.spring.boot.dependencies))

    api(project(":libs:common"))

    api(libs.spring.boot.starter.web)
    api("org.springframework.boot:spring-boot-starter-security")
    api("org.springframework.boot:spring-boot-starter-validation")

    api(libs.jackson.databind)

    implementation("org.apache.commons:commons-lang3")

    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)

    api(libs.springdoc.openapi.starter.webmvc.ui)
}
