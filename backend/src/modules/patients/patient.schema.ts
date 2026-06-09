import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(2, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(2, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Emergency contact name is required'),
  relationship: z.string().min(2, 'Relationship is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
});

export const createPatientProfileSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(), // Optional if self-registering (inferred from token), required if staff creating
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.enum(['Male', 'Female', 'Other', 'Unknown']).optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
    address: addressSchema.optional().nullable(),
    emergencyContact: emergencyContactSchema.optional().nullable(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.array(z.string()).optional(),
  }),
});

export const updatePatientProfileSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
  }),
  body: z.object({
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.enum(['Male', 'Female', 'Other', 'Unknown']).optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
    address: addressSchema.optional().nullable(),
    emergencyContact: emergencyContactSchema.optional().nullable(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.array(z.string()).optional(),
  }),
});

export const getPatientsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    laboratoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid laboratory ID').optional(),
    // We could add search filters like name or email, which would require a $lookup with the Users collection.
  }),
});

export const getPatientParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
  }),
});
