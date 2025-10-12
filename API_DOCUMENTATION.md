# Doctor Appointment System - API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Authentication

### Admin Login
```
POST /admin/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

---

## Specialties

### Get All Specialties
```
GET /specialties
```

**Query Parameters:**
- `isActive` (optional): boolean

**Response:**
```json
{
  "success": true,
  "message": "Specialties fetched successfully",
  "data": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "icon": "string",
      "isActive": true,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "count": 0
}
```

---

### Get Single Specialty
```
GET /specialties/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Specialty fetched successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Create Specialty (Admin Only)
```
POST /specialties
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Specialty created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Update Specialty (Admin Only)
```
PUT /specialties/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Specialty updated successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Delete Specialty (Admin Only)
```
DELETE /specialties/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Specialty deleted successfully",
  "data": {
    "_id": "string",
    "name": "string"
  }
}
```

---

## Doctors

### Get All Doctors
```
GET /doctors
```

**Query Parameters:**
- `specialty` (optional): string (specialty ID)
- `isActive` (optional): boolean
- `isAvailable` (optional): boolean
- `search` (optional): string
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "degree": "string",
      "specialties": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "icon": "string"
        }
      ],
      "profileImage": "string",
      "bio": "string",
      "experience": 0,
      "socialMedia": {
        "facebook": "string",
        "instagram": "string",
        "twitter": "string",
        "tiktok": "string",
        "linkedin": "string"
      },
      "isActive": true,
      "isAvailableForAppointments": true,
      "rating": 0,
      "totalReviews": 0,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

---

### Get Single Doctor
```
GET /doctors/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor fetched successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "degree": "string",
    "specialties": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "icon": "string"
      }
    ],
    "profileImage": "string",
    "bio": "string",
    "experience": 0,
    "socialMedia": {
      "facebook": "string",
      "instagram": "string",
      "twitter": "string",
      "tiktok": "string",
      "linkedin": "string"
    },
    "isActive": true,
    "isAvailableForAppointments": true,
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Create Doctor (Admin Only)
```
POST /doctors
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "degree": "string",
  "specialties": ["string"],
  "profileImage": "string",
  "bio": "string",
  "experience": 0,
  "socialMedia": {
    "facebook": "string",
    "instagram": "string",
    "twitter": "string",
    "tiktok": "string",
    "linkedin": "string"
  }
}
```

**Required Fields:**
- name, email, password, degree, specialties (array with at least one ID)

**Response:**
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "degree": "string",
    "specialties": [
      {
        "_id": "string",
        "name": "string"
      }
    ],
    "profileImage": "string",
    "bio": "string",
    "experience": 0,
    "socialMedia": {
      "facebook": "string",
      "instagram": "string",
      "twitter": "string",
      "tiktok": "string",
      "linkedin": "string"
    },
    "isActive": true,
    "isAvailableForAppointments": true,
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Update Doctor (Admin Only)
```
PUT /doctors/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "degree": "string",
  "specialties": ["string"],
  "profileImage": "string",
  "bio": "string",
  "experience": 0,
  "socialMedia": {
    "facebook": "string",
    "instagram": "string",
    "twitter": "string",
    "tiktok": "string",
    "linkedin": "string"
  },
  "isActive": true,
  "isAvailableForAppointments": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor updated successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "degree": "string",
    "specialties": [
      {
        "_id": "string",
        "name": "string"
      }
    ],
    "profileImage": "string",
    "bio": "string",
    "experience": 0,
    "socialMedia": {
      "facebook": "string",
      "instagram": "string",
      "twitter": "string",
      "tiktok": "string",
      "linkedin": "string"
    },
    "isActive": true,
    "isAvailableForAppointments": true,
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Delete Doctor (Admin Only)
```
DELETE /doctors/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor deleted successfully",
  "data": {
    "id": "string"
  }
}
```

---

## Doctor Authentication & Profile

### Doctor Login
```
POST /doctor/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string",
    "doctor": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "degree": "string",
      "specialties": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "icon": "string"
        }
      ],
      "profileImage": "string",
      "bio": "string",
      "experience": 0,
      "socialMedia": {
        "facebook": "string",
        "instagram": "string",
        "twitter": "string",
        "tiktok": "string",
        "linkedin": "string"
      },
      "isActive": true,
      "isAvailableForAppointments": true,
      "rating": 0,
      "totalReviews": 0,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

---

### Get Doctor Profile
```
GET /doctor/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "degree": "string",
    "specialties": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "icon": "string"
      }
    ],
    "profileImage": "string",
    "bio": "string",
    "experience": 0,
    "socialMedia": {
      "facebook": "string",
      "instagram": "string",
      "twitter": "string",
      "tiktok": "string",
      "linkedin": "string"
    },
    "isActive": true,
    "isAvailableForAppointments": true,
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Change Password
```
PUT /doctor/change-password
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Doctor Sessions (Doctor's Own Sessions)

### Get My Sessions
```
GET /doctor/sessions
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` (optional): string (YYYY-MM-DD format)
- `startDate` (optional): string (YYYY-MM-DD format)
- `endDate` (optional): string (YYYY-MM-DD format)
- `isActive` (optional): boolean
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Sessions fetched successfully",
  "data": [
    {
      "_id": "string",
      "specialty": {
        "_id": "string",
        "name": "string",
        "description": "string",
        "icon": "string"
      },
      "hospital": "string",
      "floor": "string",
      "room": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "description": "string",
      "images": ["string"],
      "isActive": true,
      "maxAppointments": 0,
      "bookedAppointments": 0,
      "createdBy": {
        "_id": "string",
        "name": "string",
        "email": "string"
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

---

### Get Single My Session
```
GET /doctor/sessions/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Session fetched successfully",
  "data": {
    "_id": "string",
    "specialty": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "icon": "string"
    },
    "hospital": "string",
    "floor": "string",
    "room": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "description": "string",
    "images": ["string"],
    "isActive": true,
    "maxAppointments": 0,
    "bookedAppointments": 0,
    "createdBy": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Create My Session
```
POST /doctor/sessions
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "specialty": "string",
  "hospital": "string",
  "floor": "string",
  "room": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "description": "string",
  "images": ["string"],
  "maxAppointments": 0
}
```

**Required Fields:**
- specialty, hospital, floor, room, date, startTime, endTime
- date format: YYYY-MM-DD
- time format: HH:mm

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "_id": "string",
    "specialty": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "icon": "string"
    },
    "hospital": "string",
    "floor": "string",
    "room": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "description": "string",
    "images": ["string"],
    "isActive": true,
    "maxAppointments": 0,
    "bookedAppointments": 0,
    "createdBy": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Update My Session
```
PUT /doctor/sessions/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "specialty": "string",
  "hospital": "string",
  "floor": "string",
  "room": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "description": "string",
  "images": ["string"],
  "maxAppointments": 0,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "_id": "string",
    "specialty": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "icon": "string"
    },
    "hospital": "string",
    "floor": "string",
    "room": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "description": "string",
    "images": ["string"],
    "isActive": true,
    "maxAppointments": 0,
    "bookedAppointments": 0,
    "createdBy": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Delete My Session
```
DELETE /doctor/sessions/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully",
  "data": {
    "id": "string"
  }
}
```

---

## Admin Sessions (All Sessions)

### Get All Sessions
```
GET /sessions
```

**Query Parameters:**
- `doctor` (optional): string (doctor ID)
- `specialty` (optional): string (specialty ID)
- `hospital` (optional): string
- `date` (optional): string (YYYY-MM-DD format)
- `startDate` (optional): string (YYYY-MM-DD format)
- `endDate` (optional): string (YYYY-MM-DD format)
- `isActive` (optional): boolean
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Sessions fetched successfully",
  "data": [
    {
      "_id": "string",
      "doctor": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "degree": "string",
        "profileImage": "string"
      },
      "specialty": {
        "_id": "string",
        "name": "string",
        "icon": "string"
      },
      "hospital": "string",
      "floor": "string",
      "room": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "description": "string",
      "images": ["string"],
      "isActive": true,
      "maxAppointments": 0,
      "bookedAppointments": 0,
      "createdBy": {
        "_id": "string",
        "name": "string",
        "email": "string"
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

---

### Get Single Session
```
GET /sessions/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Session fetched successfully",
  "data": {
    "_id": "string",
    "doctor": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "degree": "string",
      "profileImage": "string",
      "phone": "string"
    },
    "specialty": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "icon": "string"
    },
    "hospital": "string",
    "floor": "string",
    "room": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "description": "string",
    "images": ["string"],
    "isActive": true,
    "maxAppointments": 0,
    "bookedAppointments": 0,
    "createdBy": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Create Session (Admin Only)
```
POST /sessions
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "doctor": "string",
  "specialty": "string",
  "hospital": "string",
  "floor": "string",
  "room": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "description": "string",
  "images": ["string"],
  "maxAppointments": 0
}
```

**Required Fields:**
- doctor, specialty, hospital, floor, room, date, startTime, endTime
- date format: YYYY-MM-DD (e.g., "2025-10-15")
- time format: HH:mm (e.g., "09:00", "17:30")

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "_id": "string",
    "doctor": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "degree": "string",
      "profileImage": "string"
    },
    "specialty": {
      "_id": "string",
      "name": "string",
      "icon": "string"
    },
    "hospital": "string",
    "floor": "string",
    "room": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "description": "string",
    "images": ["string"],
    "isActive": true,
    "maxAppointments": 0,
    "bookedAppointments": 0,
    "createdBy": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Update Session (Admin Only)
```
PUT /sessions/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "doctor": "string",
  "specialty": "string",
  "hospital": "string",
  "floor": "string",
  "room": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "description": "string",
  "images": ["string"],
  "maxAppointments": 0,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "_id": "string",
    "doctor": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "degree": "string",
      "profileImage": "string",
      "phone": "string"
    },
    "specialty": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "icon": "string"
    },
    "hospital": "string",
    "floor": "string",
    "room": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "description": "string",
    "images": ["string"],
    "isActive": true,
    "maxAppointments": 0,
    "bookedAppointments": 0,
    "createdBy": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Delete Session (Admin Only)
```
DELETE /sessions/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully",
  "data": {
    "id": "string"
  }
}
```

---

## Doctor Appointments Management

### Get My Appointments (Doctor)
```
GET /doctor/appointments
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): string (pending, confirmed, cancelled, completed)
- `date` (optional): string (YYYY-MM-DD format)
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Appointments fetched successfully",
  "data": [
    {
      "_id": "string",
      "patient": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "dateOfBirth": "string",
        "gender": "string",
        "address": "string",
        "profileImage": "string"
      },
      "session": {
        "_id": "string",
        "hospital": "string",
        "floor": "string",
        "room": "string",
        "date": "string",
        "startTime": "string",
        "endTime": "string",
        "specialty": {
          "_id": "string",
          "name": "string",
          "icon": "string"
        }
      },
      "appointmentDate": "string",
      "appointmentTime": "string",
      "status": "string",
      "notes": "string",
      "cancelReason": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

---

### Approve/Confirm Appointment (Doctor)
```
PUT /doctor/appointments/{id}/approve
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment confirmed successfully",
  "data": {
    "_id": "string",
    "patient": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "dateOfBirth": "string",
      "gender": "string",
      "address": "string",
      "profileImage": "string"
    },
    "session": {
      "_id": "string",
      "hospital": "string",
      "floor": "string",
      "room": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "specialty": {
        "_id": "string",
        "name": "string",
        "icon": "string"
      }
    },
    "appointmentDate": "string",
    "appointmentTime": "string",
    "status": "confirmed",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Cancel/Reject Appointment (Doctor)
```
PUT /doctor/appointments/{id}/cancel
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "cancelReason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "string",
    "patient": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string"
    },
    "session": {
      "_id": "string",
      "hospital": "string",
      "floor": "string",
      "room": "string"
    },
    "appointmentDate": "string",
    "appointmentTime": "string",
    "status": "cancelled",
    "notes": "string",
    "cancelReason": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Mark Appointment as Completed (Doctor)
```
PUT /doctor/appointments/{id}/complete
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment marked as completed",
  "data": {
    "_id": "string",
    "patient": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string"
    },
    "session": {
      "_id": "string",
      "hospital": "string",
      "floor": "string",
      "room": "string"
    },
    "appointmentDate": "string",
    "appointmentTime": "string",
    "status": "completed",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

## Patient Authentication & Appointments

### Patient Register
```
POST /patient/auth/register
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "dateOfBirth": "string",
  "gender": "string",
  "address": "string",
  "profileImage": "string"
}
```

**Required Fields:**
- name, email, password, phone
- gender values: "male", "female", "other"
- dateOfBirth format: YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "address": "string",
    "profileImage": "string",
    "medicalHistory": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Patient Login
```
POST /patient/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string",
    "patient": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "dateOfBirth": "string",
      "gender": "string",
      "address": "string",
      "profileImage": "string",
      "medicalHistory": "string",
      "isActive": true,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

---

### Get Available Sessions
```
GET /patient/sessions/available
```

**Query Parameters:**
- `doctor` (optional): string (doctor ID)
- `specialty` (optional): string (specialty ID)
- `hospital` (optional): string
- `date` (optional): string (YYYY-MM-DD format)
- `startDate` (optional): string (YYYY-MM-DD format)
- `endDate` (optional): string (YYYY-MM-DD format)
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Available sessions fetched successfully",
  "data": [
    {
      "_id": "string",
      "doctor": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "degree": "string",
        "profileImage": "string",
        "phone": "string",
        "rating": 0
      },
      "specialty": {
        "_id": "string",
        "name": "string",
        "description": "string",
        "icon": "string"
      },
      "hospital": "string",
      "floor": "string",
      "room": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "description": "string",
      "images": ["string"],
      "isActive": true,
      "maxAppointments": 0,
      "bookedAppointments": 0,
      "availableSlots": 0,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

---

### Get My Appointments
```
GET /patient/appointments
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): string (pending, confirmed, cancelled, completed)
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Appointments fetched successfully",
  "data": [
    {
      "_id": "string",
      "patient": "string",
      "session": {
        "_id": "string",
        "hospital": "string",
        "floor": "string",
        "room": "string",
        "date": "string",
        "startTime": "string",
        "endTime": "string",
        "specialty": {
          "_id": "string",
          "name": "string",
          "icon": "string"
        }
      },
      "doctor": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "degree": "string",
        "profileImage": "string",
        "phone": "string"
      },
      "appointmentDate": "string",
      "appointmentTime": "string",
      "status": "string",
      "notes": "string",
      "cancelReason": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

---

### Book Appointment
```
POST /patient/appointments
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "sessionId": "string",
  "appointmentTime": "string",
  "notes": "string"
}
```

**Required Fields:**
- sessionId, appointmentTime
- appointmentTime format: HH:mm (e.g., "09:30")
- appointmentTime must be within session's startTime and endTime

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "string",
    "patient": "string",
    "session": {
      "_id": "string",
      "hospital": "string",
      "floor": "string",
      "room": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "specialty": {
        "_id": "string",
        "name": "string",
        "icon": "string"
      }
    },
    "doctor": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "degree": "string",
      "profileImage": "string",
      "phone": "string"
    },
    "appointmentDate": "string",
    "appointmentTime": "string",
    "status": "pending",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Cancel My Appointment (Patient)
```
PUT /patient/appointments/{id}/cancel
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "cancelReason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "string",
    "patient": "string",
    "session": {
      "_id": "string",
      "hospital": "string",
      "floor": "string",
      "room": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "specialty": {
        "_id": "string",
        "name": "string",
        "icon": "string"
      }
    },
    "doctor": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "degree": "string",
      "profileImage": "string",
      "phone": "string"
    },
    "appointmentDate": "string",
    "appointmentTime": "string",
    "status": "cancelled",
    "notes": "string",
    "cancelReason": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

## Medical Records (Patient - Track Appointment Data)

### Get Medical Records for Appointment
```
GET /patient/appointments/{id}/records
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical records fetched successfully",
  "data": [
    {
      "_id": "string",
      "appointment": "string",
      "patient": "string",
      "doctor": "string",
      "type": "string",
      "title": "string",
      "description": "string",
      "fileUrl": "string",
      "textContent": "string",
      "notes": "string",
      "fileSize": 0,
      "mimeType": "string",
      "uploadedBy": "patient",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "count": 0
}
```

---

### Add Medical Record to Appointment
```
POST /patient/appointments/{id}/records
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "type": "string",
  "title": "string",
  "description": "string",
  "fileUrl": "string",
  "textContent": "string",
  "notes": "string",
  "fileSize": 0,
  "mimeType": "string"
}
```

**Required Fields:**
- type (values: "image", "video", "pdf", "document", "note", "other")
- title
- fileUrl (for file types) OR textContent (for notes)

**Notes:**
- Can only add records to confirmed or completed appointments
- Images: type="image", provide fileUrl
- Videos: type="video", provide fileUrl
- PDFs: type="pdf", provide fileUrl
- Text notes: type="note", provide textContent
- Documents: type="document", provide fileUrl

**Response:**
```json
{
  "success": true,
  "message": "Medical record added successfully",
  "data": {
    "_id": "string",
    "appointment": "string",
    "patient": "string",
    "doctor": "string",
    "type": "string",
    "title": "string",
    "description": "string",
    "fileUrl": "string",
    "textContent": "string",
    "notes": "string",
    "fileSize": 0,
    "mimeType": "string",
    "uploadedBy": "patient",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Get Single Medical Record
```
GET /patient/appointments/{id}/records/{recordId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical record fetched successfully",
  "data": {
    "_id": "string",
    "appointment": "string",
    "patient": "string",
    "doctor": "string",
    "type": "string",
    "title": "string",
    "description": "string",
    "fileUrl": "string",
    "textContent": "string",
    "notes": "string",
    "fileSize": 0,
    "mimeType": "string",
    "uploadedBy": "patient",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Update Medical Record
```
PUT /patient/appointments/{id}/records/{recordId}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "fileUrl": "string",
  "textContent": "string",
  "notes": "string",
  "fileSize": 0,
  "mimeType": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical record updated successfully",
  "data": {
    "_id": "string",
    "appointment": "string",
    "patient": "string",
    "doctor": "string",
    "type": "string",
    "title": "string",
    "description": "string",
    "fileUrl": "string",
    "textContent": "string",
    "notes": "string",
    "fileSize": 0,
    "mimeType": "string",
    "uploadedBy": "patient",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### Delete Medical Record
```
DELETE /patient/appointments/{id}/records/{recordId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical record deleted successfully",
  "data": {
    "id": "string"
  }
}
```

---

## Medical Records (Doctor - View Patient Data)

### View Patient Medical Records for Appointment
```
GET /doctor/appointments/{id}/records
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical records fetched successfully",
  "data": [
    {
      "_id": "string",
      "appointment": "string",
      "patient": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "doctor": "string",
      "type": "string",
      "title": "string",
      "description": "string",
      "fileUrl": "string",
      "textContent": "string",
      "notes": "string",
      "fileSize": 0,
      "mimeType": "string",
      "uploadedBy": "patient",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "count": 0
}
```

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
