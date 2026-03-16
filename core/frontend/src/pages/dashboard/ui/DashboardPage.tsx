import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { ClipboardList, Puzzle, Users, PackageCheck } from "lucide-react";

const DashboardPage = () => {
  const { data: orderCount } = useQuery({
    queryKey: ["orders-count"],
    queryFn: async () => 12, // Mock Count
  });

  const { data: partCount } = useQuery({
    queryKey: ["parts-count"],
    queryFn: async () => 450, // Mock Count
  });

  const { data: clientCount } = useQuery({
    queryKey: ["clients-count"],
    queryFn: async () => 35, // Mock Count
  });

  const { data: pendingParts } = useQuery({
    queryKey: ["pending-parts"],
    queryFn: async () => 87, // Mock Count
  });

  const stats = [
    {
      label: "Pedidos",
      value: orderCount ?? 0,
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      label: "Peças",
      value: partCount ?? 0,
      icon: Puzzle,
      color: "text-accent-foreground",
    },
    {
      label: "Clientes",
      value: clientCount ?? 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Peças Pendentes",
      value: pendingParts ?? 0,
      icon: PackageCheck,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel de Controle</h1>
        <p className="text-muted-foreground">Visão geral da produção</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
