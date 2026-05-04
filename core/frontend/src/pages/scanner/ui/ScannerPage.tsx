import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { useToast } from '../../../shared/hooks/use-toast';
import { Camera, Keyboard, QrCode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { apiRequest } from '../../../shared/api/client';

export type ProcessType =
  | 'corte'
  | 'lixamento'
  | 'pintura'
  | 'borda'
  | 'montagem'
  | 'expedicao';

const processLabels: Record<ProcessType, string> = {
  corte: 'Corte',
  lixamento: 'Lixamento',
  pintura: 'Pintura',
  borda: 'Borda',
  montagem: 'Montagem',
  expedicao: 'Expedição',
};

export interface ScannedPart {
  id: string;
  name: string;
  code: string;
  is_mother_part: boolean;
  current_process?: ProcessType;
  furniture?: {
    name: string;
    orders?: { code: string; clients?: { name: string } };
  };
  finish_color?: string;
  finish_color_hex?: string;
  finish_type?: string;
  paint_recipe?: string;
}

const ScannerPage = () => {
  const [mode, setMode] = useState<'camera' | 'keyboard'>('keyboard');
  const [manualCode, setManualCode] = useState('');
  const [scannedPart, setScannedPart] = useState<ScannedPart | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const lookupPart = useCallback(
    async (rawData: string) => {
      let code = rawData;
      try {
        const parsed = JSON.parse(rawData);
        code = parsed.code || rawData;
      } catch {
        // keep rawData as code
      }

      try {
        const part = await apiRequest<ScannedPart>(
          `/parts/by-code/${encodeURIComponent(code)}`,
        );
        setScannedPart(part);
      } catch {
        toast({
          title: 'Peça não encontrada',
          description: `Código: ${code}`,
          variant: 'destructive',
        });
        setScannedPart(null);
      }
    },
    [toast],
  );

  const startCamera = async () => {
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          scanner.stop().then(() => {
            setScanning(false);
            lookupPart(text);
          });
        },
        () => {},
      );
    } catch (err: unknown) {
      toast({
        title: 'Erro na câmera',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      setScanning(false);
    }
  };

  const stopCamera = () => {
    scannerRef.current
      ?.stop()
      .then(() => setScanning(false))
      .catch(() => setScanning(false));
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      lookupPart(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Scanner de Peças</h1>
        <p className="text-muted-foreground">
          Escaneie o QR Code ou digite o código
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={mode === 'keyboard' ? 'default' : 'outline'}
          onClick={() => {
            setMode('keyboard');
            stopCamera();
          }}
        >
          <Keyboard className="mr-2 h-4 w-4" />
          Teclado / Scanner USB
        </Button>
        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => {
            setMode('camera');
          }}
        >
          <Camera className="mr-2 h-4 w-4" />
          Câmera
        </Button>
      </div>

      {mode === 'keyboard' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Digitar ou Bipar Código</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Código da peça..."
                autoFocus
                className="text-lg h-14"
              />
              <Button type="submit" size="lg" className="h-14 px-8">
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Câmera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="qr-reader" className="w-full" />
            {!scanning ? (
              <Button onClick={startCamera} className="w-full h-14 text-lg">
                <Camera className="mr-2 h-5 w-5" />
                Iniciar Câmera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="w-full">
                Parar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {scannedPart && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {scannedPart.name}
              </CardTitle>
              {scannedPart.is_mother_part && <Badge>Peça-Mãe</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Código</p>
                <p className="font-mono font-bold">{scannedPart.code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Móvel</p>
                <p className="font-medium">{scannedPart.furniture?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pedido</p>
                <p className="font-mono">
                  {scannedPart.furniture?.orders?.code}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p>{scannedPart.furniture?.orders?.clients?.name}</p>
              </div>
            </div>

            {scannedPart.finish_color && (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div
                  className="h-12 w-12 rounded-lg border-2"
                  style={{
                    backgroundColor: scannedPart.finish_color_hex || '#ccc',
                  }}
                />
                <div>
                  <p className="font-semibold">{scannedPart.finish_color}</p>
                  <p className="text-xs text-muted-foreground">
                    {scannedPart.finish_type}
                  </p>
                </div>
              </div>
            )}

            {scannedPart.paint_recipe && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground mb-1">
                  Receita da Tinta
                </p>
                <p className="font-medium">{scannedPart.paint_recipe}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Etapa Atual</p>
              <Badge variant="default" className="text-base px-4 py-1">
                {scannedPart.current_process
                  ? processLabels[scannedPart.current_process as ProcessType]
                  : '—'}
              </Badge>
            </div>

            <Button
              className="w-full h-14 text-lg"
              onClick={() => navigate(`/processos?part=${scannedPart.id}`)}
            >
              Ir para Processo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScannerPage;
