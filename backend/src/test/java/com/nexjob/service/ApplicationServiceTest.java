package com.nexjob.service;

import com.nexjob.dto.application.ApplicationResponse;
import com.nexjob.dto.job.JobResponse;
import com.nexjob.dto.resume.ResumeResponse;
import com.nexjob.entity.Application;
import com.nexjob.entity.Job;
import com.nexjob.entity.Resume;
import com.nexjob.entity.User;
import com.nexjob.enums.ApplicationStatus;
import com.nexjob.enums.Role;
import com.nexjob.exception.BadRequestException;
import com.nexjob.exception.DuplicateResourceException;
import com.nexjob.repository.ApplicationRepository;
import com.nexjob.repository.JobRepository;
import com.nexjob.repository.ResumeRepository;
import com.nexjob.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private JobService jobService;

    @Mock
    private ResumeService resumeService;

    @InjectMocks
    private ApplicationService applicationService;

    private User candidate;
    private Job activeJob;
    private Resume primaryResume;

    @BeforeEach
    void setUp() {
        candidate = User.builder()
                .id(10L)
                .email("candidate@test.com")
                .fullName("Jane Candidate")
                .role(Role.CANDIDATE)
                .build();

        activeJob = Job.builder()
                .id(100L)
                .title("Software Engineer")
                .active(true)
                .build();

        primaryResume = Resume.builder()
                .id(50L)
                .user(candidate)
                .fileName("Jane_Resume.pdf")
                .isPrimary(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully apply to active job using candidate primary resume")
    void applyToJob_Success() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(activeJob));
        when(applicationRepository.existsByJobIdAndCandidateId(100L, 10L)).thenReturn(false);
        when(userRepository.findById(10L)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByUserIdAndIsPrimaryTrue(10L)).thenReturn(Optional.of(primaryResume));

        Application savedApp = Application.builder()
                .id(1L)
                .job(activeJob)
                .candidate(candidate)
                .resume(primaryResume)
                .status(ApplicationStatus.APPLIED)
                .build();

        when(applicationRepository.save(any(Application.class))).thenReturn(savedApp);
        when(jobService.mapToJobResponse(any(), any())).thenReturn(JobResponse.builder().id(100L).title("Software Engineer").build());
        when(resumeService.mapToResponse(any())).thenReturn(ResumeResponse.builder().id(50L).fileName("Jane_Resume.pdf").build());

        ApplicationResponse response = applicationService.applyToJob(10L, 100L);

        assertNotNull(response);
        assertEquals(ApplicationStatus.APPLIED, response.getStatus());
        assertEquals("Jane Candidate", response.getCandidateName());
        verify(applicationRepository, times(1)).save(any(Application.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when applying again to same job")
    void applyToJob_DuplicateApplication_ThrowsException() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(activeJob));
        when(applicationRepository.existsByJobIdAndCandidateId(100L, 10L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> applicationService.applyToJob(10L, 100L));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when candidate has no primary resume")
    void applyToJob_NoPrimaryResume_ThrowsException() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(activeJob));
        when(applicationRepository.existsByJobIdAndCandidateId(100L, 10L)).thenReturn(false);
        when(userRepository.findById(10L)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByUserIdAndIsPrimaryTrue(10L)).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> applicationService.applyToJob(10L, 100L));
        assertTrue(ex.getMessage().contains("No primary resume found"));
        verify(applicationRepository, never()).save(any(Application.class));
    }
}
