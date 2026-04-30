import crypto from 'node:crypto'
import { z } from 'zod'
import prisma from '../../db/client'

const schema = z.object({
  email: z.string().email('Email invalide'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const { email } = result.data

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  // Always return the same message to avoid user enumeration
  if (!user) {
    return { message: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé.' }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetExpiry: expiry },
  })

  const resetUrl = `${getHeader(event, 'origin') || 'http://localhost:3000'}/reset-password?token=${token}`

  // In production this URL would be delivered by email.
  // During development (no email service configured) the URL is returned in the
  // response so that the flow can be tested without a mail server.
  const response: { message: string; resetUrl?: string } = {
    message: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé.',
  }
  if (process.env.NODE_ENV !== 'production') {
    response.resetUrl = resetUrl
  }
  return response
})
