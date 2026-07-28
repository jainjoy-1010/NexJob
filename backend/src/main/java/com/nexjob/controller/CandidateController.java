package com.nexjob.controller;

import com.nexjob.dto.candidate.*;
import com.nexjob.security.UserPrincipal;
import com.nexjob.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        CandidateProfileDto profile = candidateService.getCandidateProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody CandidateProfileUpdateRequest request) {
        CandidateProfileDto updated = candidateService.updateCandidateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/experiences")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileDto> addExperience(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody ExperienceDto dto) {
        CandidateProfileDto updated = candidateService.addExperience(currentUser.getId(), dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/experiences/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileDto> deleteExperience(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        CandidateProfileDto updated = candidateService.deleteExperience(currentUser.getId(), id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/educations")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileDto> addEducation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody EducationDto dto) {
        CandidateProfileDto updated = candidateService.addEducation(currentUser.getId(), dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/educations/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileDto> deleteEducation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        CandidateProfileDto updated = candidateService.deleteEducation(currentUser.getId(), id);
        return ResponseEntity.ok(updated);
    }
}
