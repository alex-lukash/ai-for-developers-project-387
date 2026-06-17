package dev.lukash.backend.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.Instant

/**
 * A guest's reservation of one slot. Many Bookings belong to one EventType (N:1).
 *
 * The global non-overlap rule (the single owner can't be double-booked) is enforced
 * at the application level via an overlap query before insert. H2 has no `EXCLUDE`
 * constraint, so `UNIQUE(start_at)` is the only DB-level guard against an identical
 * start time under a race.
 */
@Entity
@Table(name = "bookings", uniqueConstraints = [UniqueConstraint(columnNames = ["start_at"])])
class BookingEntity(
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "event_type_id", nullable = false)
    var eventType: EventTypeEntity,
    @Column(name = "start_at", nullable = false)
    var startAt: Instant,
    @Column(name = "end_at", nullable = false)
    var endAt: Instant,
    @Column(name = "guest_name")
    var guestName: String,
    @Column(name = "guest_email")
    var guestEmail: String,
    @Column(name = "created_at")
    var createdAt: Instant,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
)
