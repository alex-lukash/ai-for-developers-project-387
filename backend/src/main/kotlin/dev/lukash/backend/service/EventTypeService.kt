package dev.lukash.backend.service

import dev.lukash.backend.domain.EventTypeEntity
import dev.lukash.backend.generated.model.EventTypeCreate
import dev.lukash.backend.generated.model.EventTypeUpdate
import dev.lukash.backend.repository.EventTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant

@Service
class EventTypeService(
    private val eventTypeRepository: EventTypeRepository,
    private val clock: Clock,
) {

    fun list(includeInactive: Boolean): List<EventTypeEntity> =
        if (includeInactive) {
            eventTypeRepository.findAllByOrderByIdAsc()
        } else {
            eventTypeRepository.findByIsActiveTrueOrderByIdAsc()
        }

    fun read(slug: String): EventTypeEntity =
        eventTypeRepository.findBySlug(slug) ?: throw ApiException.eventTypeNotFound(slug)

    @Transactional
    fun create(payload: EventTypeCreate): EventTypeEntity {
        validate(slug = payload.slug, title = payload.title, durationMinutes = payload.durationMinutes)
        if (eventTypeRepository.existsBySlug(payload.slug)) {
            throw ApiException.slugTaken(payload.slug)
        }
        val now = Instant.now(clock)
        return eventTypeRepository.save(
            EventTypeEntity(
                slug = payload.slug.trim(),
                title = payload.title.trim(),
                description = payload.description,
                durationMinutes = payload.durationMinutes,
                isActive = true,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    @Transactional
    fun update(slug: String, payload: EventTypeUpdate): EventTypeEntity {
        val entity = read(slug)
        payload.durationMinutes?.let {
            if (it < 1) throw ApiException.validationFailed(mapOf("duration_minutes" to listOf("must be at least 1")))
            entity.durationMinutes = it
        }
        payload.title?.let {
            if (it.isBlank()) throw ApiException.validationFailed(mapOf("title" to listOf("must not be blank")))
            entity.title = it.trim()
        }
        payload.description?.let { entity.description = it }
        payload.isActive?.let { entity.isActive = it }
        entity.updatedAt = Instant.now(clock)
        return eventTypeRepository.save(entity)
    }

    @Transactional
    fun delete(slug: String) {
        val entity = read(slug)
        eventTypeRepository.delete(entity)
    }

    private fun validate(slug: String, title: String, durationMinutes: Int) {
        val errors = buildMap<String, List<String>> {
            if (slug.isBlank()) put("slug", listOf("must not be blank"))
            if (title.isBlank()) put("title", listOf("must not be blank"))
            if (durationMinutes < 1) put("duration_minutes", listOf("must be at least 1"))
        }
        if (errors.isNotEmpty()) throw ApiException.validationFailed(errors)
    }
}
