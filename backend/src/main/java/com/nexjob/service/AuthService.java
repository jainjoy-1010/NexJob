package com.nexjob.service;

import com.nexjob.dto.auth.AuthResponse;
import com.nexjob.dto.auth.LoginRequest;
import com.nexjob.dto.auth.RegisterRequest;
import com.nexjob.dto.auth.UserSummaryDto;
import com.nexjob.entity.CandidateProfile;
import com.nexjob.entity.Company;
import com.nexjob.entity.RecruiterProfile;
import com.nexjob.entity.User;
import com.nexjob.enums.Role;
import com.nexjob.exception.DuplicateResourceException;
import com.nexjob.exception.ResourceNotFoundException;
import com.nexjob.repository.CandidateProfileRepository;
import com.nexjob.repository.CompanyRepository;
import com.nexjob.repository.RecruiterProfileRepository;
import com.nexjob.repository.UserRepository;
import com.nexjob.security.JwtTokenProvider;
import com.nexjob.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email address is already in use: " + registerRequest.getEmail());
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .role(registerRequest.getRole())
                .build();

        user = userRepository.save(user);

        if (registerRequest.getRole() == Role.CANDIDATE) {
            CandidateProfile candidateProfile = CandidateProfile.builder()
                    .user(user)
                    .build();
            candidateProfileRepository.save(candidateProfile);
        } else if (registerRequest.getRole() == Role.RECRUITER) {
            Company company = null;
            if (registerRequest.getCompanyName() != null && !registerRequest.getCompanyName().isBlank()) {
                company = companyRepository.findByName(registerRequest.getCompanyName())
                        .orElseGet(() -> companyRepository.save(Company.builder()
                                .name(registerRequest.getCompanyName())
                                .build()));
            }

            RecruiterProfile recruiterProfile = RecruiterProfile.builder()
                    .user(user)
                    .company(company)
                    .designation(registerRequest.getDesignation())
                    .build();
            recruiterProfileRepository.save(recruiterProfile);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserSummaryDto(user))
                .build();
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserSummaryDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToUserSummaryDto(user);
    }

    public UserSummaryDto mapToUserSummaryDto(User user) {
        String companyName = null;
        if (user.getRole() == Role.RECRUITER) {
            companyName = recruiterProfileRepository.findByUserId(user.getId())
                    .map(rp -> rp.getCompany() != null ? rp.getCompany().getName() : null)
                    .orElse(null);
        }

        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .companyName(companyName)
                .build();
    }
}
