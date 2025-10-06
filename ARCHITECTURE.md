# Portfolio Architecture - Service-Based Design

## 🏗️ **Architecture Overview**

The portfolio has been refactored to use a **clean service-based architecture** that separates concerns and makes the code more maintainable, testable, and scalable.

## 📁 **Project Structure**

```
portfolio/
├── services/                 # Service layer
│   ├── types.ts            # Common types and interfaces
│   ├── base.service.ts     # Base service class
│   ├── hero.service.ts     # Hero section service
│   ├── project.service.ts  # Project management service
│   ├── contact.service.ts  # Contact management service
│   ├── auth.service.ts     # Authentication service
│   ├── upload.service.ts   # File upload service
│   └── index.ts           # Service exports
├── hooks/                   # React hooks for services
│   ├── useService.ts       # Generic service hooks
│   ├── useHero.ts         # Hero-specific hooks
│   ├── useProjects.ts     # Project-specific hooks
│   ├── useContact.ts      # Contact-specific hooks
│   ├── useAuth.ts         # Authentication hooks
│   ├── useUpload.ts       # Upload hooks
│   └── index.ts           # Hook exports
├── components/             # UI components (now clean)
├── app/                   # Next.js app directory
└── models/                # Database models
```

## 🔧 **Service Layer**

### **Base Service (`base.service.ts`)**
- Provides common functionality for all services
- Handles HTTP requests with error handling
- Manages response formatting
- Provides consistent error handling

### **Individual Services**

#### **Hero Service (`hero.service.ts`)**
```typescript
// Get hero data
const heroData = await heroService.getHeroData()

// Update hero data
await heroService.updateHeroData(newData)
```

#### **Project Service (`project.service.ts`)**
```typescript
// Get all projects
const projects = await projectService.getProjects()

// Get featured projects
const featured = await projectService.getFeaturedProjects(3)

// Search projects
const results = await projectService.searchProjects('Next.js')

// CRUD operations
await projectService.createProject(data)
await projectService.updateProject(id, data)
await projectService.deleteProject(id)
```

#### **Contact Service (`contact.service.ts`)**
```typescript
// Submit contact form
await contactService.submitContact(formData)

// Get contact info
const info = await contactService.getContactInfo()

// Get all contacts (admin)
const contacts = await contactService.getContacts()
```

#### **Auth Service (`auth.service.ts`)**
```typescript
// Login
const result = await authService.login(credentials)

// Check authentication
const isAuth = authService.isAuthenticated()

// Logout
await authService.logout()
```

#### **Upload Service (`upload.service.ts`)**
```typescript
// Upload single image
const result = await uploadService.uploadImage(file)

// Upload multiple images
const results = await uploadService.uploadMultipleImages(files)

// Validate file
const validation = uploadService.validateImageFile(file)
```

## 🎣 **React Hooks**

### **Generic Service Hook (`useService.ts`)**
```typescript
// For data fetching
const { data, loading, error, execute } = useService(() => service.getData())

// For mutations
const { mutate, loading, error } = useServiceMutation((params) => service.update(params))
```

### **Specific Hooks**

#### **Hero Hooks (`useHero.ts`)**
```typescript
const { data: heroData, loading, error } = useHero()
const { mutate: updateHero, loading: updating } = useUpdateHero()
```

#### **Project Hooks (`useProjects.ts`)**
```typescript
const { data: projects, loading } = useFeaturedProjects(6)
const { data: project } = useProject(projectId)
const { mutate: createProject } = useCreateProject()
const { mutate: updateProject } = useUpdateProject()
const { mutate: deleteProject } = useDeleteProject()
```

#### **Contact Hooks (`useContact.ts`)**
```typescript
const { data: contactInfo, loading } = useContactInfo()
const { mutate: submitContact, loading: submitting } = useSubmitContact()
const { data: contacts } = useContacts()
```

#### **Auth Hooks (`useAuth.ts`)**
```typescript
const { isAuthenticated, user, login, logout, loading } = useAuth()
```

#### **Upload Hooks (`useUpload.ts`)**
```typescript
const { mutate: uploadImage, loading: uploading } = useUploadImage()
const { mutate: uploadMultiple } = useUploadMultipleImages()
const { validateFile, getPreview } = useImageValidation()
```

## 🎯 **Benefits of This Architecture**

### **1. Separation of Concerns**
- **Services**: Handle business logic and API calls
- **Hooks**: Manage React state and side effects
- **Components**: Focus on UI rendering
- **API Routes**: Simple request/response handling

### **2. Reusability**
- Services can be used in any component
- Hooks provide consistent state management
- Base service reduces code duplication

### **3. Testability**
- Services can be easily unit tested
- Hooks can be tested with React Testing Library
- Mock services for component testing

### **4. Maintainability**
- Clear structure and organization
- Easy to add new features
- Consistent error handling
- Type safety throughout

### **5. Performance**
- Automatic loading states
- Error boundaries
- Optimized re-renders
- Caching capabilities

## 🔄 **Data Flow**

```
Component → Hook → Service → API Route → Database
    ↓        ↓       ↓         ↓          ↓
   UI    State   Business   Request   Storage
         Mgmt    Logic     Handling
```

## 📝 **Usage Examples**

### **In a Component**
```typescript
import { useFeaturedProjects, useCreateProject } from '@/hooks'

function ProjectsPage() {
  const { data: projects, loading, error } = useFeaturedProjects(6)
  const { mutate: createProject, loading: creating } = useCreateProject()

  const handleCreate = async (data) => {
    try {
      await createProject(data)
      // Success handling
    } catch (error) {
      // Error handling
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage />

  return <ProjectsList projects={projects} />
}
```

### **Custom Service**
```typescript
import { BaseService } from '@/services'

class CustomService extends BaseService {
  constructor() {
    super('/api/custom')
  }

  async getCustomData() {
    return this.request<CustomData>('')
  }
}

export const customService = new CustomService()
```

### **Custom Hook**
```typescript
import { useService } from '@/hooks'
import { customService } from '@/services'

export function useCustomData() {
  return useService(() => customService.getCustomData())
}
```

## 🚀 **Future Enhancements**

### **1. Caching**
- Add React Query for advanced caching
- Implement service-level caching
- Add optimistic updates

### **2. Real-time Updates**
- WebSocket integration
- Real-time notifications
- Live data synchronization

### **3. Advanced Error Handling**
- Global error boundary
- Retry mechanisms
- Offline support

### **4. Performance Optimization**
- Code splitting
- Lazy loading
- Memoization

## 🎉 **Result**

The portfolio now has:
- ✅ **Clean Architecture**: Well-organized, maintainable code
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Error Handling**: Consistent error management
- ✅ **Reusability**: Modular, reusable components
- ✅ **Testability**: Easy to test and debug
- ✅ **Performance**: Optimized rendering and data fetching
- ✅ **Scalability**: Easy to add new features

This architecture makes the codebase professional, maintainable, and ready for future growth! 🚀
