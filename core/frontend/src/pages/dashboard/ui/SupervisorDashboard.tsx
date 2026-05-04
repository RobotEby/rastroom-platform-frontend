import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

const COLORS = [
  "hsl(220,70%,45%)",
  "hsl(35,95%,55%)",
  "hsl(145,63%,42%)",
  "hsl(0,72%,51%)",
  "hsl(270,60%,50%)",
  "hsl(180,60%,40%)",
];

const SupervisorDashboard = () => {
  const { data: partsByProcess } = useQuery({
    queryKey: ["parts-by-process"],
    queryFn: async () => apiRequest<Array<{ name: string; value: number }>>("/dashboard/parts-by-process"),
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["recent-logs"],
    queryFn: async () => apiRequest<any[]>("/dashboard/recent-logs"),
  });

  const { data: avgTimes } = useQuery({
    queryKey: ["avg-times"],
    queryFn: async () => apiRequest<Array<{ name: string; media: number }>>("/dashboard/avg-times"),
  });

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => apiRequest<any[]>("/dashboard/alerts"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard do Supervisor</h1>
        <p className="text-muted-foreground">
          Métricas, gargalos e rastreabilidade
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peças por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            {partsByProcess && partsByProcess.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={partsByProcess}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {partsByProcess.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Sem dados
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Tempo Médio por Processo (min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgTimes && avgTimes.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={avgTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="media"
                    fill="hsl(220,70%,45%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Sem dados
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {alerts && alerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              ⚠️ Alertas de Gargalo ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 rounded bg-destructive/5"
              >
                <div>
                  <p className="font-medium">
                    {(alert).parts?.name} ({(alert).parts?.code})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {
                      processLabels[
                        (alert).processes?.process_type as ProcessType
                      ]
                    }{" "}
                    — excedeu tempo estimado
                  </p>
                </div>
                <Badge variant="destructive">Atrasado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimas Atividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentLogs?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Sem atividades
            </p>
          ) : (
            recentLogs?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">
                    {(log).parts?.name} — {(log).parts?.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {
                      processLabels[
                        (log).processes?.process_type as ProcessType
                      ]
                    }
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      log.status === "concluido" ? "default" : "secondary"
                    }
                  >
                    {log.status === "concluido"
                      ? "Concluído"
                      : log.status === "em_execucao"
                        ? "Executando"
                        : log.status}
                  </Badge>
                  {log.elapsed_seconds && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(log.elapsed_seconds / 60)}min
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorDashboard;
