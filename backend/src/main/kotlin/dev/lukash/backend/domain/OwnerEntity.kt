package dev.lukash.backend.domain

import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.Table
import java.time.LocalTime

/**
 * The single calendar owner (profile + availability window). Seeded on startup;
 * there is exactly one row (single-owner system, no auth).
 */
@Entity
@Table(name = "owners")
class OwnerEntity(
    var name: String,
    var email: String,
    var timezone: String,
    @Column(name = "workday_start")
    var workdayStart: LocalTime,
    @Column(name = "workday_end")
    var workdayEnd: LocalTime,
    /** Working weekdays as ISO numbers (1 = Monday ... 7 = Sunday). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "owner_working_days", joinColumns = [JoinColumn(name = "owner_id")])
    @Column(name = "weekday")
    var workingDays: MutableList<Int>,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
)
