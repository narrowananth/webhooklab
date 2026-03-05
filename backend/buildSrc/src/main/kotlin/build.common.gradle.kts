import org.gradle.api.artifacts.VersionCatalogsExtension

plugins {
    java
}

repositories {
    mavenCentral()
}

val libs = extensions.getByType<VersionCatalogsExtension>().named("libs")

dependencies {
    implementation(platform(libs.findLibrary("spring-boot-dependencies").get()))

    compileOnly(libs.findLibrary("lombok").get())

    annotationProcessor(libs.findLibrary("lombok").get())
    annotationProcessor(libs.findLibrary("mapstruct.processor").get())
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
