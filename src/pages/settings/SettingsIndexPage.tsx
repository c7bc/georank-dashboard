import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Users, Key, Plug, Globe, Calendar, User, ChevronRight } from "lucide-react";

export function SettingsIndexPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { t: tProfile } = useTranslation('translation', { keyPrefix: 'profile' });
  const { t: tPref } = useTranslation('translation', { keyPrefix: 'preferences' });
  const { t: tSched } = useTranslation('translation', { keyPrefix: 'scheduling' });

  const accountItems = [
    { title: tProfile("title"), description: tProfile("subtitle"), icon: User, href: "/settings/profile" },
    { title: tPref("title"), description: tPref("subtitle"), icon: Globe, href: "/settings/preferences" },
    { title: tSched("title"), description: tSched("settingsDesc"), icon: Calendar, href: "/settings/scheduling" },
    { title: t("team"), description: "Manage team members and permissions", icon: Users, href: "/settings/team" },
  ];

  const billingItems = [
    { title: t("billing"), description: "Manage your subscription and payment methods", icon: CreditCard, href: "/settings/billing" },
    { title: t("apiKeys"), description: "Manage API keys for integrations", icon: Key, href: "/settings/api-keys" },
    { title: t("integrations"), description: "Connect with Slack, webhooks, and more", icon: Plug, href: "/settings/integrations" },
  ];

  return (
    <>
      <DashboardHeader title={t("settings")} />
      <main className="flex-1 overflow-auto p-6">
        <div className="@container/main space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("settings")}</h2>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your profile, preferences, and team</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-6">
                  {accountItems.map((item, index) => (
                    <div key={item.title}>
                      {index > 0 && <Separator className="mb-6" />}
                      <Link to={item.href} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium group-hover:text-primary transition-colors">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs">
              <CardHeader>
                <CardTitle>Billing & Integrations</CardTitle>
                <CardDescription>Manage subscriptions, API keys, and connections</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-6">
                  {billingItems.map((item, index) => (
                    <div key={item.title}>
                      {index > 0 && <Separator className="mb-6" />}
                      <Link to={item.href} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium group-hover:text-primary transition-colors">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
