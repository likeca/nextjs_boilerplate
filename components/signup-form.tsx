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
import { PhoneInput } from "@/components/ui/phone-input"
import { signUp, emailOtp } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { isValidPhoneNumber, type Value } from "react-phone-number-input"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().refine((val) => {
    // Phone is optional - empty or valid
    if (!val || val.length === 0) return true;
    try {
      return isValidPhoneNumber(val);
    } catch {
      return false;
    }
  }, {
    message: 'Please enter a valid phone number',
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phone, setPhone] = useState<Value | undefined>()
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const emailValue = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    // Validate with Zod
    const validation = signupSchema.safeParse({ 
      name, 
      email: emailValue, 
      phone,
      password, 
      confirmPassword 
    })

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      if (validation.error?.issues) {
        validation.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
      }
      setErrors(fieldErrors)
      toast.error("Please fix the errors in the form")
      return
    }

    setIsLoading(true)

    try {
      const signupData: any = {
        email: emailValue,
        password,
        name,
      };
      
      // Add phone if provided
      if (phone) {
        signupData.phone = phone;
      }

      const { data, error } = await signUp.email(signupData);

      if (error) {
        toast.error(error.message || "Failed to create account")
        setIsLoading(false)
        return
      }

      // Show OTP verification form
      setEmail(emailValue)
      setShowOtpVerification(true)
      toast.success("Account created! Please check your email for the verification code.")
      setIsLoading(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
      setIsLoading(false)
    }
  }

  async function handleOtpVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await emailOtp.verifyEmail({
        email,
        otp,
      })

      if (error) {
        toast.error(error.message || "Invalid verification code")
        setIsLoading(false)
        return
      }

      toast.success("Email verified successfully!")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email")
      setIsLoading(false)
    }
  }

  async function handleResendOtp() {
    setIsLoading(true)
    try {
      const { error } = await emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })

      if (error) {
        toast.error(error.message || "Failed to resend code")
      } else {
        toast.success("Verification code resent!")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  if (showOtpVerification) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a 6-digit code to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpVerification}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                  />
                  <FieldDescription>
                    Enter the 6-digit code sent to your email
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? "Verifying..." : "Verify Email"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isLoading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number (Optional)</FieldLabel>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={(value) => setPhone(value || undefined)}
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                  error={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={isLoading}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      disabled={isLoading}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
