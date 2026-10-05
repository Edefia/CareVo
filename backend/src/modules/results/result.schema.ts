import { z } from 'zod';

const biomarkerSchema = z.object({
  name: z.string().min(1, 'Biomarker name is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  referenceRange: z.string().min(1, 'Reference range is required'),
  flag: z.enum(['NORMAL', 'LOW', 'HIGH', 'CRITICAL']),
  interpretation: z.string().optional().nullable(),
  reportingType: z.string().optional(),
  resultStatus: z.enum(['PENDING', 'ENTERED', 'VERIFIED']).optional(),
  positiveNegative: z.enum(['POSITIVE', 'NEGATIVE']).optional().nullable(),
});

export const createResultSchema = z.object({
  body: z.object({
    referralCode: z.string().min(1, 'Referral code is required').optional(),
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
    collectionDate: z.string().datetime(),
    panelName: z.string().min(2, 'Panel name must be at least 2 characters'),
    panelType: z.enum(['PROFILE', 'TEST']).optional(),
    status: z.enum(['DRAFT', 'FINAL']).default('DRAFT'),
    testStatus: z.enum(['PENDING', 'PARTIAL', 'COMPLETE']).optional(),
    biomarkers: z.array(biomarkerSchema).min(1, 'At least one biomarker is required'),
    notes: z.string().optional().nullable(),
    laboratoryFindings: z.string().optional().nullable(),
    orderedFrom: z.string().optional().nullable(),
  }),
});

export const updateResultStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid result ID'),
  }),
  body: z.object({
    status: z.enum(['DRAFT', 'FINAL', 'AMENDED', 'CANCELLED']),
  }),
});

export const updateResultSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid result ID'),
  }),
  body: z.object({
    biomarkers: z.array(biomarkerSchema).optional(),
    notes: z.string().optional().nullable(),
    laboratoryFindings: z.string().optional().nullable(),
    testStatus: z.enum(['PENDING', 'PARTIAL', 'COMPLETE']).optional(),
    sampleApprovedById: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    sampleApprovedTime: z.string().datetime().optional().nullable(),
  }),
});

export const submitForApprovalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid result ID'),
  }),
  body: z.object({
    biomarkers: z.array(biomarkerSchema).optional(),
    laboratoryFindings: z.string().optional().nullable(),
  }),
});

export const getResultQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID').optional(),
    status: z.enum(['DRAFT', 'FINAL', 'AMENDED', 'CANCELLED']).optional(),
    testStatus: z.enum(['PENDING', 'PARTIAL', 'COMPLETE']).optional(),
    referralCode: z.string().optional(),
  }),
});

export const getResultParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid result ID'),
  }),
});
