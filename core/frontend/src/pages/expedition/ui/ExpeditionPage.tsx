import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { useToast } from "../../../shared/hooks/use-toast";
import { Truck, CheckCircle } from "lucide-react";

let mockOrders = [
  {
    id: "1",
    code: "PED-001",
    status: "pronto",
    clients: { name: "Cliente A", email: "a@a.com" },
    estimated_delivery: "2026-04-10",
  },
  {
    id: "2",
    code: "PED-002",
    status: "montagem",
    clients: { name: "Cliente B", email: "b@b.com" },
    estimated_delivery: "2026-04-12",
  },
];

const ExpeditionPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: readyOrders, isLoading } = useQuery({
    queryKey: ["ready-orders"],
    queryFn: async () => {
      return mockOrders.filter((o) =>
        ["pronto", "montagem", "expedido"].includes(o.status),
      );
    },
  });

  const expedite = useMutation({
    mutationFn: async (orderId: string) => {
      mockOrders = mockOrders.map((o) =>
        o.id === orderId ? { ...o, status: "expedido" } : o,
      );
      // Simula envio de notificação sem o Edge function
      console.log(
        "Mock: Notificação de expedição enviada para o pedido",
        orderId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ready-orders"] });
      toast({
        title: "Pedido expedido!",
        description: "Status atualizado e cliente notificado.",
      });
    },
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Expedição</h1>
        <p className="text-muted-foreground">Pedidos prontos para entrega</p>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Carregando...</p>
      ) : readyOrders?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum pedido pronto para expedição
            </p>
          </CardContent>
        </Card>
      ) : (
        readyOrders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.code}</CardTitle>
                <Badge
                  variant={
                    order.status === "expedido" ? "default" : "secondary"
                  }
                >
                  {order.status === "expedido" ? "Expedido" : "Pronto"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  {order.clients?.name}
                </p>
                {order.clients?.email && (
                  <p>
                    <span className="text-muted-foreground">E-mail:</span>{" "}
                    {order.clients?.email}
                  </p>
                )}
                {order.estimated_delivery && (
                  <p>
                    <span className="text-muted-foreground">Entrega:</span>{" "}
                    {new Date(order.estimated_delivery).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                )}
              </div>
              {order.status !== "expedido" && (
                <Button
                  className="w-full"
                  onClick={() => expedite.mutate(order.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como Expedido
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ExpeditionPage;
