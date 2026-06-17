package dev.lukash.backend.config

import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.web.method.HandlerTypePredicate
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver

/**
 * Prefixes every controller in `dev.lukash.backend.web` with `/api`, matching the
 * `@server("/api")` base path in the spec. Kept off the generated `@RequestMapping`s
 * (which use bare paths like `/owner`) so generated code stays untouched.
 *
 * Also serves the bundled React SPA from `classpath:/static/` (placed there at image
 * build time by the root Dockerfile) with a fallback to `index.html` for client-side
 * routes — the frontend uses `createBrowserRouter`, so deep links like `/admin/bookings`
 * must resolve to the SPA shell. Controller mappings under the `/api` prefix take
 * precedence over the catch-all resource handler, so the API is unaffected.
 */
@Configuration
class WebConfig : WebMvcConfigurer {

    override fun configurePathMatch(configurer: PathMatchConfigurer) {
        configurer.addPathPrefix("/api", HandlerTypePredicate.forBasePackage("dev.lukash.backend.web"))
    }

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(object : PathResourceResolver() {
                override fun getResource(resourcePath: String, location: Resource): Resource? {
                    val requested = location.createRelative(resourcePath)
                    if (requested.exists() && requested.isReadable) return requested
                    // Don't hijack API or hashed asset paths — let them 404 honestly.
                    if (resourcePath.startsWith("api/") || resourcePath.startsWith("assets/")) return null
                    return ClassPathResource("static/index.html")
                }
            })
    }
}
