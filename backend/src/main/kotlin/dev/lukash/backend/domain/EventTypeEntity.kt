package dev.lukash.backend.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/** A type of meeting the owner offers. One EventType has many Bookings (1:N). */
@Entity
@Table(name = "event_types")
class EventTypeEntity(
    @Column(unique = true, nullable = false)
    var slug: String,
    var title: String,
    @Column(columnDefinition = "text")
    var description: String,
    /** Meeting length in minutes; also the step of the slot grid. */
    @Column(name = "duration_minutes")
    var durationMinutes: Int,
    @Column(name = "is_active")
    var isActive: Boolean,
    @Column(name = "created_at")
    var createdAt: Instant,
    @Column(name = "updated_at")
    var updatedAt: Instant,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
)
