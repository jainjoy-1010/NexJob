package com.nexjob.dto.candidate;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String headline;
    private String about;
    private String skills;
    private String location;
    private String currentCompany;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private int completionPercentage;
    private boolean hasPrimaryResume;
    private List<ExperienceDto> experiences;
    private List<EducationDto> educations;
}
