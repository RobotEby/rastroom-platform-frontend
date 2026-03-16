import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../entities/user/ui/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '../../../shared/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sofa,
  Puzzle,
  ScanLine,
  Paintbrush,
  PackageCheck,
  Truck,
  BarChart3,
  LogOut,
  QrCode,
  Download,
} from 'lucide-react';
import { Button } from '../../../shared/ui/button';

const adminItems = [
  { title: 'Painel', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Pedidos', url: '/pedidos', icon: ClipboardList },
  { title: 'Móveis', url: '/moveis', icon: Sofa },
  { title: 'Peças', url: '/pecas', icon: Puzzle },
];

const factoryItems = [
  { title: 'Scanner', url: '/scanner', icon: ScanLine },
  { title: 'Processos', url: '/processos', icon: Paintbrush },
];

const assemblyItems = [
  { title: 'Montagem / Kit', url: '/montagem', icon: PackageCheck },
  { title: 'Expedição', url: '/expedicao', icon: Truck },
];

const supervisorItems = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Instalar App', url: '/instalar', icon: Download },
];

export function AppSidebar() {
  const { signOut, hasRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = hasRole('admin');
  const isOperador = hasRole('operador') || hasRole('operator');
  const isMontagem = hasRole('montagem');
  const isSupervisor = hasRole('supervisor');
  const showAll = !isAdmin && !isOperador && !isMontagem && !isSupervisor;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">
              Rastroom
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              Rastreabilidade
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {(isAdmin || showAll) && (
          <SidebarGroup>
            <SidebarGroupLabel>Engenharia</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isOperador || isAdmin || showAll) && (
          <SidebarGroup>
            <SidebarGroupLabel>Chão de Fábrica</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {factoryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isMontagem || isAdmin || showAll) && (
          <SidebarGroup>
            <SidebarGroupLabel>Montagem & Expedição</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {assemblyItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isSupervisor || isAdmin || showAll) && (
          <SidebarGroup>
            <SidebarGroupLabel>Supervisor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supervisorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-sidebar-foreground/60 mb-2 truncate">
          {user?.email}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/80"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
