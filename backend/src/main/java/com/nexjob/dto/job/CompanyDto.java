package com.nexjob.dto.job;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDto {
    private Long id;
    private String name;
    private String logo;
    private String website;
    private String industry;
    private String companySize;
    private String location;
    private String description;
}
