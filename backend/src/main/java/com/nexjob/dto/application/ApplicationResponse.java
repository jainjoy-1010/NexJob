package com.nexjob.dto.application;

import com.nexjob.dto.job.JobResponse;
import com.nexjob.dto.resume.ResumeResponse;
import com.nexjob.enums.ApplicationStatus;
import lombok.*;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long id;
    private JobResponse job;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private ResumeResponse resume;
    private ApplicationStatus status;
    private ZonedDateTime appliedAt;
}
