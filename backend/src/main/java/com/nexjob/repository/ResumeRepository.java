package com.nexjob.repository;

import com.nexjob.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    Optional<Resume> findByUserIdAndIsPrimaryTrue(Long userId);
    Optional<Resume> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
