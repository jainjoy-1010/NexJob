package com.nexjob.dto.recruiter;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterDashboardStatsDto {
    private long activeJobs;
    private long closedJobs;
    private long totalApplicants;
    private long todaysApplications;
    private List<ApplicantDto> recentApplicants;
}
