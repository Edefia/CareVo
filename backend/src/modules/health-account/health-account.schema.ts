import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ─── Export Parameters to Health Account ────────────────────────────────────
export const exportToHealthAccountSchema = z.object({
  body: z.object({
    resultId: z.string().regex(objectIdRegex, 'Invalid result ID'),
    parameters: z
      .array(
        z.object({
          parameterKey: z.string().min(1, 'Parameter key is required'),
          parameterName: z.string().min(1, 'Parameter name is required'),
          pillar: z.enum(['CARDIO', 'RENAL', 'METABOLIC']),
          value: z.string().min(1, 'Value is required'),
          unit: z.string().min(1, 'Unit is required'),
          referenceMin: z.number().nullable().optional().default(null),
          referenceMax: z.number().nullable().optional().default(null),
          testDate: z.string().min(1, 'Test date is required'),
          laboratoryId: z.string().regex(objectIdRegex, 'Invalid laboratory ID'),
          laboratoryName: z.string().min(1, 'Laboratory name is required'),
        })
      )
      .min(1, 'At least one parameter must be selected'),
  }),
});

// ─── Delete Parameter from Health Account ───────────────────────────────────
export const deleteParameterSchema = z.object({
  params: z.object({
    parameterKey: z.string().min(1, 'Parameter key is required'),
  }),
});
