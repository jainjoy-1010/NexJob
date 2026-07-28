package com.nexjob.controller;

import com.nexjob.dto.application.ApplicationStatusUpdateRequest;
import com.nexjob.dto.job.JobRequest;
import com.nexjob.dto.job.JobResponse;
import com.nexjob.dto.recruiter.ApplicantDto;
import com.nexjob.dto.recruiter.RecruiterDashboardStatsDto;
import com.nexjob.enums.ApplicationStatus;
import com.nexjob.security.UserPrincipal;
import com.nexjob.service.JobService;
import com.nexjob.service.RecruiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiter")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final JobService jobService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<RecruiterDashboardStatsDto> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RecruiterDashboardStatsDto stats = recruiterService.getRecruiterStats(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<JobResponse> jobs = recruiterService.getRecruiterJobs(currentUser.getId());
        return ResponseEntity.ok(jobs);
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.createJob(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.updateJob(currentUser.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<JobResponse> toggleJobStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        JobResponse response = jobService.toggleJobStatus(currentUser.getId(), id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        jobService.deleteJob(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<List<ApplicantDto>> getJobApplicants(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long jobId,
            @RequestParam(required = false) ApplicationStatus status) {
        List<ApplicantDto> list = recruiterService.getJobApplicants(currentUser.getId(), jobId, status);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/applications/{appId}/status")
    public ResponseEntity<ApplicantDto> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long appId,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        ApplicantDto updated = recruiterService.updateApplicationStatus(currentUser.getId(), appId, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
