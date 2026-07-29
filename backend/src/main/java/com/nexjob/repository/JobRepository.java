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

}
