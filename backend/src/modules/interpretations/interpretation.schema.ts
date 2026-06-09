import { z } from 'zod';

export const createInterpretationSchema = z.object({
  body: z.object({
    resultId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid result ID'),
    summary: z.string().min(5, 'Summary must be at least 5 characters'),
    clinicalNotes: z.string().optional().nullable(),
    recommendations: z.string().optional().nullable(),
  }),
});

export const updateInterpretationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interpretation ID'),
  }),
  body: z.object({
    summary: z.string().min(5).optional(),
    clinicalNotes: z.string().optional().nullable(),
    recommendations: z.string().optional().nullable(),
  }),
});

export const publishInterpretationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interpretation ID'),
  }),
});
