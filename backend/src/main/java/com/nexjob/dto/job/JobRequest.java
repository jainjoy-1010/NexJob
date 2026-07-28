package com.nexjob.dto.job;

import com.nexjob.enums.ExperienceLevel;
import com.nexjob.enums.SalaryType;
import com.nexjob.enums.WorkMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @NotNull(message = "Salary type is required")
    @Builder.Default
    private SalaryType salaryType = SalaryType.LPA;

    private Long companyId;
    private String companyName;
}
