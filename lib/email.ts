import { Resend } from "resend"

export async function enviarEmailRecuperacao(para: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? "iCheque <onboarding@resend.dev>"

  if (!apiKey) {
    console.info(`[icheque] Link de recuperação para ${para}: ${url}`)
    return
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: para,
    subject: "Redefinir senha do iCheque",
    text: `Use este link para definir uma senha nova no iCheque: ${url}`,
  })

  if (error) {
    console.error("[icheque] Falha ao enviar e-mail de recuperação", error)
  }
}
