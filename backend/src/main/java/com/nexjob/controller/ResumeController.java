package com.nexjob.controller;

import com.nexjob.dto.resume.ResumeRenameRequest;
import com.nexjob.dto.resume.ResumeResponse;
import com.nexjob.entity.Resume;
import com.nexjob.security.UserPrincipal;
import com.nexjob.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<ResumeResponse>> getResumes(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ResumeResponse> resumes = resumeService.getUserResumes(currentUser.getId());
        return ResponseEntity.ok(resumes);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ResumeResponse> uploadResume(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        ResumeResponse response = resumeService.uploadResume(currentUser.getId(), file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/primary")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ResumeResponse> setPrimary(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        ResumeResponse response = resumeService.setPrimaryResume(currentUser.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/rename")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ResumeResponse> renameResume(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody ResumeRenameRequest request) {
        ResumeResponse response = resumeService.renameResume(currentUser.getId(), id, request.getNewFileName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Void> deleteResume(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        resumeService.deleteResume(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewResume(@PathVariable Long id) {
        Resume resume = resumeService.getResumeEntity(id);
        Resource resource = resumeService.loadResumeResource(id);

        String contentType = resume.getFileType();
        boolean isPdf = "application/pdf".equalsIgnoreCase(contentType) || resume.getFileName().toLowerCase().endsWith(".pdf");

        String disposition = isPdf ? "inline" : "attachment";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + resume.getFileName() + "\"")
                .body(resource);
    }
}
