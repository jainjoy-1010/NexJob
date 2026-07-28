package com.nexjob.controller;

import com.nexjob.dto.job.JobResponse;
import com.nexjob.enums.ExperienceLevel;
import com.nexjob.enums.SalaryType;
import com.nexjob.enums.WorkMode;
import com.nexjob.security.UserPrincipal;
import com.nexjob.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {



    @GetMapping
    public ResponseEntity<List<JobResponse>> searchJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) SalaryType salaryType,
            @RequestParam(required = false) BigDecimal minSalary,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        List<JobResponse> jobs = jobService.searchJobs(query, location, workMode, experienceLevel, salaryType, minSalary, currentUserId);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        JobResponse job = jobService.getJobById(id, currentUserId);
        return ResponseEntity.ok(job);
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Boolean> toggleSaveJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        boolean isSaved = jobService.toggleSaveJob(currentUser.getId(), id);
        return ResponseEntity.ok(isSaved);
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<JobResponse>> getSavedJobs(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<JobResponse> savedJobs = jobService.getSavedJobs(currentUser.getId());
        return ResponseEntity.ok(savedJobs);
    }
}
