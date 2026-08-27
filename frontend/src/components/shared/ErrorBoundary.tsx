import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
          <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6 max-w-md">
            We apologize, but there was an unexpected error. The system has automatically logged this issue.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Application
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Return Home
            </Button>
          </div>
          
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 text-left bg-slate-900 text-slate-300 p-4 rounded-lg w-full max-w-3xl overflow-auto text-xs font-mono">
              <p className="font-bold text-red-400 mb-2">{this.state.error.toString()}</p>
              <pre>{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
