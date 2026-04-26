/**
 * Validation Schemas using Zod
 * Centralized validation for all API endpoints
 */

import { z } from 'zod';

/**
 * Login validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});

/**
 * User registration validation
 */
export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email address'),
  role: z
    .enum(['admin', 'organizer'], {
      errorMap: () => ({ message: 'Role must be either admin or organizer' })
    })
});

/**
 * Team registration validation
 */
export const teamRegistrationSchema = z.object({
  schoolName: z
    .string()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s.,-]+$/, 'School name contains invalid characters'),
  schoolAddress: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(255, 'Address must be less than 255 characters'),
  whatsapp: z
    .string()
    .min(5, 'WhatsApp number is too short')
    .max(20, 'WhatsApp number is too long'),
  level: z
    .enum(['SMA', 'SMP'], {
      errorMap: () => ({ message: 'Level must be either SMA or SMP' })
    }),
  gender: z
    .enum(['Putra', 'Putri'], {
      errorMap: () => ({ message: 'Gender must be either Putra or Putri' })
    }),
  players: z
    .array(z.object({
      name: z
        .string()
        .min(3, 'Player name must be at least 3 characters')
        .max(100, 'Player name must be less than 100 characters'),
      cardFile: z
        .string()
        .optional()
        .nullable(),
      card_url: z
        .string()
        .url('Invalid card URL')
        .optional()
        .nullable()
    }))
    .min(5, 'Minimum 5 players required')
    .max(15, 'Maximum 15 players allowed'),
  officials: z
    .array(z.string())
    .min(2, 'Minimum 2 officials required'),
  logoFile: z.string().optional().nullable(),
  paymentProofFile: z.string().optional().nullable(),
  status: z.string().optional()
});

/**
 * Score submission validation
 */
export const scoreSchema = z.object({
  matchKey: z
    .string()
    .regex(
      /^\d+-(M\d{2}|QF\d|SF\d|F1)-(sma|smp)-(putra|putri)$/,
      'Invalid match key format'
    ),
  score1: z
    .number()
    .min(0, 'Score cannot be negative')
    .max(999, 'Score cannot exceed 999'),
  score2: z
    .number()
    .min(0, 'Score cannot be negative')
    .max(999, 'Score cannot exceed 999')
});

/**
 * Draw results validation
 */
export const drawResultsSchema = z.object({
  results: z
    .array(z.object({
      team1: z
        .string()
        .min(3, 'Team name must be at least 3 characters')
        .max(255, 'Team name must be less than 255 characters'),
      team2: z
        .string()
        .min(3, 'Team name must be at least 3 characters')
        .max(255, 'Team name must be less than 255 characters')
    }))
    .length(8, 'Must have exactly 8 matches')
});

/**
 * Settings update validation
 */
export const settingsSchema = z.object({
  bankName: z
    .string()
    .min(3, 'Bank name must be at least 3 characters')
    .max(100, 'Bank name must be less than 100 characters'),
  accountNumber: z
    .string()
    .min(5, 'Account number must be at least 5 characters')
    .max(50, 'Account number must be less than 50 characters'),
  accountName: z
    .string()
    .min(3, 'Account name must be at least 3 characters')
    .max(100, 'Account name must be less than 100 characters'),
  registrationFee: z
    .number()
    .min(0, 'Fee cannot be negative')
    .max(100000000, 'Fee seems too high'),
  whatsappContact: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid WhatsApp number')
});

/**
 * Helper function to validate data
 * @param {z.ZodSchema} schema - Zod schema to use
 * @param {any} data - Data to validate
 * @returns {{ success: boolean, data?: any, errors?: any[] }}
 */
export function validateData(schema, data) {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ message: 'Validation failed' }]
    };
  }
}
