import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email é obrigatório')
  .email('Formato de email inválido')
  .max(255, 'Email deve ter no máximo 255 caracteres');

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha deve ter no máximo 128 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome deve conter apenas letras, espaços, hífens e apóstrofes');

// Auth validation schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
});

// Post form validation
export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z
    .string()
    .trim()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres'),
  subject: z
    .string()
    .trim()
    .min(3, 'Assunto deve ter pelo menos 3 caracteres')
    .max(100, 'Assunto deve ter no máximo 100 caracteres'),
  insight: z
    .string()
    .trim()
    .max(1000, 'Insight deve ter no máximo 1000 caracteres')
    .optional(),
  day: z
    .number()
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31'),
  clientId: z.string().uuid('Cliente deve ser selecionado'),
  companyId: z.string().uuid('Empresa deve ser selecionada'),
  mediaType: z.enum(['Imagem', 'Vídeo', 'Carrossel', 'Texto blog'], {
    errorMap: () => ({ message: 'Tipo de mídia deve ser selecionado' }),
  }),
  editorialLine: z.enum(['SAZONAL', 'INSTITUCIONAL', 'BLOG', 'ROTEIRO'], {
    errorMap: () => ({ message: 'Linha editorial deve ser selecionada' }),
  }),
  responsibility: z.enum(['Agência', 'Cliente'], {
    errorMap: () => ({ message: 'Responsabilidade deve ser selecionada' }),
  }),
  networks: z.array(z.string()).min(1, 'Pelo menos uma rede social deve ser selecionada'),
  channels: z.array(z.string()).min(1, 'Pelo menos um canal deve ser selecionado'),
});

// Admin user creation validation
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
  role: z.enum(['user', 'platform_viewer', 'platform_admin', 'platform_owner'], {
    errorMap: () => ({ message: 'Role deve ser selecionada' }),
  }),
});

// Profile update validation
export const updateProfileSchema = z.object({
  full_name: nameSchema.optional(),
  email: emailSchema.optional(),
  // Role updates are handled separately with proper authorization
});

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip_address: z.string().ip('Endereço IP inválido'),
  email: emailSchema.optional(),
  attempt_count: z.number().min(1).max(100),
});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type PostFormData = z.infer<typeof postFormSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;