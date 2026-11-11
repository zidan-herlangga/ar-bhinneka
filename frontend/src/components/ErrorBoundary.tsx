import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16">
          <Card className="text-center">
            <div className="text-5xl" aria-hidden>🛠️</div>
            <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">Terjadi kesalahan</h1>
            <p className="mt-2 text-sm text-gray-600">
              Aplikasi mengalami masalah. Coba muat ulang halaman.
            </p>
            <div className="mt-5 flex justify-center">
              <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
