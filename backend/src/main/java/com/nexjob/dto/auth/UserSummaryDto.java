package com.nexjob.dto.auth;

import com.nexjob.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String companyName;
}
