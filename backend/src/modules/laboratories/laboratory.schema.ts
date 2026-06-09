import { z } from 'zod';

export const createLaboratorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code is too long'),
    contactEmail: z.string().email('Invalid contact email'),
    contactPhone: z.string().min(5, 'Invalid contact phone'),
    address: z.object({
      street: z.string().min(2, 'Street is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(2, 'Zip code is required'),
      country: z.string().min(2, 'Country is required'),
    }),
  }),
});

export const updateLaboratorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid laboratory ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
    code: z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code is too long').optional(),
    contactEmail: z.string().email('Invalid contact email').optional(),
    contactPhone: z.string().min(5, 'Invalid contact phone').optional(),
    address: z.object({
      street: z.string().min(2, 'Street is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(2, 'Zip code is required'),
      country: z.string().min(2, 'Country is required'),
    }).optional(),
    isActive: z.boolean().optional(),
    verifiedAt: z.string().datetime().nullable().optional(), // allow ISO string or null
  }),
});

export const getLaboratoryParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid laboratory ID'),
  }),
});
