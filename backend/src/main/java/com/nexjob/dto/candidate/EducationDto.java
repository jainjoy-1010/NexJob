package com.nexjob.dto.candidate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationDto {
    private Long id;
    private String institution;
    private String degree;
    private String fieldOfStudy;
    private Integer startYear;
    private Integer endYear;
}
