import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Download, Smartphone, CheckCircle } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Instalar App</h1>
        <p className="text-muted-foreground">
          Instale o Rastroom no seu celular
        </p>
      </div>

      {isInstalled ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <p className="text-lg font-semibold">App já instalado!</p>
            <p className="text-muted-foreground">
              O Rastroom está na sua tela inicial.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {deferredPrompt ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Instalação Rápida
                </CardTitle>
                <CardDescription>
                  Clique para adicionar à tela inicial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full" onClick={handleInstall}>
                  <Download className="mr-2 h-5 w-5" />
                  Instalar Rastroom
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Como Instalar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Android (Chrome):</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-1">
                    <li>Toque no menu (⋮) do navegador</li>
                    <li>Selecione "Adicionar à tela inicial"</li>
                    <li>Confirme a instalação</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium">iPhone (Safari):</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-1">
                    <li>Toque no ícone de compartilhar (⎙)</li>
                    <li>Selecione "Adicionar à Tela de Início"</li>
                    <li>Confirme a instalação</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default InstallPage;
