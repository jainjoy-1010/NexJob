package com.nexjob.service;

import com.nexjob.dto.auth.AuthResponse;
import com.nexjob.dto.auth.LoginRequest;
import com.nexjob.dto.auth.RegisterRequest;
import com.nexjob.entity.CandidateProfile;
import com.nexjob.entity.User;
import com.nexjob.enums.Role;
import com.nexjob.exception.DuplicateResourceException;
import com.nexjob.repository.CandidateProfileRepository;
import com.nexjob.repository.CompanyRepository;
import com.nexjob.repository.RecruiterProfileRepository;
import com.nexjob.repository.UserRepository;
import com.nexjob.security.JwtTokenProvider;
import com.nexjob.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User candidateUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        candidateUser = User.builder()
                .id(1L)
                .email("candidate@example.com")
                .passwordHash("hashed_password")
                .fullName("John Doe")
                .role(Role.CANDIDATE)
                .build();

        registerRequest = RegisterRequest.builder()
                .email("candidate@example.com")
                .password("password123")
                .fullName("John Doe")
                .role(Role.CANDIDATE)
                .build();
    }

    @Test
    @DisplayName("Should successfully register candidate user")
    void registerUser_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(candidateUser);
        when(candidateProfileRepository.save(any(CandidateProfile.class))).thenReturn(new CandidateProfile());

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked_jwt_token");

        AuthResponse response = authService.registerUser(registerRequest);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getToken());
        assertEquals("candidate@example.com", response.getUser().getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(candidateProfileRepository, times(1)).save(any(CandidateProfile.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when registering existing email")
    void registerUser_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.registerUser(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully authenticate user and return token")
    void loginUser_Success() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("candidate@example.com")
                .password("password123")
                .build();

        Authentication auth = mock(Authentication.class);
        UserPrincipal principal = UserPrincipal.create(candidateUser);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("valid_jwt_token");
        when(userRepository.findById(1L)).thenReturn(Optional.of(candidateUser));

        AuthResponse response = authService.loginUser(loginRequest);

        assertNotNull(response);
        assertEquals("valid_jwt_token", response.getToken());
        assertEquals("John Doe", response.getUser().getFullName());
    }
}
