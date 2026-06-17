package dev.lukash.backend.web

import dev.lukash.backend.generated.api.OwnerApi
import dev.lukash.backend.generated.model.Owner
import dev.lukash.backend.service.OwnerService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class OwnerController(private val ownerService: OwnerService) : OwnerApi {

    override fun getOwner(): ResponseEntity<Owner> =
        ResponseEntity.ok(ownerService.get().toDto())
}
