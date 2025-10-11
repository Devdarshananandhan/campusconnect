# Application & Referral System Guide

## Overview
The CampusConnect platform has a complete job application and referral system already implemented! Here's how it works:

## ✅ Job Application System

### For Students & Alumni

#### How to Apply to a Job:

1. **Navigate to Jobs Page**
   - Click "Careers" in the sidebar
   - Browse available job listings

2. **View Job Details**
   - Click on any job card to see full details
   - You'll see the job description, requirements, responsibilities, salary, etc.

3. **Click "Apply Now"** (Right sidebar)
   - A multi-step application form will open as a modal
   - **Important**: Only Students and Alumni can see this button!

4. **Complete the Application Form**:
   
   **Step 1: Upload Resume**
   - Upload your resume (PDF or Word document, max 5MB)
   - Or paste a link to your resume (Google Drive, LinkedIn, etc.)
   
   **Step 2: Write Cover Letter**
   - Write a compelling cover letter explaining why you're a good fit
   - Minimum 100 characters required
   
   **Step 3: Additional Questions** (if any)
   - Answer any custom questions from the employer
   
   **Step 4: Review & Submit**
   - Review all your information
   - Click "Submit Application"

5. **Confirmation**
   - You'll see a success message
   - The "Apply Now" button will change to "Already Applied"
   - You can track your application status in "My Applications" page

### Application Form Features:
- ✅ **Resume upload** with file validation
- ✅ **Cover letter** with character count
- ✅ **Custom questions** support
- ✅ **Step-by-step wizard** for better UX
- ✅ **Validation** at each step
- ✅ **Error handling** with helpful messages

### File: `ApplicationForm.tsx`
**Location**: `frontend/src/components/careers/ApplicationForm.tsx`

**Key Props**:
```typescript
{
  job: Job;                    // The job being applied to
  isOpen: boolean;             // Modal visibility
  onClose: () => void;         // Close handler
  onSubmit: (data) => Promise; // Submission handler
  currentUser: any;            // Current logged-in user
}
```

**Application Data Structure**:
```typescript
{
  resume: string;              // File URL or link
  coverLetter: string;         // Cover letter text
  answers?: Record<string, any>; // Custom question answers
}
```

---

## ✅ Referral Request System

### For Students & Alumni

#### How to Request a Referral:

1. **Navigate to Job Details**
   - Go to any job posting
   - Scroll to the right sidebar

2. **Click "Request Referral"** button
   - This will navigate you to the Referral Marketplace
   - The job will be pre-selected

3. **Browse Referrers**
   - See who can provide referrals for this job
   - View their profiles, companies, and success rates

4. **Request a Referral**
   - Click on a referrer
   - Send a personalized message
   - Wait for them to accept

### Who Can Request Referrals?
- ✅ **Students** - Can request referrals
- ✅ **Alumni** - Can request referrals
- ❌ **Faculty** - Cannot request (can only provide)
- ❌ **Employers** - Cannot request
- ❌ **Recruiters** - Cannot request

### Who Can Provide Referrals?
- ✅ **Alumni** - Can provide referrals
- ✅ **Faculty** - Can provide referrals
- ✅ **Employers** - Can provide referrals
- ✅ **Recruiters** - Can provide referrals
- ❌ **Students** - Cannot provide

---

## Role-Based Access Control

### Application & Referral Permissions:

| Role | Can Apply to Jobs | Can Request Referrals | Can Provide Referrals |
|------|------------------|----------------------|----------------------|
| **Student** | ✅ Yes | ✅ Yes | ❌ No |
| **Alumni** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Faculty** | ❌ No | ❌ No | ✅ Yes |
| **Employer** | ❌ No | ❌ No | ✅ Yes |
| **Recruiter** | ❌ No | ❌ No | ✅ Yes |

### Button Visibility Logic:

**On Job Detail Page**:
- **Students/Alumni**: See "Apply Now" + "Request Referral" buttons
- **Faculty/Employers/Recruiters**: See "View Only" message (cannot apply)
- **Already Applied**: See "Already Applied" confirmation message

**Code Implementation**:
```typescript
// Check user permissions
const canApplyToJobs = hasPermission(currentUser.role, 'canApplyToJobs');
const canRequestReferrals = hasPermission(currentUser.role, 'canRequestReferrals');

// Conditional rendering:
{!canApplyToJobs && !canRequestReferrals ? (
  <div>View Only - Only students and alumni can apply</div>
) : hasApplied ? (
  <div>Already Applied</div>
) : (
  <>
    {canApplyToJobs && <button>Apply Now</button>}
    {canRequestReferrals && <button>Request Referral</button>}
  </>
)}
```

---

## API Endpoints

### Apply to Job
**Endpoint**: `POST /api/applications`

**Request Body**:
```json
{
  "job": "jobId123",
  "resume": "https://...",
  "coverLetter": "Dear Hiring Manager...",
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  },
  "referredBy": "userId456" // Optional
}
```

**Response**:
```json
{
  "message": "Application submitted successfully",
  "application": {
    "id": "appId789",
    "job": "jobId123",
    "applicant": "userId123",
    "status": "applied",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Request Referral
**Endpoint**: `POST /api/referrals`

**Request Body**:
```json
{
  "job": "jobId123",
  "referrer": "userId456",
  "message": "Hi, I'd love a referral for this position..."
}
```

**Response**:
```json
{
  "message": "Referral requested successfully",
  "referral": {
    "id": "refId789",
    "job": "jobId123",
    "requester": "userId123",
    "referrer": "userId456",
    "status": "pending"
  }
}
```

---

## Navigation Flow

### Application Flow:
```
Jobs Page
  ↓ (Click job card)
Job Detail Page
  ↓ (Click "Apply Now")
Application Form Modal (Step 1: Resume)
  ↓ (Click "Next")
Application Form Modal (Step 2: Cover Letter)
  ↓ (Click "Next")
Application Form Modal (Step 3: Questions) [if applicable]
  ↓ (Click "Next")
Application Form Modal (Step 4: Review)
  ↓ (Click "Submit")
✅ Application Submitted!
  ↓ (Auto-navigate)
My Applications Page
```

### Referral Flow:
```
Jobs Page
  ↓ (Click job card)
Job Detail Page
  ↓ (Click "Request Referral")
Referral Marketplace (filtered by job)
  ↓ (Browse referrers)
Select Referrer
  ↓ (Send request)
✅ Referral Requested!
  ↓ (Track in)
Referral Dashboard
```

---

## Components Overview

### 1. **ApplicationForm.tsx**
**Path**: `frontend/src/components/careers/ApplicationForm.tsx`

**Features**:
- Multi-step wizard (4 steps)
- File upload with validation
- Cover letter with character count
- Custom questions support
- Real-time validation
- Error handling
- Loading states
- Success confirmation

**Props**:
- `job` - Job object
- `isOpen` - Modal visibility
- `onClose` - Close callback
- `onSubmit` - Submit callback
- `currentUser` - User data

### 2. **JobDetailPage.tsx**
**Path**: `frontend/src/components/careers/JobDetailPage.tsx`

**Features**:
- Full job details display
- Company information
- Job statistics
- "Apply Now" button (role-based)
- "Request Referral" button (role-based)
- "Save Job" functionality
- "Share Job" functionality
- Application status display

**Role Logic**:
- Shows different UI based on user role
- Checks `canApplyToJobs` permission
- Checks `canRequestReferrals` permission
- Displays "View Only" for unauthorized users

### 3. **ReferralMarketplace.tsx**
**Path**: `frontend/src/components/careers/ReferralMarketplace.tsx`

**Features**:
- Browse available referrers
- Filter by job, company, industry
- View referrer profiles
- Send referral requests
- Track request status

### 4. **MyApplicationsPage.tsx**
**Path**: `frontend/src/components/careers/MyApplicationsPage.tsx`

**Features**:
- View all applications
- Filter by status
- Search by job title/company
- Track application timeline
- View status updates
- Withdraw applications

---

## Testing Checklist

### As a Student:
- [ ] Login as Student
- [ ] Navigate to Careers page
- [ ] Click on a job
- [ ] ✅ See "Apply Now" button
- [ ] ✅ See "Request Referral" button
- [ ] Click "Apply Now"
- [ ] ✅ Application form opens
- [ ] Upload resume
- [ ] Write cover letter
- [ ] Submit application
- [ ] ✅ See "Already Applied" message
- [ ] Navigate to "My Applications"
- [ ] ✅ See submitted application

### As an Alumni:
- [ ] Same as Student tests above
- [ ] ✅ Can also provide referrals
- [ ] Navigate to "Referral Dashboard"
- [ ] ✅ See received referral requests

### As Faculty:
- [ ] Login as Faculty
- [ ] Navigate to Careers page
- [ ] Click on a job
- [ ] ❌ Should NOT see "Apply Now" button
- [ ] ✅ See "View Only" message
- [ ] Navigate to "Referral Dashboard"
- [ ] ✅ Can provide referrals

### As Employer:
- [ ] Login as Employer
- [ ] Navigate to Careers page
- [ ] Click on a job
- [ ] ❌ Should NOT see "Apply Now" button
- [ ] ✅ See "View Only" message
- [ ] Navigate to "Employer Dashboard"
- [ ] Click "View Applications"
- [ ] ✅ See all applications for jobs you posted

---

## Troubleshooting

### "I don't see the Apply button!"
**Possible causes**:
1. ✅ You're logged in as Faculty/Employer/Recruiter
   - **Solution**: Only Students and Alumni can apply to jobs

2. ✅ You've already applied to this job
   - **Solution**: Check "My Applications" page

3. ✅ You're not logged in
   - **Solution**: Login first

### "Request Referral button doesn't work!"
**Possible causes**:
1. ✅ `onRequestReferral` callback not defined
   - **Solution**: Check Dashboard.tsx passes the callback

2. ✅ No referrers available
   - **Solution**: Ask alumni/faculty to opt-in to provide referrals

### "Application form won't submit!"
**Possible causes**:
1. ✅ File size too large (>5MB)
   - **Solution**: Compress your resume

2. ✅ Cover letter too short (<100 chars)
   - **Solution**: Write a more detailed cover letter

3. ✅ Backend API error
   - **Solution**: Check backend logs

---

## Files Reference

### Frontend Files:
```
frontend/src/components/careers/
├── JobDetailPage.tsx          ← Job details + Apply/Referral buttons
├── ApplicationForm.tsx        ← Multi-step application form
├── MyApplicationsPage.tsx     ← Track your applications
├── ReferralMarketplace.tsx    ← Browse & request referrals
├── ReferralDashboard.tsx      ← Manage referral requests
└── JobsPage.tsx               ← Browse all jobs
```

### Backend Files:
```
backend/src/routes/
├── applications.ts            ← Application submission API
├── referrals.ts              ← Referral request API
└── jobs.ts                   ← Job listing API

backend/src/models/
├── Application.ts            ← Application data model
├── Referral.ts              ← Referral data model
└── Job.ts                   ← Job data model
```

### Utility Files:
```
frontend/src/utils/
└── rolePermissions.ts        ← RBAC permission checks
```

---

## Summary

✅ **Application System**: Fully implemented with multi-step form
✅ **Referral System**: Fully implemented with marketplace
✅ **Role-Based Access**: Properly enforced with permission checks
✅ **UI/UX**: Clear buttons and messaging based on user role
✅ **API Integration**: Complete backend support

**Everything is already built!** Just make sure:
1. Users are logged in with the correct role
2. Backend server is running
3. Frontend is connected to backend

If you're testing, make sure to:
- Register as a **Student** or **Alumni** to apply
- Register as **Faculty**, **Alumni**, **Employer**, or **Recruiter** to provide referrals

---

**Last Updated**: January 2025
**Status**: ✅ Fully Functional
