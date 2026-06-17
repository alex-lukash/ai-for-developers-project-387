package dev.lukash.backend.repository

import dev.lukash.backend.domain.BookingEntity
import dev.lukash.backend.domain.EventTypeEntity
import dev.lukash.backend.domain.OwnerEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant

interface OwnerRepository : JpaRepository<OwnerEntity, Long> {
    fun findFirstByOrderByIdAsc(): OwnerEntity?
}

interface EventTypeRepository : JpaRepository<EventTypeEntity, Long> {
    fun findBySlug(slug: String): EventTypeEntity?
    fun existsBySlug(slug: String): Boolean
    fun findAllByOrderByIdAsc(): List<EventTypeEntity>
    fun findByIsActiveTrueOrderByIdAsc(): List<EventTypeEntity>
}

interface BookingRepository : JpaRepository<BookingEntity, Long> {
    /**
     * Global busyness check: an existing booking overlaps the half-open interval
     * [start, end) iff existing.startAt < end AND existing.endAt > start.
     */
    fun existsByStartAtLessThanAndEndAtGreaterThan(end: Instant, start: Instant): Boolean

    /** Bookings touching a window, used to subtract busy time during slot generation. */
    fun findByStartAtLessThanAndEndAtGreaterThan(end: Instant, start: Instant): List<BookingEntity>

    /** Upcoming bookings (start_at >= now), ascending. */
    fun findByStartAtGreaterThanEqualOrderByStartAtAsc(now: Instant): List<BookingEntity>

    /** Upcoming bookings within [from, to), ascending. */
    fun findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
        from: Instant,
        to: Instant,
    ): List<BookingEntity>
}
