package com.nexjob.dto.recruiter;

import com.nexjob.dto.candidate.CandidateProfileDto;
import com.nexjob.dto.resume.ResumeResponse;
import com.nexjob.enums.ApplicationStatus;
import lombok.*;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantDto {
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private CandidateProfileDto profile;
    private ResumeResponse resume;
    private ApplicationStatus status;
    private ZonedDateTime appliedAt;
}
