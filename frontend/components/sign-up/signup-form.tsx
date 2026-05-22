"use client"

import { FormEvent} from "react"
import { signup } from "@/lib/auth"
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
import React, { useState } from "react"
import Link from "next/link"


function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const[error,setError] = useState("")

  const[username, setUsername] = useState("")
  const[email,setEmail] = useState("")

  const[password,setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>){  //type form submit
    event.preventDefault()
    setError("")
  
    //Logic for the pasword

    if(password !== confirmPassword){
      setError(
        "Password not match"
      )
      return
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try{
      const checking = await signup({
        username,email,password
      })
      await sleep(700)
      
      //For not to run every edit or what
      if (checking){
        //The main screen
        router.replace("/login")
      }
    } catch (err){
      await sleep(700)
      setError(err instanceof Error ? err.message: ("Could not create acccount"))
    } finally{
      setLoading(false)
    }


  }


  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" value={username}
              onChange={(event) => setUsername(event.target.value)} required />
            </Field>
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
              <FieldDescription>
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" value = {password} onChange={(event) => setPassword(event.target.value)} required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required 
               value = {confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                {error && (
                <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href ="/login">Log in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
