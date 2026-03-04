plugins {
    id("build.library")
}

dependencies {
    api(libs.mapstruct)

    annotationProcessor(libs.mapstruct.processor)

    implementation(libs.jackson.databind)
    implementation(libs.spring.context)
    implementation(platform(libs.spring.boot.dependencies))
}
