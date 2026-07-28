package com.nexjob.dto.resume;

import lombok.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private boolean isPrimary;
    private ZonedDateTime createdAt;
}
