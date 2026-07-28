export type Role = 'CANDIDATE' | 'RECRUITER';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
export type SalaryType = 'LPA' | 'MONTHLY';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED';

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  companyName?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  description?: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: SalaryType;
  isActive: boolean;
  createdAt: string;
  company: Company;
  recruiterId: number;
  recruiterName: string;
  isSavedByCandidate?: boolean;
  isAppliedByCandidate?: boolean;
  applicantCount: number;
}

export interface Experience {
  id?: number;
  companyName: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
}

export interface CandidateProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  headline?: string;
  about?: string;
  skills?: string;
  location?: string;
  currentCompany?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  completionPercentage: number;
  hasPrimaryResume: boolean;
  experiences: Experience[];
  educations: Education[];
}

export interface Resume {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Application {
  id: number;
  job: Job;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  resume: Resume;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface Applicant {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  profile: CandidateProfile;
  resume: Resume;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface RecruiterDashboardStats {
  activeJobs: number;
  closedJobs: number;
  totalApplicants: number;
  todaysApplications: number;
  recentApplicants: Applicant[];
}
