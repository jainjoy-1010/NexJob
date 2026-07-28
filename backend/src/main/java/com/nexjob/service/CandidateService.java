package com.nexjob.service;

import com.nexjob.dto.candidate.*;
import com.nexjob.entity.*;
import com.nexjob.exception.ResourceNotFoundException;
import com.nexjob.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    @Transactional
    public CandidateProfileDto getCandidateProfile(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    return candidateProfileRepository.save(CandidateProfile.builder().user(user).build());
                });

        boolean hasPrimaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId).isPresent();

        return mapToDto(profile, hasPrimaryResume);
    }

    @Transactional
    public CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
            userRepository.save(user);
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        profile.setHeadline(request.getHeadline());
        profile.setAbout(request.getAbout());
        profile.setSkills(request.getSkills());
        profile.setLocation(request.getLocation());
        profile.setCurrentCompany(request.getCurrentCompany());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());

        profile = candidateProfileRepository.save(profile);
        boolean hasPrimaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId).isPresent();

        return mapToDto(profile, hasPrimaryResume);
    }

    @Transactional
    public CandidateProfileDto addExperience(Long userId, ExperienceDto dto) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate Profile", "userId", userId));

        CandidateExperience exp = CandidateExperience.builder()
                .candidateProfile(profile)
                .companyName(dto.getCompanyName())
                .title(dto.getTitle())
                .location(dto.getLocation())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .isCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : false)
                .description(dto.getDescription())
                .build();

        profile.getExperiences().add(exp);
        profile = candidateProfileRepository.save(profile);

        boolean hasPrimaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId).isPresent();
        return mapToDto(profile, hasPrimaryResume);
    }

    @Transactional
    public CandidateProfileDto deleteExperience(Long userId, Long experienceId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate Profile", "userId", userId));

        profile.getExperiences().removeIf(exp -> exp.getId().equals(experienceId));
        profile = candidateProfileRepository.save(profile);

        boolean hasPrimaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId).isPresent();
        return mapToDto(profile, hasPrimaryResume);
    }

    @Transactional
    public CandidateProfileDto addEducation(Long userId, EducationDto dto) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate Profile", "userId", userId));

        CandidateEducation edu = CandidateEducation.builder()
                .candidateProfile(profile)
                .institution(dto.getInstitution())
                .degree(dto.getDegree())
                .fieldOfStudy(dto.getFieldOfStudy())
                .startYear(dto.getStartYear())
                .endYear(dto.getEndYear())
                .build();

        profile.getEducations().add(edu);
        profile = candidateProfileRepository.save(profile);

        boolean hasPrimaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId).isPresent();
        return mapToDto(profile, hasPrimaryResume);
    }

    @Transactional
    public CandidateProfileDto deleteEducation(Long userId, Long educationId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate Profile", "userId", userId));

        profile.getEducations().removeIf(edu -> edu.getId().equals(educationId));
        profile = candidateProfileRepository.save(profile);

        boolean hasPrimaryResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId).isPresent();
        return mapToDto(profile, hasPrimaryResume);
    }

    public CandidateProfileDto mapToDto(CandidateProfile profile, boolean hasPrimaryResume) {
        int score = 0;
        // 1. Basic Profile (Always true if account exists and fullName present)
        if (profile.getUser() != null && profile.getUser().getFullName() != null && !profile.getUser().getFullName().isBlank()) {
            score += 20;
        }
        // 2. About
        if (profile.getAbout() != null && !profile.getAbout().isBlank()) {
            score += 20;
        }
        // 3. Skills
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) {
            score += 20;
        }
        // 4. Location
        if (profile.getLocation() != null && !profile.getLocation().isBlank()) {
            score += 20;
        }
        // 5. Primary Resume Uploaded
        if (hasPrimaryResume) {
            score += 20;
        }

        List<ExperienceDto> expDtos = profile.getExperiences() == null ? Collections.emptyList() :
                profile.getExperiences().stream().map(e -> ExperienceDto.builder()
                        .id(e.getId())
                        .companyName(e.getCompanyName())
                        .title(e.getTitle())
                        .location(e.getLocation())
                        .startDate(e.getStartDate())
                        .endDate(e.getEndDate())
                        .isCurrent(e.getIsCurrent())
                        .description(e.getDescription())
                        .build()).collect(Collectors.toList());

        List<EducationDto> eduDtos = profile.getEducations() == null ? Collections.emptyList() :
                profile.getEducations().stream().map(e -> EducationDto.builder()
                        .id(e.getId())
                        .institution(e.getInstitution())
                        .degree(e.getDegree())
                        .fieldOfStudy(e.getFieldOfStudy())
                        .startYear(e.getStartYear())
                        .endYear(e.getEndYear())
                        .build()).collect(Collectors.toList());

        return CandidateProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .headline(profile.getHeadline())
                .about(profile.getAbout())
                .skills(profile.getSkills())
                .location(profile.getLocation())
                .currentCompany(profile.getCurrentCompany())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .completionPercentage(score)
                .hasPrimaryResume(hasPrimaryResume)
                .experiences(expDtos)
                .educations(eduDtos)
                .build();
    }
}
