import z from 'zod'

export const registrationSchema = z.object({
  name: z.string().min(3),
  email: z.email().min(5),
  password: z.string().min(8),
})

export type RegistrationFields = z.infer<typeof registrationSchema>
