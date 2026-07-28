package com.nexjob.service;

import com.nexjob.dto.application.ApplicationResponse;
import com.nexjob.dto.job.JobResponse;
import com.nexjob.dto.resume.ResumeResponse;
import com.nexjob.entity.Application;
import com.nexjob.entity.Job;
import com.nexjob.entity.Resume;
import com.nexjob.entity.User;
import com.nexjob.enums.ApplicationStatus;
import com.nexjob.exception.BadRequestException;
import com.nexjob.exception.DuplicateResourceException;
import com.nexjob.exception.ResourceNotFoundException;
import com.nexjob.repository.ApplicationRepository;
import com.nexjob.repository.JobRepository;
import com.nexjob.repository.ResumeRepository;
import com.nexjob.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final JobService jobService;
    private final ResumeService resumeService;

    @Transactional
    public ApplicationResponse applyToJob(Long candidateId, Long jobId) {
        // 1. Check if job exists & active
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.isActive()) {
            throw new BadRequestException("This job listing is no longer active.");
        }

        // 2. Prevent duplicate application
        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            throw new DuplicateResourceException("You have already applied for this job position.");
        }

        // 3. Candidate user lookup
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", candidateId));

        // 4. Automatically attach PRIMARY resume
        Resume primaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(candidateId)
                .orElseThrow(() -> new BadRequestException("No primary resume found. Please upload a resume and set it as primary in your profile before applying."));

        // 5. Save application
        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resume(primaryResume)
                .status(ApplicationStatus.APPLIED)
                .build();

        application = applicationRepository.save(application);
        return mapToApplicationResponse(application, candidateId);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getCandidateApplications(Long candidateId) {
        return applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateId)
                .stream()
                .map(app -> mapToApplicationResponse(app, candidateId))
                .collect(Collectors.toList());
    }

    public ApplicationResponse mapToApplicationResponse(Application application, Long candidateId) {
        JobResponse jobDto = jobService.mapToJobResponse(application.getJob(), candidateId);
        ResumeResponse resumeDto = resumeService.mapToResponse(application.getResume());

        return ApplicationResponse.builder()
                .id(application.getId())
                .job(jobDto)
                .candidateId(application.getCandidate().getId())
                .candidateName(application.getCandidate().getFullName())
                .candidateEmail(application.getCandidate().getEmail())
                .resume(resumeDto)
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .build();
    }
}
