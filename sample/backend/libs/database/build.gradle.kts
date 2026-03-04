plugins {
    id("build.library")
}

dependencies {
    api(libs.spring.boot.starter.data.jpa)
    implementation(libs.postgresql)
}
