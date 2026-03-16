import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../entities/user/ui/AuthContext";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { useToast } from "../../../shared/hooks/use-toast";
import { Play, Square, CheckCircle, AlertTriangle } from "lucide-react";

export type ProcessType =
  | "corte"
  | "lixamento"
  | "pintura"
  | "borda"
  | "montagem"
  | "expedicao";
export type ProcessStatus =
  | "aguardando"
  | "em_execucao"
  | "concluido"
  | "alerta";

const processLabels: Record<ProcessType, string> = {
  corte: "Corte",
  lixamento: "Lixamento",
  pintura: "Pintura",
  borda: "Borda",
  montagem: "Montagem",
  expedicao: "Expedição",
};

const statusColors: Record<ProcessStatus, string> = {
  aguardando: "bg-muted text-muted-foreground",
  em_execucao: "bg-primary/10 text-primary",
  concluido: "bg-green-100 text-green-800",
  alerta: "bg-destructive/10 text-destructive",
};

let mockProcessesLog = [
  {
    id: "proc-1",
    process_type: "corte" as ProcessType,
    sequence_order: 1,
    estimated_time_minutes: 10,
    execution_logs: [],
  },
  {
    id: "proc-2",
    process_type: "lixamento" as ProcessType,
    sequence_order: 2,
    estimated_time_minutes: 15,
    execution_logs: [],
  },
];

const ProcessesPage = () => {
  const [searchParams] = useSearchParams();
  const partId = searchParams.get("part");
  const [timer, setTimer] = useState(0);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: part } = useQuery({
    queryKey: ["part", partId],
    queryFn: async () => {
      if (!partId) return null;
      return {
        id: partId,
        name: "Mock Part",
        finish_color: "Branco",
        finish_color_hex: "#ffffff",
        finish_type: "Laca",
        furniture: { name: "Armário Base", orders: { code: "PED-001" } },
        paint_recipe: undefined as string | undefined,
      };
    },
    enabled: !!partId,
  });

  const { data: processes } = useQuery({
    queryKey: ["processes", partId],
    queryFn: async () => {
      if (!partId) return [];
      return mockProcessesLog;
    },
    enabled: !!partId,
  });

  const startProcess = useMutation({
    mutationFn: async (processId: string) => {
      const process = processes?.find((p) => p.id === processId);
      if (!process || !user) throw new Error("Processo não encontrado");

      const prevProcess = processes?.find(
        (p) => p.sequence_order === process.sequence_order - 1,
      );
      if (prevProcess) {
        const prevDone = prevProcess.execution_logs.some(
          (l) => l.status === "concluido",
        );
        if (!prevDone) {
          throw new Error(
            `Etapa anterior (${processLabels[prevProcess.process_type]}) não foi finalizada!`,
          );
        }
      }

      const logId = Date.now().toString();
      mockProcessesLog = mockProcessesLog.map((p) =>
        p.id === processId
          ? {
              ...p,
              execution_logs: [
                ...p.execution_logs,
                { id: logId, status: "em_execucao" },
              ],
            }
          : p,
      );

      return { id: logId };
    },
    onSuccess: (data) => {
      setActiveLogId(data.id);
      setTimer(0);
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      setTimerInterval(interval);
      qc.invalidateQueries({ queryKey: ["processes", partId] });
      toast({ title: "Processo iniciado!" });
    },
    onError: (e) =>
      toast({
        title: "Bloqueado",
        description: e.message,
        variant: "destructive",
      }),
  });

  const finishProcess = useMutation({
    mutationFn: async () => {
      if (!activeLogId) throw new Error("Nenhum processo ativo");
      mockProcessesLog = mockProcessesLog.map((p) => {
        const hasLog = p.execution_logs.some((l) => l.id === activeLogId);
        if (hasLog) {
          return {
            ...p,
            execution_logs: p.execution_logs.map((l) =>
              l.id === activeLogId
                ? { ...l, status: "concluido", elapsed_seconds: timer }
                : l,
            ),
          };
        }
        return p;
      });
    },
    onSuccess: () => {
      if (timerInterval) clearInterval(timerInterval);
      setActiveLogId(null);
      setTimer(0);
      setTimerInterval(null);
      qc.invalidateQueries({ queryKey: ["processes", partId] });
      qc.invalidateQueries({ queryKey: ["part", partId] });
      toast({ title: "Processo finalizado!" });
    },
  });

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!partId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">
          Escaneie uma peça primeiro no Scanner
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Processos da Peça</h1>
        {part && (
          <p className="text-muted-foreground">
            {part.name} — {part.furniture?.name} — Pedido{" "}
            {part.furniture?.orders?.code}
          </p>
        )}
      </div>

      {part?.finish_color && (
        <Card
          className="border-2"
          style={{ borderColor: part.finish_color_hex || undefined }}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div
              className="h-16 w-16 rounded-xl border-2 flex-shrink-0"
              style={{ backgroundColor: part.finish_color_hex || "#ccc" }}
            />
            <div>
              <p className="text-xl font-bold">{part.finish_color}</p>
              <p className="text-sm text-muted-foreground">
                {part.finish_type}
              </p>
              {(part).paint_recipe && (
                <p className="text-sm mt-1">📋 {(part).paint_recipe}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeLogId && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex flex-col items-center py-8">
            <p className="text-6xl font-mono font-bold text-primary">
              {formatTime(timer)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Em execução...</p>
            <Button
              onClick={() => finishProcess.mutate()}
              className="mt-6 h-14 px-12 text-lg"
              variant="default"
            >
              <Square className="mr-2 h-5 w-5" />
              Finalizar Processo
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {processes?.map((proc) => {
          const logs = proc.execution_logs || [];
          const isDone = logs.some((l) => l.status === "concluido");
          const isRunning = logs.some((l) => l.status === "em_execucao");
          const doneLog = logs.find((l) => l.status === "concluido");

          return (
            <Card key={proc.id} className={isDone ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {proc.sequence_order}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {processLabels[proc.process_type]}
                    </p>
                    {proc.estimated_time_minutes && (
                      <p className="text-xs text-muted-foreground">
                        Est: {proc.estimated_time_minutes}min
                      </p>
                    )}
                    {doneLog && (
                      <p className="text-xs text-green-600">
                        ✅ {formatTime((doneLog).elapsed_seconds || 0)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : isRunning ? (
                    <Badge className={statusColors.em_execucao}>
                      Em Execução
                    </Badge>
                  ) : (
                    <Button
                      size="lg"
                      className="h-12 px-6"
                      onClick={() => startProcess.mutate(proc.id)}
                      disabled={!!activeLogId}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessesPage;
