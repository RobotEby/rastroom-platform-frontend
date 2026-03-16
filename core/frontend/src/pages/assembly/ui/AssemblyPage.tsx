import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Badge } from "../../../shared/ui/badge";
import { useToast } from "../../../shared/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  PackageCheck,
  ScanLine,
} from "lucide-react";

// Tipagem local substituindo as definições do banco
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

// --- Mocks para simular o banco de dados ---
const mockOrders = [
  {
    id: "ord-1",
    code: "PED-001",
    status: "em_producao",
    clients: { name: "Cliente VIP" },
  },
];

const mockParts = [
  {
    id: "m1",
    code: "M-100",
    qr_code_data: "M-100",
    name: "Kit Armário Base",
    is_mother_part: true,
    current_process: "expedicao" as ProcessType,
    furniture: {
      order_id: "ord-1",
      name: "Armário Base",
      orders: mockOrders[0],
    },
    // Simulando que a peça-mãe já concluiu seus processos
    processes: [{ execution_logs: [{ status: "concluido" }] }],
  },
  {
    id: "c1",
    parent_part_id: "m1",
    code: "P-101",
    name: "Lateral Esquerda",
    finish_color_hex: "#cccccc",
    current_process: "borda" as ProcessType,
    // Simulando peça-filha concluída
    processes: [{ execution_logs: [{ status: "concluido" }] }],
  },
  {
    id: "c2",
    parent_part_id: "m1",
    code: "P-102",
    name: "Lateral Direita",
    finish_color_hex: "#cccccc",
    current_process: "pintura" as ProcessType,
    // Simulando peça-filha pendente
    processes: [{ execution_logs: [{ status: "em_execucao" }] }],
  },
];
// -------------------------------------------

interface IPart {
  id: string | number;
  name: string;
  code?: string;
  is_mother_part?: boolean;
  parent_part_id?: string;
  qr_code_data?: string;
  current_process?: ProcessType;
  finish_color_hex?: string;
  furniture?: {
    order_id?: string;
    name?: string;
    orders?: { code?: string; clients?: { name?: string } };
  };
  processes?: Array<{ execution_logs?: Array<{ status: string }> }>;
}

const AssemblyPage = () => {
  const [searchCode, setSearchCode] = useState("");
  const [motherPart, setMotherPart] = useState<IPart | null>(null);
  const [childParts, setChildParts] = useState<IPart[]>([]);
  const { toast } = useToast();

  const lookupKit = async () => {
    if (!searchCode.trim()) return;

    let code = searchCode.trim();
    try {
      const parsed = JSON.parse(code);
      code = parsed.code || code;
    } catch {
      // keep code as-is
    }

    // Simulando delay de rede
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Busca da peça-mãe no Mock
    const mother = mockParts.find(
      (p) =>
        p.is_mother_part &&
        (p.code === code || p.qr_code_data === searchCode.trim()),
    );

    if (!mother) {
      toast({ title: "Peça-Mãe não encontrada", variant: "destructive" });
      setMotherPart(null);
      setChildParts([]);
      return;
    }

    setMotherPart(mother);

    // Busca das peças-filhas no Mock
    const children = mockParts
      .filter((p) => p.parent_part_id === mother.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    setChildParts(children);
    setSearchCode("");
  };

  const isPartReady = (part: IPart | null) => {
    if (!part) return false;
    const processes = part.processes || [];
    if (processes.length === 0) return false;
    return processes.every((proc) => {
      const logs = proc.execution_logs || [];
      return logs.some((l) => l.status === "concluido");
    });
  };

  const allReady =
    childParts.length > 0 &&
    childParts.every(isPartReady) &&
    isPartReady(motherPart);

  const finalizeKit = useMutation({
    mutationFn: async () => {
      if (!allReady) throw new Error("Nem todas as peças estão prontas!");

      // Simulando delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      const orderId = motherPart?.furniture?.order_id;
      // Atualizando o status do pedido no Mock
      if (orderId) {
        const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
        if (orderIndex > -1) {
          mockOrders[orderIndex].status = "montagem";
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Kit validado com sucesso!",
        description:
          "Todas as peças conferidas e status do pedido atualizado para Montagem.",
      });
    },
    onError: (e) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Montagem / Conferência de Kit</h1>
        <p className="text-muted-foreground">
          Escaneie a Peça-Mãe para conferir o kit
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookupKit();
            }}
            className="flex gap-2"
          >
            <Input
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Código da Peça-Mãe ou QR (ex: M-100)..."
              className="text-lg h-14"
              autoFocus
            />
            <Button type="submit" size="lg" className="h-14 px-8">
              <ScanLine className="mr-2 h-5 w-5" />
              Conferir
            </Button>
          </form>
        </CardContent>
      </Card>

      {motherPart && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5" />
                Kit: {motherPart.furniture?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Pedido:</span>{" "}
                {motherPart.furniture?.orders?.code}
              </p>
              <p>
                <span className="text-muted-foreground">Cliente:</span>{" "}
                {motherPart.furniture?.orders?.clients?.name}
              </p>
              <p>
                <span className="text-muted-foreground">Peça-Mãe:</span>{" "}
                {motherPart.name} ({motherPart.code})
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Checklist de Peças ({childParts.length + 1} total)
            </h2>

            {/* Mother part */}
            <Card
              className={
                isPartReady(motherPart)
                  ? "border-green-500"
                  : "border-destructive"
              }
            >
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {motherPart.name} <Badge variant="secondary">Mãe</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {motherPart.code}
                  </p>
                </div>
                {isPartReady(motherPart) ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-muted-foreground">
                      {motherPart.current_process
                        ? processLabels[
                            motherPart.current_process as ProcessType
                          ]
                        : "Pendente"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Child parts */}
            {childParts.map((child) => (
              <Card
                key={child.id}
                className={
                  isPartReady(child) ? "border-green-500" : "border-destructive"
                }
              >
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {child.finish_color_hex && (
                      <div
                        className="h-8 w-8 rounded border"
                        style={{ backgroundColor: child.finish_color_hex }}
                      />
                    )}
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {child.code}
                      </p>
                    </div>
                  </div>
                  {isPartReady(child) ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm text-destructive">
                        {child.current_process
                          ? processLabels[child.current_process as ProcessType]
                          : "Pendente"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            className="w-full h-14 text-lg"
            onClick={() => finalizeKit.mutate()}
            disabled={!allReady || finalizeKit.isPending}
          >
            {finalizeKit.isPending
              ? "Validando..."
              : allReady
                ? "✅ Validar Kit Completo"
                : "⛔ Kit Incompleto — Peças Pendentes"}
          </Button>
        </>
      )}
    </div>
  );
};

export default AssemblyPage;
