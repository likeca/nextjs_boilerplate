"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Checkbox } from "@/components/ui/checkbox";

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    revokeOtherSessions: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.changePassword({
        newPassword: formData.newPassword,
        currentPassword: formData.currentPassword,
        revokeOtherSessions: formData.revokeOtherSessions,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
        return;
      }

      toast.success(
        formData.revokeOtherSessions
          ? "Password changed successfully! All other sessions have been logged out."
          : "Password changed successfully!"
      );

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        revokeOtherSessions: false,
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type={showPasswords ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            placeholder="Enter your current password"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type={showPasswords ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            placeholder="Enter your new password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters long
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type={showPasswords ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Confirm your new password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showPasswords"
            checked={showPasswords}
            onCheckedChange={(checked) => setShowPasswords(checked as boolean)}
          />
          <Label
            htmlFor="showPasswords"
            className="text-sm font-normal cursor-pointer"
          >
            Show passwords
          </Label>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="revokeOtherSessions"
              checked={formData.revokeOtherSessions}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, revokeOtherSessions: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label
                htmlFor="revokeOtherSessions"
                className="text-sm font-medium cursor-pointer"
              >
                Log out all other devices
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                This will sign you out from all other browsers and devices. You
                will remain signed in on this device.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </div>
    </form>
  );
}
