package com.nexjob.dto.application;

import com.nexjob.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
}
