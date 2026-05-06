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
import { Badge } from "../../../shared/ui/badge";
import { Checkbox } from "../../../shared/ui/checkbox";
import { useToast } from "../../../shared/hooks/use-toast";
import { Plus, Trash2, QrCode } from "lucide-react";
import { ImportPartsDialog } from "../../../features/import-parts/ImportPartsDialog";
import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "../../../shared/api/client";

export type ProcessType =
  | "corte"
  | "lixamento"
  | "pintura"
  | "borda"
  | "montagem"
  | "expedicao";

const processLabels: Record<ProcessType, string> = {
  corte: "Corte",
  lixamento: "Lixamento",
  pintura: "Pintura",
  borda: "Borda",
  montagem: "Montagem",
  expedicao: "Expedição",
};

type PartRow = {
  id: string;
  code: string;
  name: string;
  is_mother_part: boolean;
  finish_color_hex: string;
  finish_color: string;
  current_process: ProcessType;
  furniture: { name: string; orders: { code: string } };
  qr_code_data?: string;
};

type FurnitureRow = {
  id: string;
  name: string;
  orders?: { code: string };
};

const PartsPage = () => {
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState<string | null>(null);
  const [form, setForm] = useState({
    furniture_id: "",
    name: "",
    code: "",
    is_mother_part: false,
    parent_part_id: "",
    width_mm: "",
    height_mm: "",
    depth_mm: "",
    material: "",
    finish_color: "",
    finish_color_hex: "#ffffff",
    finish_type: "",
    paint_recipe: "",
    edge_banding_info: "",
  });
  const [selectedProcesses, setSelectedProcesses] = useState<ProcessType[]>([
    "corte",
    "lixamento",
    "pintura",
  ]);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: furniture } = useQuery({
    queryKey: ["furniture-parts"],
    queryFn: async () => apiRequest<FurnitureRow[]>("/furniture"),
  });

  const { data: parts, isLoading } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => apiRequest<PartRow[]>("/parts"),
  });

  const motherParts = parts?.filter((p) => p.is_mother_part) ?? [];

  const save = useMutation({
    mutationFn: async () => {
      return apiRequest("/parts", {
        method: "POST",
        body: JSON.stringify({
        ...form,
        is_mother_part: form.is_mother_part,
        selected_processes: selectedProcesses,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parts"] });
      setOpen(false);
      setForm({
        furniture_id: "",
        name: "",
        code: "",
        is_mother_part: false,
        parent_part_id: "",
        width_mm: "",
        height_mm: "",
        depth_mm: "",
        material: "",
        finish_color: "",
        finish_color_hex: "#ffffff",
        finish_type: "",
        paint_recipe: "",
        edge_banding_info: "",
      });
      toast({ title: "Peça criada com QR Code!" });
    },
    onError: (e) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/parts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parts"] });
      toast({ title: "Peça removida!" });
    },
  });

  const toggleProcess = (pt: ProcessType) => {
    setSelectedProcesses((prev) =>
      prev.includes(pt) ? prev.filter((p) => p !== pt) : [...prev, pt],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Peças</h1>
          <p className="text-muted-foreground">
            Cadastre peças e gere QR Codes
          </p>
        </div>
        <div className="flex gap-2">
          <ImportPartsDialog />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Peça
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Peça</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  save.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Móvel *</Label>
                  <Select
                    value={form.furniture_id}
                    onValueChange={(v) => setForm({ ...form, furniture_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {furniture?.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({f.orders?.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      placeholder="Lateral Esquerda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                      placeholder="Auto-gerado"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mother"
                    checked={form.is_mother_part}
                    onCheckedChange={(v) =>
                      setForm({ ...form, is_mother_part: !!v })
                    }
                  />
                  <Label htmlFor="mother">
                    Peça-Mãe (carrega QR principal)
                  </Label>
                </div>
                {!form.is_mother_part && motherParts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Vincular à Peça-Mãe</Label>
                    <Select
                      value={form.parent_part_id}
                      onValueChange={(v) =>
                        setForm({ ...form, parent_part_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {motherParts.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} ({m.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Largura (mm)</Label>
                    <Input
                      type="number"
                      value={form.width_mm}
                      onChange={(e) =>
                        setForm({ ...form, width_mm: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Altura (mm)</Label>
                    <Input
                      type="number"
                      value={form.height_mm}
                      onChange={(e) =>
                        setForm({ ...form, height_mm: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profundidade</Label>
                    <Input
                      type="number"
                      value={form.depth_mm}
                      onChange={(e) =>
                        setForm({ ...form, depth_mm: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Input
                      value={form.material}
                      onChange={(e) =>
                        setForm({ ...form, material: e.target.value })
                      }
                      placeholder="MDF 18mm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo Acabamento</Label>
                    <Input
                      value={form.finish_type}
                      onChange={(e) =>
                        setForm({ ...form, finish_type: e.target.value })
                      }
                      placeholder="Laca"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor Final</Label>
                    <Input
                      value={form.finish_color}
                      onChange={(e) =>
                        setForm({ ...form, finish_color: e.target.value })
                      }
                      placeholder="Branco Neve"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preview da Cor</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={form.finish_color_hex}
                        onChange={(e) =>
                          setForm({ ...form, finish_color_hex: e.target.value })
                        }
                        className="w-16 h-10 p-1"
                      />
                      <div
                        className="h-10 flex-1 rounded-md border"
                        style={{ backgroundColor: form.finish_color_hex }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Receita da Tinta</Label>
                  <Input
                    value={form.paint_recipe}
                    onChange={(e) =>
                      setForm({ ...form, paint_recipe: e.target.value })
                    }
                    placeholder="Base X + Corante Y (30%)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Processos *</Label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(processLabels) as ProcessType[]).map((pt) => (
                      <Badge
                        key={pt}
                        variant={
                          selectedProcesses.includes(pt) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleProcess(pt)}
                      >
                        {processLabels[pt]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={save.isPending}
                >
                  {save.isPending ? "Salvando..." : "Criar Peça + QR Code"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={!!qrOpen} onOpenChange={() => setQrOpen(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QR Code da Peça</DialogTitle>
          </DialogHeader>
          {qrOpen && (
            <div className="flex flex-col items-center gap-4">
              <QRCodeSVG value={qrOpen} size={200} level="H" />
              <p className="text-xs text-muted-foreground break-all">
                {qrOpen}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Móvel</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : parts?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma peça
                  </TableCell>
                </TableRow>
              ) : (
                parts?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">
                      {p.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.is_mother_part && (
                          <Badge variant="secondary" className="text-xs">
                            Mãe
                          </Badge>
                        )}
                        {p.name}
                      </div>
                    </TableCell>
                    <TableCell>{p.furniture?.name}</TableCell>
                    <TableCell>
                      {p.finish_color_hex && (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded border"
                            style={{ backgroundColor: p.finish_color_hex }}
                          />
                          <span className="text-sm">{p.finish_color}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {p.current_process
                          ? processLabels[p.current_process as ProcessType]
                          : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQrOpen(p.qr_code_data || p.code)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => del.mutate(p.id)}
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

export default PartsPage;
