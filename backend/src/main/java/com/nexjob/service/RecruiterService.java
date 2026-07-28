package com.nexjob.service;

import com.nexjob.dto.job.JobResponse;
import com.nexjob.dto.recruiter.ApplicantDto;
import com.nexjob.dto.recruiter.RecruiterDashboardStatsDto;
import com.nexjob.entity.Application;
import com.nexjob.entity.Job;
import com.nexjob.enums.ApplicationStatus;
import com.nexjob.exception.ResourceNotFoundException;
import com.nexjob.exception.UnauthorizedException;
import com.nexjob.repository.ApplicationRepository;
import com.nexjob.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateService candidateService;
    private final ResumeService resumeService;
    private final JobService jobService;

    @Transactional(readOnly = true)
    public RecruiterDashboardStatsDto getRecruiterStats(Long recruiterId) {
        long activeJobs = jobRepository.countByRecruiterIdAndActiveTrue(recruiterId);
        long closedJobs = jobRepository.countByRecruiterIdAndActiveFalse(recruiterId);
        long totalApplicants = applicationRepository.countTotalApplicantsForRecruiter(recruiterId);

        ZonedDateTime startOfToday = ZonedDateTime.now().truncatedTo(ChronoUnit.DAYS);
        long todaysApplications = applicationRepository.countApplicationsForRecruiterSince(recruiterId, startOfToday);

        List<Application> recentApps = applicationRepository.findRecentApplicationsForRecruiter(recruiterId);
        List<ApplicantDto> recentApplicants = recentApps.stream()
                .limit(5)
                .map(this::mapToApplicantDto)
                .collect(Collectors.toList());

        return RecruiterDashboardStatsDto.builder()
                .activeJobs(activeJobs)
                .closedJobs(closedJobs)
                .totalApplicants(totalApplicants)
                .todaysApplications(todaysApplications)
                .recentApplicants(recentApplicants)
                .build();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getRecruiterJobs(Long recruiterId) {
        return jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId)
                .stream()
                .map(job -> jobService.mapToJobResponse(job, recruiterId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicantDto> getJobApplicants(Long recruiterId, Long jobId, ApplicationStatus statusFilter) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new UnauthorizedException("You are not authorized to view applicants for this job.");
        }

        List<Application> applications = applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);

        return applications.stream()
                .filter(app -> statusFilter == null || app.getStatus() == statusFilter)
                .map(this::mapToApplicantDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicantDto updateApplicationStatus(Long recruiterId, Long applicationId, ApplicationStatus newStatus) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (!application.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new UnauthorizedException("You are not authorized to update this application.");
        }

        application.setStatus(newStatus);
        application = applicationRepository.save(application);
        return mapToApplicantDto(application);
    }

    public ApplicantDto mapToApplicantDto(Application app) {
        return ApplicantDto.builder()
                .applicationId(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .candidateId(app.getCandidate().getId())
                .candidateName(app.getCandidate().getFullName())
                .candidateEmail(app.getCandidate().getEmail())
                .profile(candidateService.getCandidateProfile(app.getCandidate().getId()))
                .resume(resumeService.mapToResponse(app.getResume()))
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}
