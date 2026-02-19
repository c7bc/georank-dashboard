import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, AlertCircle } from "lucide-react";
import {
  useUpdateProfile,
  useUpdateWorkspace,
  useChangeEmail,
  useConfirmEmailChange,
  useChangePassword,
  useConfirmPasswordChange,
} from "@/hooks/mutations/use-profile-mutations";
import type { MeResponse } from "@/lib/api";

interface ProfileClientProps {
  user: MeResponse;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });

  const updateProfileMutation = useUpdateProfile();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const changeEmailMutation = useChangeEmail();
  const confirmEmailMutation = useConfirmEmailChange();
  const changePasswordMutation = useChangePassword();
  const confirmPasswordMutation = useConfirmPasswordChange();

  // Profile name
  const [name, setName] = useState(user.name);

  // Workspace name
  const [workspaceName, setWorkspaceName] = useState(user.workspace);

  // Email change
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password change
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [passwordCode, setPasswordCode] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveName = async () => {
    try {
      await updateProfileMutation.mutateAsync({ name });
      toast.success(t("saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleSaveWorkspace = async () => {
    try {
      await updateWorkspaceMutation.mutateAsync({ name: workspaceName });
      toast.success(t("saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update workspace");
    }
  };

  // Email change handlers
  const handleEmailStep1 = async () => {
    setEmailError(null);
    try {
      await changeEmailMutation.mutateAsync({ new_email: newEmail, password: emailPassword });
      toast.success(t("codeSent"));
      setEmailStep(2);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to send verification code");
    }
  };

  const handleEmailStep2 = async () => {
    setEmailError(null);
    try {
      await confirmEmailMutation.mutateAsync({ code: emailCode });
      toast.success(t("emailChanged"));
      setEmailDialogOpen(false);
      resetEmailState();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to confirm email change");
    }
  };

  const resetEmailState = () => {
    setEmailStep(1);
    setNewEmail("");
    setEmailPassword("");
    setEmailCode("");
    setEmailError(null);
  };

  // Password change handlers
  const handlePasswordStep1 = async () => {
    if (newPassword !== confirmPwd) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError(null);
    try {
      await changePasswordMutation.mutateAsync({ current_password: currentPassword, new_password: newPassword });
      toast.success(t("codeSent"));
      setPasswordStep(2);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to request password change");
    }
  };

  const handlePasswordStep2 = async () => {
    setPasswordError(null);
    try {
      await confirmPasswordMutation.mutateAsync({ code: passwordCode });
      toast.success(t("passwordChanged"));
      setPasswordDialogOpen(false);
      resetPasswordState();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to confirm password change");
    }
  };

  const resetPasswordState = () => {
    setPasswordStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPwd("");
    setPasswordCode("");
    setPasswordError(null);
  };

  const savingName = updateProfileMutation.isPending;
  const savingWorkspace = updateWorkspaceMutation.isPending;
  const emailLoading = changeEmailMutation.isPending || confirmEmailMutation.isPending;
  const passwordLoading = changePasswordMutation.isPending || confirmPasswordMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
        <CardHeader>
          <CardTitle>{t("name")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </div>
          <Button onClick={handleSaveName} disabled={savingName || name === user.name}>
            {savingName ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("save")}...
              </>
            ) : (
              t("save")
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Workspace Section */}
      {user.role === "owner" && (
        <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
          <CardHeader>
            <CardTitle>{t("workspace")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace">{t("workspaceName")}</Label>
              <Input
                id="workspace"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">{t("workspaceDesc")}</p>
            </div>
            <Button
              onClick={handleSaveWorkspace}
              disabled={savingWorkspace || workspaceName === user.workspace}
            >
              {savingWorkspace ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("save")}...
                </>
              ) : (
                t("save")
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Section */}
      <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
        <CardHeader>
          <CardTitle>{t("email")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("currentEmail")}</Label>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <Dialog
            open={emailDialogOpen}
            onOpenChange={(open) => {
              setEmailDialogOpen(open);
              if (!open) resetEmailState();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">{t("changeEmail")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("changeEmail")}</DialogTitle>
                <DialogDescription>
                  {emailStep === 1
                    ? t("currentEmail") + ": " + user.email
                    : t("codeSent")}
                </DialogDescription>
              </DialogHeader>
              {emailError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{emailError}</AlertDescription>
                </Alert>
              )}
              {emailStep === 1 ? (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">{t("newEmail")}</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder={t("newEmailPlaceholder")}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-password">{t("currentPassword")}</Label>
                    <Input
                      id="email-password"
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="email-code">{t("verificationCode")}</Label>
                    <Input
                      id="email-code"
                      placeholder="000000"
                      maxLength={6}
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                {emailStep === 1 ? (
                  <Button
                    onClick={handleEmailStep1}
                    disabled={emailLoading || !newEmail || !emailPassword}
                  >
                    {emailLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("sendCode")}...
                      </>
                    ) : (
                      t("sendCode")
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleEmailStep2}
                    disabled={emailLoading || emailCode.length < 6}
                  >
                    {emailLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("confirmChange")}...
                      </>
                    ) : (
                      t("confirmChange")
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
        <CardHeader>
          <CardTitle>{t("password")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog
            open={passwordDialogOpen}
            onOpenChange={(open) => {
              setPasswordDialogOpen(open);
              if (!open) resetPasswordState();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">{t("changePassword")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("changePassword")}</DialogTitle>
                <DialogDescription>
                  {passwordStep === 1
                    ? t("password")
                    : t("codeSent")}
                </DialogDescription>
              </DialogHeader>
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              {passwordStep === 1 ? (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t("currentPassword")}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t("newPassword")}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="password-code">{t("verificationCode")}</Label>
                    <Input
                      id="password-code"
                      placeholder="000000"
                      maxLength={6}
                      value={passwordCode}
                      onChange={(e) => setPasswordCode(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                {passwordStep === 1 ? (
                  <Button
                    onClick={handlePasswordStep1}
                    disabled={
                      passwordLoading ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPwd
                    }
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("sendCode")}...
                      </>
                    ) : (
                      t("sendCode")
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePasswordStep2}
                    disabled={passwordLoading || passwordCode.length < 6}
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("confirmChange")}...
                      </>
                    ) : (
                      t("confirmChange")
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="from-destructive/5 to-card dark:bg-card bg-gradient-to-t shadow-xs border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{t("deleteDesc")}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="destructive" disabled>
                    {t("deleteAccount")}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("deleteDesc")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
