package dev.lukash.backend.service

import dev.lukash.backend.domain.OwnerEntity
import dev.lukash.backend.repository.OwnerRepository
import org.springframework.stereotype.Service

@Service
class OwnerService(private val ownerRepository: OwnerRepository) {

    /** The single seeded owner. Always present after startup seeding. */
    fun get(): OwnerEntity =
        ownerRepository.findFirstByOrderByIdAsc()
            ?: error("Owner is not seeded; this is a bug in the startup seeder.")
}
