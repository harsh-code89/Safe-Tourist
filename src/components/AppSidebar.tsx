import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Users,
  ChevronDown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navigation = [
  { title: 'Command Center', url: '/', icon: LayoutDashboard },
  { title: 'Live Map', url: '/map', icon: Map },
  { title: 'Alert Center', url: '/alerts', icon: AlertTriangle },
  { title: 'Manage Tourists', url: '/tourists', icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted/50';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sm">Tourist Safety</h2>
                <p className="text-xs text-muted-foreground">Smart Protection System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs text-muted-foreground font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-foreground hover:bg-muted hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions Section */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-2 text-xs text-muted-foreground font-medium">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4">
                <Button 
                  variant="emergency" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Mode
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Quick access to emergency features
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Role Section */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Role:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium capitalize">{profile?.role || 'Admin'}/Police</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}