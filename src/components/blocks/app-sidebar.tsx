import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Globe,
  Search,
  Users,
  FileText,
  Lightbulb,
  CreditCard,
  Key,
  Plug,
} from "lucide-react";

import { GeoRankIcon } from "@/components/shared/georank-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/blocks/nav-main";
import { NavUser } from "@/components/blocks/nav-user";
import type { MeResponse } from "@/lib/api";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: MeResponse;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });

  const data = {
    navGroups: [
      {
        label: t("main"),
        items: [
          { title: t("dashboard"), icon: LayoutDashboard, url: "/" },
          { title: t("domains"), icon: Globe, url: "/domains" },
          { title: t("keywords"), icon: Search, url: "/keywords" },
          { title: t("competitors"), icon: Users, url: "/competitors" },
          { title: t("reports"), icon: FileText, url: "/reports" },
          { title: t("recommendations"), icon: Lightbulb, url: "/recommendations" },
        ],
      },
      {
        label: t("settings"),
        items: [
          { title: t("team"), icon: Users, url: "/settings/team" },
          { title: t("billing"), icon: CreditCard, url: "/settings/billing" },
          { title: t("apiKeys"), icon: Key, url: "/settings/api-keys" },
          { title: t("integrations"), icon: Plug, url: "/settings/integrations" },
        ],
      },
    ],
  };
 
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="py-8">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center [&>svg]:size-[28px]">
              <Link to="/" className="flex items-center gap-3">
                <GeoRankIcon size={28} className="text-primary shrink-0 transition-transform" />
                <span className="text-xl font-bold tracking-tight truncate group-data-[collapsible=icon]:hidden">
                  GeoRank
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
