package com.ironpath.program.domain.repository

import com.ironpath.program.domain.model.WorkoutProgram
import java.util.UUID

/**
 * ProgramRepository — Port domaine pour la persistance des programmes.
 */
interface ProgramRepository {
    /** Liste les programmes d'un utilisateur / résumé sans récupérer tous les exercices si désiré, ou complets */
    fun findAllByUserId(userId: UUID): List<WorkoutProgram>

    /** Récupère un programme complet (avec jours et exercices) par son ID */
    fun findById(id: UUID): WorkoutProgram?

    /** Persiste un programme complet (création ou mise à jour, inclut jours et exercices) */
    fun save(program: WorkoutProgram): WorkoutProgram

    /** Supprime un programme */
    fun deleteById(id: UUID)
}
