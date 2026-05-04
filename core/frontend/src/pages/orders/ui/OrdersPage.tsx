import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../entities/user/ui/AuthContext";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent } from "../../../shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { useToast } from "../../../shared/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiRequest } from "../../../shared/api/client";

export type OrderStatus =
  | "rascunho"
  | "em_producao"
  | "montagem"
  | "pronto"
  | "expedido";

const statusLabels: Record<OrderStatus, string> = {
  rascunho: "Rascunho",
  em_producao: "Em Produção",
  montagem: "Montagem",
  pronto: "Pronto",
  expedido: "Expedido",
};

const statusColors: Record<OrderStatus, string> = {
  rascunho: "bg-muted text-muted-foreground",
  em_producao: "bg-primary/10 text-primary",
  montagem: "bg-accent/20 text-accent-foreground",
  pronto: "bg-green-100 text-green-800",
  expedido: "bg-green-200 text-green-900",
};

const OrdersPage = () => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_id: "",
    code: "",
    description: "",
    status: "rascunho" as OrderStatus,
    estimated_delivery: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => apiRequest<any[]>("/clients"),
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => apiRequest<any[]>("/orders"),
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        created_by: user?.id,
      };

      if (editId) {
        return apiRequest(`/orders/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      setOpen(false);
      resetForm();
      toast({ title: editId ? "Pedido atualizado!" : "Pedido criado!" });
    },
    onError: (e) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/orders/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Pedido removido!" });
    },
  });

  const resetForm = () => {
    setForm({
      client_id: "",
      code: "",
      description: "",
      status: "rascunho",
      estimated_delivery: "",
    });
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie pedidos de clientes</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Editar Pedido" : "Novo Pedido"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={form.client_id}
                  onValueChange={(v) => setForm({ ...form, client_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    placeholder="PED-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as OrderStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Entrega Estimada</Label>
                <Input
                  type="date"
                  value={form.estimated_delivery}
                  onChange={(e) =>
                    setForm({ ...form, estimated_delivery: e.target.value })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={save.isPending}
              >
                {save.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum pedido
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-medium">
                      {o.code}
                    </TableCell>
                    <TableCell>{o.clients?.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[o.status]}>
                        {statusLabels[o.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {o.estimated_delivery
                        ? new Date(o.estimated_delivery).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setForm({
                              client_id: o.client_id,
                              code: o.code,
                              description: o.description || "",
                              status: o.status,
                              estimated_delivery:
                                o.estimated_delivery?.slice(0, 10) || "",
                            });
                            setEditId(o.id);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => del.mutate(o.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
