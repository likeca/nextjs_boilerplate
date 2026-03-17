"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Shield, ShieldCheck } from "lucide-react"

export function TwoFactorSettings() {
  const { data: session } = authClient.useSession()
  const [isEnabling, setIsEnabling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isTwoFactorEnabled = (session?.user as any)?.twoFactorEnabled

  const handleEnableTwoFactor = async () => {
    setIsLoading(true)
    try {
      const result = await (authClient as any).twoFactor.enable({
        password: "",
      })
      if (result?.data?.totpURI) {
        setQrCode(result.data.totpURI)
        setBackupCodes(result.data.backupCodes || [])
        setIsEnabling(true)
      }
    } catch (error) {
      toast.error("Failed to enable 2FA")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    setIsLoading(true)
    try {
      await (authClient as any).twoFactor.verifyTotp({ code: totpCode })
      toast.success("Two-factor authentication enabled!")
      setIsEnabling(false)
      setQrCode(null)
    } catch (error) {
      toast.error("Invalid code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    setIsLoading(true)
    try {
      await (authClient as any).twoFactor.disable()
      toast.success("Two-factor authentication disabled")
    } catch (error) {
      toast.error("Failed to disable 2FA")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isTwoFactorEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          ) : (
            <Shield className="h-5 w-5 text-muted-foreground" />
          )}
          <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
          {isTwoFactorEnabled && <Badge variant="default" className="ml-auto">Enabled</Badge>}
        </div>
        <CardDescription>
          Add an extra layer of security to your account using an authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isEnabling ? (
          <div className="flex gap-2">
            {!isTwoFactorEnabled ? (
              <Button onClick={handleEnableTwoFactor} disabled={isLoading}>
                Enable 2FA
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleDisableTwoFactor} disabled={isLoading}>
                Disable 2FA
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <p className="text-xs font-mono break-all max-w-xs">{qrCode}</p>
              </div>
            )}
            {backupCodes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Backup codes (save these!):</p>
                <div className="grid grid-cols-2 gap-1 font-mono text-xs bg-muted p-3 rounded">
                  {backupCodes.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Enter the 6-digit code to verify</Label>
              <div className="flex gap-2">
                <Input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-32 font-mono text-center"
                />
                <Button onClick={handleVerifyAndEnable} disabled={isLoading || totpCode.length !== 6}>
                  Verify & Enable
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
