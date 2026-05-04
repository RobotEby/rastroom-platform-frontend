import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../shared/ui/button";
import { Label } from "../../shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";
import { Badge } from "../../shared/ui/badge";
import { useToast } from "../../shared/hooks/use-toast";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { apiRequest } from "../../shared/api/client";

export type ProcessType =
  | "corte"
  | "lixamento"
  | "pintura"
  | "borda"
  | "montagem"
  | "expedicao";

interface ParsedPart {
  name: string;
  code: string;
  width_mm: number | null;
  height_mm: number | null;
  depth_mm: number | null;
  material: string;
  finish_color: string;
  finish_color_hex: string;
  finish_type: string;
  paint_recipe: string;
  edge_banding_info: string;
  is_mother_part: boolean;
}

function parseCSV(text: string): ParsedPart[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  return lines
    .slice(1)
    .map((line) => {
      const cols = line
        .split(/[,;]/)
        .map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        name: cols[0] || "",
        code:
          cols[1] ||
          `P-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5)}`,
        width_mm: cols[2] ? Number(cols[2]) : null,
        height_mm: cols[3] ? Number(cols[3]) : null,
        depth_mm: cols[4] ? Number(cols[4]) : null,
        material: cols[5] || "",
        finish_color: cols[6] || "",
        finish_color_hex: cols[7] || "#ffffff",
        finish_type: cols[8] || "",
        paint_recipe: cols[9] || "",
        edge_banding_info: cols[10] || "",
        is_mother_part: (cols[11] || "").toLowerCase() === "sim",
      };
    })
    .filter((p) => p.name);
}

function parseXML(text: string): ParsedPart[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");
  const parts = doc.querySelectorAll("part, peca, piece");
  return Array.from(parts)
    .map((el) => {
      const get = (tags: string[]) => {
        for (const t of tags) {
          const node = el.querySelector(t);
          if (node?.textContent) return node.textContent.trim();
        }
        return "";
      };
      return {
        name: get(["name", "nome"]),
        code:
          get(["code", "codigo"]) ||
          `P-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5)}`,
        width_mm: get(["width", "largura"])
          ? Number(get(["width", "largura"]))
          : null,
        height_mm: get(["height", "altura"])
          ? Number(get(["height", "altura"]))
          : null,
        depth_mm: get(["depth", "profundidade"])
          ? Number(get(["depth", "profundidade"]))
          : null,
        material: get(["material"]),
        finish_color: get(["color", "cor"]),
        finish_color_hex: get(["color_hex", "cor_hex"]) || "#ffffff",
        finish_type: get(["finish_type", "tipo_acabamento", "acabamento"]),
        paint_recipe: get(["paint_recipe", "receita_tinta", "receita"]),
        edge_banding_info: get(["edge_banding", "borda"]),
        is_mother_part:
          get(["mother", "mae", "peca_mae"]).toLowerCase() === "sim",
      };
    })
    .filter((p) => p.name);
}

const defaultProcesses: ProcessType[] = ["corte", "lixamento", "pintura"];

export function ImportPartsDialog() {
  const [open, setOpen] = useState(false);
  const [furnitureId, setFurnitureId] = useState("");
  const [parsed, setParsed] = useState<ParsedPart[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: furniture } = useQuery({
    queryKey: ["furniture"],
    queryFn: async () => apiRequest<any[]>("/furniture"),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!furnitureId) throw new Error("Selecione um móvel");
      if (parsed.length === 0) throw new Error("Nenhuma peça para importar");

      const result = await apiRequest<{ count: number }>("/parts/import", {
        method: "POST",
        body: JSON.stringify({
          furniture_id: furnitureId,
          parts: parsed,
          processes: defaultProcesses,
        }),
      });
      return result.count;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["parts"] });
      toast({
        title: `${count} peças importadas!`,
        description: "QR Codes gerados automaticamente.",
      });
      setOpen(false);
      setParsed([]);
      setFileName("");
      setFurnitureId("");
    },
    onError: (e) =>
      toast({
        title: "Erro na importação",
        description: e.message,
        variant: "destructive",
      }),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const result = file.name.endsWith(".xml")
          ? parseXML(text)
          : parseCSV(text);
        if (result.length === 0) {
          setError("Nenhuma peça encontrada no arquivo. Verifique o formato.");
          return;
        }
        setParsed(result);
      } catch {
        setError("Erro ao ler o arquivo. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setParsed([]);
          setFileName("");
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Peças (CSV/XML)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Móvel de destino *</Label>
            <Select value={furnitureId} onValueChange={setFurnitureId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o móvel" />
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

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xml"
              className="hidden"
              onChange={handleFile}
            />
            <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            {fileName ? (
              <p className="text-sm font-medium">
                {fileName} — {parsed.length} peças encontradas
              </p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Clique para selecionar arquivo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: .csv ou .xml
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">
              Formato CSV esperado (cabeçalho):
            </p>
            <code>
              nome, codigo, largura_mm, altura_mm, profundidade_mm, material,
              cor, cor_hex, tipo_acabamento, receita_tinta, borda, peca_mae
            </code>
          </div>

          {parsed.length > 0 && (
            <>
              <div className="rounded-md border overflow-auto max-h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Dimensões</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Mãe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{p.name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {p.code}
                        </TableCell>
                        <TableCell className="text-xs">
                          {[p.width_mm, p.height_mm, p.depth_mm]
                            .filter(Boolean)
                            .join(" × ") || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.material || "—"}
                        </TableCell>
                        <TableCell>
                          {p.finish_color ? (
                            <div className="flex items-center gap-1">
                              <div
                                className="h-4 w-4 rounded border"
                                style={{ backgroundColor: p.finish_color_hex }}
                              />
                              <span className="text-xs">{p.finish_color}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {p.is_mother_part && (
                            <Badge variant="secondary" className="text-xs">
                              Mãe
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                className="w-full"
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending || !furnitureId}
              >
                {importMutation.isPending
                  ? "Importando..."
                  : `Importar ${parsed.length} Peças`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
