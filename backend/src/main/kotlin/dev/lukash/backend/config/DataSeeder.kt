package dev.lukash.backend.config

import dev.lukash.backend.domain.EventTypeEntity
import dev.lukash.backend.domain.OwnerEntity
import dev.lukash.backend.repository.EventTypeRepository
import dev.lukash.backend.repository.OwnerRepository
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Instant
import java.time.LocalTime

/**
 * Seeds the single owner and the sample event types on startup, aligned with the
 * `@example` data in spec/api.tsp so the backend tells the same story as the
 * frontend mock/tests. H2 is in-memory, so this runs on every boot.
 */
@Configuration
class DataSeeder {

    @Bean
    fun seedData(
        ownerRepository: OwnerRepository,
        eventTypeRepository: EventTypeRepository,
    ) = ApplicationRunner {
        if (ownerRepository.count() == 0L) {
            ownerRepository.save(
                OwnerEntity(
                    name = "Ada Lovelace",
                    email = "ada@example.com",
                    timezone = "UTC",
                    workdayStart = LocalTime.of(9, 0),
                    workdayEnd = LocalTime.of(17, 0),
                    workingDays = mutableListOf(1, 2, 3, 4, 5),
                ),
            )
        }
        if (eventTypeRepository.count() == 0L) {
            val createdAt = Instant.parse("2026-06-01T00:00:00Z")
            eventTypeRepository.save(
                EventTypeEntity(
                    slug = "intro-call",
                    title = "Intro Call",
                    description = "A quick chat to see if we're a fit.",
                    durationMinutes = 30,
                    isActive = true,
                    createdAt = createdAt,
                    updatedAt = createdAt,
                ),
            )
            eventTypeRepository.save(
                EventTypeEntity(
                    slug = "deep-dive",
                    title = "Deep Dive",
                    description = "A longer, focused working session.",
                    durationMinutes = 60,
                    isActive = false,
                    createdAt = createdAt,
                    updatedAt = createdAt,
                ),
            )
        }
    }
}
