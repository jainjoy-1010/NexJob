package com.nexjob.controller;

import com.nexjob.dto.application.ApplicationResponse;
import com.nexjob.security.UserPrincipal;
import com.nexjob.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationResponse> applyToJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long jobId) {
        ApplicationResponse response = applicationService.applyToJob(currentUser.getId(), jobId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ApplicationResponse> list = applicationService.getCandidateApplications(currentUser.getId());
        return ResponseEntity.ok(list);
    }
}
