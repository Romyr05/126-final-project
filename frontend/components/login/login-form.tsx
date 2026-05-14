"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { login } from "@/lib/auth"

import Link  from "next/link"




export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {


  const router = useRouter()

  const[password, setPassword] = useState("")
  const[email,setEmail] = useState("")

  const[error,setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    setError("")

    try {
      const logged = await login({email, password})
      if (logged){
        router.replace("/")
      }

    } catch {
      setError("Invalid email or password")
    }

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <Input id="password" type="password" value = {password} 
                onChange={(event) => setPassword(event.target.value )} required />
              </Field>
              <Field>
                {error && (
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
