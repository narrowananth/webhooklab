plugins {
    id("build.library")
}

dependencies {
    implementation(platform(libs.spring.boot.dependencies))
    api(libs.spring.boot.starter.websocket)
    api(libs.spring.boot.starter.web)

    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
}
