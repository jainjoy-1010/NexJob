package com.nexjob.dto.resume;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeRenameRequest {
    @NotBlank(message = "New file name is required")
    private String newFileName;
}
