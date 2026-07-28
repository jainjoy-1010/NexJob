package com.nexjob.service;

import com.nexjob.dto.resume.ResumeResponse;
import com.nexjob.entity.Resume;
import com.nexjob.entity.User;
import com.nexjob.exception.BadRequestException;
import com.nexjob.exception.ResourceNotFoundException;
import com.nexjob.repository.ResumeRepository;
import com.nexjob.repository.UserRepository;
import com.nexjob.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private static final int MAX_RESUMES = 3;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional(readOnly = true)
    public List<ResumeResponse> getUserResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResumeResponse uploadResume(Long userId, MultipartFile file) {
        long count = resumeRepository.countByUserId(userId);
        if (count >= MAX_RESUMES) {
            throw new BadRequestException("Maximum limit of " + MAX_RESUMES + " resumes reached. Please delete an existing resume to upload a new one.");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        
        boolean isValidPdf = "application/pdf".equalsIgnoreCase(contentType) || originalFilename.endsWith(".pdf");
        boolean isValidDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(contentType)
                || "application/msword".equalsIgnoreCase(contentType)
                || originalFilename.endsWith(".docx") || originalFilename.endsWith(".doc");

        if (!isValidPdf && !isValidDocx) {
            throw new BadRequestException("Unsupported file format. Only PDF and DOCX files are allowed.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String storedFilePath = storageService.storeFile(file);
        boolean isFirstResume = count == 0;

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .storedFilePath(storedFilePath)
                .fileType(isValidPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                .fileSize(file.getSize())
                .isPrimary(isFirstResume)
                .build();

        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    @Transactional
    public ResumeResponse setPrimaryResume(Long userId, Long resumeId) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Resume targetResume = resumes.stream()
                .filter(r -> r.getId().equals(resumeId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        for (Resume r : resumes) {
            r.setPrimary(r.getId().equals(resumeId));
            resumeRepository.save(r);
        }

        return mapToResponse(targetResume);
    }

    @Transactional
    public ResumeResponse renameResume(Long userId, Long resumeId, String newName) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this resume.");
        }

        resume.setFileName(newName);
        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    @Transactional
    public void deleteResume(Long userId, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this resume.");
        }

        boolean wasPrimary = resume.isPrimary();
        storageService.deleteFile(resume.getStoredFilePath());
        resumeRepository.delete(resume);

        if (wasPrimary) {
            Optional<Resume> anotherResume = resumeRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
            anotherResume.ifPresent(r -> {
                r.setPrimary(true);
                resumeRepository.save(r);
            });
        }
    }

    public Resource loadResumeResource(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));
        return storageService.loadFileAsResource(resume.getStoredFilePath());
    }

    public Resume getResumeEntity(Long resumeId) {
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));
    }

    public ResumeResponse mapToResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .isPrimary(resume.isPrimary())
                .createdAt(resume.getCreatedAt())
                .build();
    }
}
