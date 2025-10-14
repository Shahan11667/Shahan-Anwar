# Vercel Serverless Environment - Model Registration Fix

## Problem

When deploying to Vercel (a serverless environment), each API route runs in isolation. This means that Mongoose models need to be explicitly registered in each route file, otherwise you'll get errors like:

```
Schema hasn't been registered for model "Admin"
Schema hasn't been registered for model "Doctor"
Schema hasn't been registered for model "Patient"
```

## Root Cause

In serverless environments like Vercel:
- Each API route is a separate serverless function
- Functions don't share memory or state
- Mongoose models must be imported/registered in each function independently
- Simply importing a model that references other models (via `populate()`) isn't enough

## Solution

We created a central model registry at `models/index.ts` that imports ALL models, and then import this file in EVERY API route:

```typescript
import '@/models'; // Import all models to ensure they're registered
```

## Files Fixed

### Session Routes
- ✅ `app/api/sessions/route.ts`
- ✅ `app/api/sessions/[id]/route.ts`
- ✅ `app/api/doctor/sessions/route.ts`
- ✅ `app/api/doctor/sessions/[id]/route.ts`
- ✅ `app/api/patient/sessions/available/route.ts`

### Appointment Routes (Patient)
- ✅ `app/api/patient/appointments/route.ts`
- ✅ `app/api/patient/appointments/[id]/cancel/route.ts`
- ✅ `app/api/patient/appointments/[id]/records/route.ts`
- ✅ `app/api/patient/appointments/[id]/records/[recordId]/route.ts`

### Appointment Routes (Doctor)
- ✅ `app/api/doctor/appointments/route.ts`
- ✅ `app/api/doctor/appointments/[id]/approve/route.ts`
- ✅ `app/api/doctor/appointments/[id]/cancel/route.ts`
- ✅ `app/api/doctor/appointments/[id]/complete/route.ts`
- ✅ `app/api/doctor/appointments/[id]/records/route.ts`

### Doctor Routes
- ✅ `app/api/doctors/route.ts`
- ✅ `app/api/doctors/[id]/route.ts`
- ✅ `app/api/doctor/profile/route.ts`
- ✅ `app/api/doctor/auth/login/route.ts`
- ✅ `app/api/doctor/change-password/route.ts`

### Patient Routes
- ✅ `app/api/patient/auth/login/route.ts`
- ✅ `app/api/patient/auth/register/route.ts`

### Admin Routes
- ✅ `app/api/admin/auth/login/route.ts`
- ✅ `app/api/admin/settings/route.ts`

### Specialty Routes
- ✅ `app/api/specialties/route.ts`
- ✅ `app/api/specialties/[id]/route.ts`

### Chat Routes
- ✅ `app/api/chat/messages/route.ts`
- ✅ `app/api/chat/messages/private/route.ts`
- ✅ `app/api/chat/conversations/route.ts`
- ✅ `app/api/chat/users/route.ts`
- ✅ `app/api/chat/users/online/route.ts`
- ✅ `app/api/chat/users/search/route.ts`
- ✅ `app/api/chat/users/[id]/approve/route.ts`
- ✅ `app/api/chat/auth/login/route.ts`
- ✅ `app/api/chat/auth/register/route.ts`
- ✅ `app/api/chat/auth/me/route.ts`
- ✅ `app/api/chat/auth/logout/route.ts`

### Other Routes
- ✅ `app/api/projects/route.ts`
- ✅ `app/api/projects/[id]/route.ts`
- ✅ `app/api/contact/route.ts`
- ✅ `app/api/contacts/route.ts`
- ✅ `app/api/contact-info/route.ts`
- ✅ `app/api/hero/route.ts`
- ✅ `app/api/auth/login/route.ts`

## How It Works

The `models/index.ts` file:

```typescript
// Central model registry - Import this file to ensure all models are registered
// This is crucial for serverless environments like Vercel where each function
// is isolated and models need to be explicitly loaded

import Admin from './Admin';
import Specialty from './Specialty';
import Doctor from './Doctor';
import Session from './Session';
import Patient from './Patient';
import Appointment from './Appointment';
import MedicalRecord from './MedicalRecord';
import Contact from './Contact';
import ContactInfo from './ContactInfo';
import Hero from './Hero';
import Project from './Project';
import User from './User';
import ChatUser from './ChatUser';
import ChatMessage from './ChatMessage';
import AdminSettings from './AdminSettings';

export {
  Admin,
  Specialty,
  Doctor,
  Session,
  Patient,
  Appointment,
  MedicalRecord,
  Contact,
  ContactInfo,
  Hero,
  Project,
  User,
  ChatUser,
  ChatMessage,
  AdminSettings,
};
```

## Testing

After deploying to Vercel, test these critical endpoints:

1. **Sessions API**: `GET /api/sessions` - should populate doctor, specialty, and admin
2. **Appointments API**: `GET /api/patient/appointments` - should populate doctor and session with specialty
3. **Doctor Appointments**: `GET /api/doctor/appointments` - should populate patient and session
4. **Chat Messages**: `GET /api/chat/messages` - should populate sender

## Key Takeaways

1. **Always import `@/models`** at the top of every API route file
2. **Order matters**: Import `@/models` BEFORE importing specific models
3. **This pattern is required** for Vercel and other serverless platforms
4. **Local development** may work without this, but production will fail

## Future Reference

When creating new API routes that use Mongoose models, always follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // ← ALWAYS ADD THIS LINE
import YourModel from '@/models/YourModel';
// ... rest of your imports
```

This ensures all models are registered before any database operations occur.

