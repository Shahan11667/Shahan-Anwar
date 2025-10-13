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

// Export all models
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

// This ensures all models are registered when this file is imported
export default {
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

