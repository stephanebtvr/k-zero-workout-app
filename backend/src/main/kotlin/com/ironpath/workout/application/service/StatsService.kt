package com.ironpath.workout.application.service

import com.ironpath.workout.application.dto.HeatmapDataDto
import com.ironpath.workout.application.dto.OneRmProgressionDto
import com.ironpath.workout.application.dto.UserStatsSummaryDto
import com.ironpath.workout.domain.repository.WorkoutRepository
import org.springframework.stereotype.Service
import java.time.ZoneId
import java.util.UUID

@Service
class StatsService(
    private val workoutRepository: WorkoutRepository
) {

    fun getUserSummary(userId: UUID): UserStatsSummaryDto {
        val workouts = workoutRepository.findAllByUserId(userId).filter { it.endTime != null }
        
        var totalVolume = 0.0
        var totalSets = 0
        var totalReps = 0

        workouts.forEach { w ->
            w.sessionExercises.forEach { ex ->
                ex.sets.filter { it.isCompleted }.forEach { set ->
                    totalVolume += (set.weightKg * set.reps)
                    totalSets++
                    totalReps += set.reps
                }
            }
        }

        // Arrondir le volume
        val roundedVolume = Math.round(totalVolume * 10) / 10.0

        return UserStatsSummaryDto(
            totalWorkouts = workouts.size,
            totalVolumeKg = roundedVolume,
            totalSets = totalSets,
            totalReps = totalReps
        )
    }

    fun getHeatmapData(userId: UUID): List<HeatmapDataDto> {
        val workouts = workoutRepository.findAllByUserId(userId).filter { it.endTime != null }
        
        val countsByDate = workouts.groupingBy { 
            it.startTime.atZone(ZoneId.systemDefault()).toLocalDate() 
        }.eachCount()

        return countsByDate.map { (date, count) ->
            HeatmapDataDto(date, count)
        }.sortedBy { it.date }
    }

    fun getOneRmProgression(userId: UUID, exerciseId: UUID): List<OneRmProgressionDto> {
        val workouts = workoutRepository.findAllByUserId(userId).filter { it.endTime != null }
        
        val progressionList = mutableListOf<OneRmProgressionDto>()

        workouts.forEach { w ->
            val date = w.startTime.atZone(ZoneId.systemDefault()).toLocalDate()
            
            // Chercher l'exercice dans la séance
            val exercises = w.sessionExercises.filter { it.exercise.id == exerciseId }
            if (exercises.isNotEmpty()) {
                val max1RM = exercises.flatMap { it.sets }
                    .filter { it.isCompleted && it.estimated1RM != null }
                    .maxOfOrNull { it.estimated1RM!! }
                
                if (max1RM != null) {
                    progressionList.add(OneRmProgressionDto(date, max1RM))
                }
            }
        }

        // S'il y a eu plusieurs séances le même jour pour cet exercice, on prend le meilleur 1RM
        return progressionList.groupBy { it.date }
            .map { (date, dtos) ->
                OneRmProgressionDto(date, dtos.maxOf { it.estimated1RM })
            }.sortedBy { it.date }
    }
}
