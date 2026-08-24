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

export const createLabServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category is too long'),
    labPrice: z.number().min(0, 'Price cannot be negative'),
    turnaroundTime: z.string().min(1, 'Turnaround time is required').max(50, 'Turnaround time is too long'),
  }),
});

export const updateLabServiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name is too long').optional(),
    description: z.string().max(500, 'Description is too long').optional(),
    category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category is too long').optional(),
    labPrice: z.number().min(0, 'Price cannot be negative').optional(),
    turnaroundTime: z.string().min(1, 'Turnaround time is required').max(50, 'Turnaround time is too long').optional(),
    isActive: z.boolean().optional(),
    // Admin only fields:
    platformPrice: z.number().min(0, 'Price cannot be negative').optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  }),
});

export const getLabServiceParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID'),
  }),
});
