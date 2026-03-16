import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "../../../shared/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const mockOrdersList = [
  { id: "1", code: "PED-001", clients: { name: "Cliente A" } },
];
let mockFurnitureList = [
  {
    id: "1",
    order_id: "1",
    name: "Armário Base",
    description: "",
    furniture_type: "Armário",
    estimated_lead_time_hours: 12,
    orders: mockOrdersList[0],
  },
];

const FurniturePage = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    order_id: "",
    name: "",
    description: "",
    furniture_type: "",
    estimated_lead_time_hours: "",
  });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ["orders-list"],
    queryFn: async () => mockOrdersList,
  });

  const { data: furniture, isLoading } = useQuery({
    queryKey: ["furniture"],
    queryFn: async () => mockFurnitureList,
  });

  const save = useMutation({
    mutationFn: async () => {
      const orderMatch = mockOrdersList.find((o) => o.id === form.order_id);
      mockFurnitureList.push({
        id: Date.now().toString(),
        order_id: form.order_id,
        name: form.name,
        description: form.description || "",
        furniture_type: form.furniture_type || "",
        estimated_lead_time_hours: form.estimated_lead_time_hours
          ? Number(form.estimated_lead_time_hours)
          : 0,
        orders: orderMatch ?? { id: "", code: "", clients: { name: "" } },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["furniture"] });
      setOpen(false);
      setForm({
        order_id: "",
        name: "",
        description: "",
        furniture_type: "",
        estimated_lead_time_hours: "",
      });
      toast({ title: "Móvel adicionado!" });
    },
    onError: (e) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      mockFurnitureList = mockFurnitureList.filter((f) => f.id !== id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["furniture"] });
      toast({ title: "Móvel removido!" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Móveis</h1>
          <p className="text-muted-foreground">Cadastre móveis por pedido</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Móvel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Móvel</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Pedido *</Label>
                <Select
                  value={form.order_id}
                  onValueChange={(v) => setForm({ ...form, order_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders?.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.code} - {o.clients?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ex: Armário Cozinha"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    value={form.furniture_type}
                    onChange={(e) =>
                      setForm({ ...form, furniture_type: e.target.value })
                    }
                    placeholder="Ex: Armário"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lead Time (h)</Label>
                  <Input
                    type="number"
                    value={form.estimated_lead_time_hours}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimated_lead_time_hours: e.target.value,
                      })
                    }
                  />
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
                <TableHead>Nome</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : furniture?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum móvel
                  </TableCell>
                </TableRow>
              ) : (
                furniture?.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="font-mono">
                      {f.orders?.code}
                    </TableCell>
                    <TableCell>{f.furniture_type || "—"}</TableCell>
                    <TableCell>{f.estimated_lead_time_hours}h</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => del.mutate(f.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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

export default FurniturePage;
