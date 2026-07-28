package com.nexjob.repository;

import com.nexjob.entity.Job;
import com.nexjob.enums.ExperienceLevel;
import com.nexjob.enums.SalaryType;
import com.nexjob.enums.WorkMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    
    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    long countByRecruiterIdAndActiveTrue(Long recruiterId);

    long countByRecruiterIdAndActiveFalse(Long recruiterId);

    @Query("SELECT j FROM Job j WHERE j.active = true " +
           "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:workMode IS NULL OR j.workMode = :workMode) " +
           "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
           "AND (:salaryType IS NULL OR j.salaryType = :salaryType) " +
           "AND (:minSalary IS NULL OR j.salaryMax >= :minSalary) " +
           "ORDER BY j.createdAt DESC")
    List<Job> searchJobs(
            @Param("query") String query,
            @Param("location") String location,
            @Param("workMode") WorkMode workMode,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            @Param("salaryType") SalaryType salaryType,
            @Param("minSalary") BigDecimal minSalary
    );
}
