"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

function mensagem(error: { message?: string; code?: string } | null) {
  const code = error?.code ?? ""
  if (
    code === "USER_ALREADY_EXISTS" ||
    code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  ) {
    return "Já existe uma conta com esse e-mail."
  }
  if (code === "INVALID_EMAIL_OR_PASSWORD") {
    return "E-mail ou senha incorretos."
  }
  if (code === "PASSWORD_TOO_SHORT") {
    return "A senha precisa ter pelo menos 8 caracteres."
  }
  if (code === "INVALID_EMAIL") {
    return "Informe um e-mail válido."
  }
  return error?.message ?? "Não foi possível concluir."
}

export function FormularioEntrar() {
  const router = useRouter()
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setEnviando(true)
        setErro("")
        const dados = new FormData(event.currentTarget)
        const { error } = await authClient.signIn.email({
          email: String(dados.get("email")),
          password: String(dados.get("senha")),
          rememberMe: true,
        })
        setEnviando(false)
        if (error) {
          setErro(mensagem(error))
          return
        }
        router.push("/dashboard")
        router.refresh()
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          className="h-11"
          required
        />
      </div>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
      <Button type="submit" className="h-11" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex flex-col gap-2 text-sm">
        <Link
          href="/recuperar-senha"
          className="text-primary underline-offset-4 hover:underline"
        >
          Esqueci minha senha
        </Link>
        <Link
          href="/cadastro"
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </form>
  )
}

export function FormularioCadastro() {
  const router = useRouter()
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault()
        const dados = new FormData(event.currentTarget)
        const senha = String(dados.get("senha"))
        if (senha !== String(dados.get("confirmar"))) {
          setErro("As senhas não coincidem.")
          return
        }
        setEnviando(true)
        setErro("")
        const { error } = await authClient.signUp.email({
          name: String(dados.get("nome")),
          email: String(dados.get("email")),
          password: senha,
        })
        setEnviando(false)
        if (error) {
          setErro(mensagem(error))
          return
        }
        router.push("/dashboard")
        router.refresh()
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          autoComplete="name"
          className="h-11"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="h-11"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmar">Confirmar senha</Label>
        <Input
          id="confirmar"
          name="confirmar"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="h-11"
          required
        />
      </div>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
      <Button type="submit" className="h-11" disabled={enviando}>
        {enviando ? "Criando..." : "Criar conta"}
      </Button>
      <Link
        href="/login"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Já tenho conta
      </Link>
    </form>
  )
}

export function FormularioRecuperar() {
  const [erro, setErro] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setEnviando(true)
        setErro("")
        const dados = new FormData(event.currentTarget)
        const { error } = await authClient.requestPasswordReset({
          email: String(dados.get("email")),
          redirectTo: `${window.location.origin}/redefinir-senha`,
        })
        setEnviando(false)
        if (error) {
          setErro(mensagem(error))
          return
        }
        setEnviado(true)
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          required
        />
      </div>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
      {enviado ? (
        <p className="text-sm text-muted-foreground">
          Se esse e-mail tiver conta, o link de redefinição foi enviado. Sem a
          chave do Resend, o link aparece no terminal do servidor.
        </p>
      ) : null}
      <Button type="submit" className="h-11" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar link"}
      </Button>
      <Link
        href="/login"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Voltar para entrar
      </Link>
    </form>
  )
}

export function FormularioRedefinir({ token }: { token: string }) {
  const router = useRouter()
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault()
        const dados = new FormData(event.currentTarget)
        const senha = String(dados.get("senha"))
        if (senha !== String(dados.get("confirmar"))) {
          setErro("As senhas não coincidem.")
          return
        }
        setEnviando(true)
        setErro("")
        const { error } = await authClient.resetPassword({
          newPassword: senha,
          token,
        })
        setEnviando(false)
        if (error) {
          setErro(mensagem(error))
          return
        }
        router.push("/login")
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Nova senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="h-11"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmar">Confirmar senha</Label>
        <Input
          id="confirmar"
          name="confirmar"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="h-11"
          required
        />
      </div>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
      <Button type="submit" className="h-11" disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar senha"}
      </Button>
    </form>
  )
}
