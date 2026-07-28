package com.nexjob.dto.job;

import com.nexjob.enums.ExperienceLevel;
import com.nexjob.enums.SalaryType;
import com.nexjob.enums.WorkMode;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private WorkMode workMode;
    private ExperienceLevel experienceLevel;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private SalaryType salaryType;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean active;
    private ZonedDateTime createdAt;
    private CompanyDto company;
    private Long recruiterId;
    private String recruiterName;
    private boolean isSavedByCandidate;
    private boolean isAppliedByCandidate;
    private long applicantCount;
}
