FROM bellsoft/liberica-runtime-container:jdk-25-glibc AS builder

WORKDIR /app

COPY gradle/ gradle/
COPY gradlew gradlew
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY buildSrc/ buildSrc/

COPY libs/ libs/
COPY services/ services/

RUN chmod +x gradlew && ./gradlew :services:webhooklab:bootJar -x test --no-daemon

FROM bellsoft/liberica-runtime-container:jre-25-glibc

RUN apk add --no-cache curl

RUN addgroup -S app && adduser -S app -G app -h /home/app

RUN mkdir -p /app && chown -R app:app /app

USER app
WORKDIR /app

COPY --from=builder --chown=app:app /app/services/webhooklab/build/libs/*.jar app.jar

EXPOSE 4000

ENTRYPOINT ["java", "-jar", "app.jar"]
