package com.nexjob.repository;

import com.nexjob.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    List<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    long countByJobId(Long jobId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiter.id = :recruiterId")
    long countTotalApplicantsForRecruiter(@Param("recruiterId") Long recruiterId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiter.id = :recruiterId AND a.appliedAt >= :since")
    long countApplicationsForRecruiterSince(@Param("recruiterId") Long recruiterId, @Param("since") ZonedDateTime since);

    @Query("SELECT a FROM Application a WHERE a.job.recruiter.id = :recruiterId ORDER BY a.appliedAt DESC")
    List<Application> findRecentApplicationsForRecruiter(@Param("recruiterId") Long recruiterId);
}
