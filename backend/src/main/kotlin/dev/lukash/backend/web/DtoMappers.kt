package dev.lukash.backend.web

import dev.lukash.backend.domain.BookingEntity
import dev.lukash.backend.domain.EventTypeEntity
import dev.lukash.backend.domain.OwnerEntity
import dev.lukash.backend.generated.model.Booking
import dev.lukash.backend.generated.model.BookingEventType
import dev.lukash.backend.generated.model.EventType
import dev.lukash.backend.generated.model.Owner

/**
 * Mappers from JPA entities to the generated wire DTOs. Entity ids are Long; the
 * contract exposes them as int32, so they are narrowed here.
 */

fun OwnerEntity.toDto(): Owner =
    Owner(
        name = name,
        email = email,
        timezone = timezone,
        workdayStart = workdayStart,
        workdayEnd = workdayEnd,
        workingDays = workingDays.toList(),
    )

fun EventTypeEntity.toDto(): EventType =
    EventType(
        id = requireId(),
        slug = slug,
        title = title,
        description = description,
        durationMinutes = durationMinutes,
        isActive = isActive,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )

fun BookingEntity.toDto(): Booking =
    Booking(
        id = requireId(),
        eventType = BookingEventType(
            id = eventType.requireId(),
            slug = eventType.slug,
            title = eventType.title,
            durationMinutes = eventType.durationMinutes,
        ),
        startAt = startAt,
        endAt = endAt,
        guestName = guestName,
        guestEmail = guestEmail,
        createdAt = createdAt,
    )

private fun EventTypeEntity.requireId(): Int =
    (id ?: error("EventType is not persisted")).toInt()

private fun BookingEntity.requireId(): Int =
    (id ?: error("Booking is not persisted")).toInt()
