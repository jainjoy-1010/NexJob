package com.nexjob.service;

import com.nexjob.dto.job.CompanyDto;
import com.nexjob.dto.job.JobRequest;
import com.nexjob.dto.job.JobResponse;
import com.nexjob.entity.Company;
import com.nexjob.entity.Job;
import com.nexjob.entity.SavedJob;
import com.nexjob.entity.User;
import com.nexjob.enums.ExperienceLevel;
import com.nexjob.enums.SalaryType;
import com.nexjob.enums.WorkMode;
import com.nexjob.exception.BadRequestException;
import com.nexjob.exception.ResourceNotFoundException;
import com.nexjob.exception.UnauthorizedException;
import com.nexjob.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;

    @Transactional(readOnly = true)
    public List<JobResponse> searchJobs(String query, String location, WorkMode workMode,
                                        ExperienceLevel experienceLevel, SalaryType salaryType,
                                        BigDecimal minSalary, Long currentUserId) {
        org.springframework.data.jpa.domain.Specification<Job> spec = (root, cq, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.isTrue(root.get("active")));

            if (query != null && !query.isBlank()) {
                String likePattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), likePattern),
                        cb.like(cb.lower(root.get("company").get("name")), likePattern)
                ));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }
            if (workMode != null) {
                predicates.add(cb.equal(root.get("workMode"), workMode));
            }
            if (experienceLevel != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), experienceLevel));
            }
            if (salaryType != null) {
                predicates.add(cb.equal(root.get("salaryType"), salaryType));
            }
            if (minSalary != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salaryMax"), minSalary));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        List<Job> jobs = jobRepository.findAll(spec, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));

        return jobs.stream()
                .map(job -> mapToJobResponse(job, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long jobId, Long currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));
        return mapToJobResponse(job, currentUserId);
    }

    @Transactional
    public JobResponse createJob(Long recruiterId, JobRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterId));

        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));
        } else {
            String compName = request.getCompanyName();
            if (compName == null || compName.isBlank()) {
                compName = recruiterProfileRepository.findByUserId(recruiterId)
                        .map(rp -> rp.getCompany() != null ? rp.getCompany().getName() : "Independent Recruiter")
                        .orElse("Company");
            }
            final String finalCompName = compName;
            company = companyRepository.findByName(finalCompName)
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name(finalCompName)
                            .location(request.getLocation())
                            .build()));
        }

        Job job = Job.builder()
                .company(company)
                .recruiter(recruiter)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .workMode(request.getWorkMode())
                .experienceLevel(request.getExperienceLevel())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .salaryType(request.getSalaryType() != null ? request.getSalaryType() : SalaryType.LPA)
                .active(true)
                .build();

        job = jobRepository.save(job);
        return mapToJobResponse(job, recruiterId);
    }

    @Transactional
    public JobResponse updateJob(Long recruiterId, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new UnauthorizedException("You are not authorized to edit this job posting.");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setWorkMode(request.getWorkMode());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        if (request.getSalaryType() != null) {
            job.setSalaryType(request.getSalaryType());
        }

        job = jobRepository.save(job);
        return mapToJobResponse(job, recruiterId);
    }

    @Transactional
    public JobResponse toggleJobStatus(Long recruiterId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new UnauthorizedException("You are not authorized to modify this job posting.");
        }

        job.setActive(!job.isActive());
        job = jobRepository.save(job);
        return mapToJobResponse(job, recruiterId);
    }

    @Transactional
    public void deleteJob(Long recruiterId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new UnauthorizedException("You are not authorized to delete this job posting.");
        }

        jobRepository.delete(job);
    }

    @Transactional
    public boolean toggleSaveJob(Long candidateId, Long jobId) {
        User user = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", candidateId));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        Optional<SavedJob> existing = savedJobRepository.findByUserIdAndJobId(candidateId, jobId);
        if (existing.isPresent()) {
            savedJobRepository.delete(existing.get());
            return false; // Now unsaved
        } else {
            savedJobRepository.save(SavedJob.builder().user(user).job(job).build());
            return true; // Now saved
        }
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs(Long candidateId) {
        List<SavedJob> savedJobs = savedJobRepository.findByUserIdOrderBySavedAtDesc(candidateId);
        return savedJobs.stream()
                .map(sj -> mapToJobResponse(sj.getJob(), candidateId))
                .collect(Collectors.toList());
    }

    public JobResponse mapToJobResponse(Job job, Long currentUserId) {
        boolean isSaved = false;
        boolean isApplied = false;

        if (currentUserId != null) {
            isSaved = savedJobRepository.existsByUserIdAndJobId(currentUserId, job.getId());
            isApplied = applicationRepository.existsByJobIdAndCandidateId(job.getId(), currentUserId);
        }

        long count = applicationRepository.countByJobId(job.getId());

        Company company = job.getCompany();
        CompanyDto companyDto = company != null ? CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .logo(company.getLogo())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .location(company.getLocation())
                .description(company.getDescription())
                .build() : null;

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .workMode(job.getWorkMode())
                .experienceLevel(job.getExperienceLevel())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryType(job.getSalaryType())
                .active(job.isActive())
                .createdAt(job.getCreatedAt())
                .company(companyDto)
                .recruiterId(job.getRecruiter() != null ? job.getRecruiter().getId() : null)
                .recruiterName(job.getRecruiter() != null ? job.getRecruiter().getFullName() : null)
                .isSavedByCandidate(isSaved)
                .isAppliedByCandidate(isApplied)
                .applicantCount(count)
                .build();
    }
}
