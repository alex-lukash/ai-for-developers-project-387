# Multi-stage build for a single full-stack image: the Spring Boot backend serves
# both the REST API (/api/**) and the bundled React SPA on one port ($PORT).
# The Hexlet check builds this file, runs the container, and expects the app to
# start automatically and listen on $PORT (default 8080).

# ---------------------------------------------------------------------------
# Stage 1: compile the TypeSpec spec -> spec/dist/openapi.yaml.
# This is the codegen input the backend's Gradle build reads (it is not committed).
# ---------------------------------------------------------------------------
FROM node:22-alpine AS spec
WORKDIR /app/spec
COPY spec/package.json spec/package-lock.json ./
RUN npm ci
COPY spec/ ./
RUN npm run compile

# ---------------------------------------------------------------------------
# Stage 2: build the React SPA -> frontend/dist (static files).
# The generated API client is committed, so this stage needs neither the spec
# nor Java. VITE_API_BASE_URL is left unset, so the client defaults to "/api"
# (same-origin), which the backend serves.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: build the Spring Boot boot jar (Kotlin, Java 25 toolchain).
# Layout preserves the backend/ <-> spec/ sibling relationship that
# build.gradle.kts expects ($rootDir/../spec/dist/openapi.yaml). The SPA static
# files are dropped into resources/static so bootJar bundles them.
# ---------------------------------------------------------------------------
FROM eclipse-temurin:25-jdk AS backend-build
WORKDIR /app/backend
# Wrapper + build scripts first for better layer caching.
COPY backend/gradlew ./
COPY backend/gradle ./gradle
COPY backend/build.gradle.kts backend/settings.gradle.kts ./
COPY backend/src ./src
# Codegen input from stage 1 (resolves as ../spec/dist/openapi.yaml).
COPY --from=spec /app/spec/dist /app/spec/dist
# Bundle the built SPA so Spring Boot serves it from classpath:/static/.
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN chmod +x ./gradlew \
 && ./gradlew clean bootJar --no-daemon \
 && cp build/libs/*.jar /app/app.jar

# ---------------------------------------------------------------------------
# Stage 4: runtime. Just the JRE + the boot jar. Starts automatically and reads
# $PORT via application.yaml (server.port: ${PORT:8080}).
# ---------------------------------------------------------------------------
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=backend-build /app/app.jar ./app.jar
# Documentation only; the actual port comes from $PORT at runtime.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
