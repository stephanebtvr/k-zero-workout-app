package com.ironpath.program.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface SpringDataProgramRepository : JpaRepository<ProgramJpaEntity, UUID> {
    fun findAllByCreatedByOrderByCreatedAtDesc(createdBy: UUID): List<ProgramJpaEntity>
}
