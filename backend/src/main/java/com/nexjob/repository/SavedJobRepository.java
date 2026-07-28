package com.nexjob.repository;

import com.nexjob.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);
    List<SavedJob> findByUserIdOrderBySavedAtDesc(Long userId);
}
