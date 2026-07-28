package com.nexjob.dto.candidate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileUpdateRequest {
    private String fullName;
    private String headline;
    private String about;
    private String skills;
    private String location;
    private String currentCompany;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
}
