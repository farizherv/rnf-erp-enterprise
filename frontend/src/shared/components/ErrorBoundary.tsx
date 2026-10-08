import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#fee2e2", color: "#991b1b", zIndex: 9999, position: "fixed", inset: 0, overflow: "auto", fontFamily: "monospace" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>React Application Error</h1>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{this.state.error && this.state.error.toString()}</div>
          <pre style={{ background: "#fecaca", padding: "16px", borderRadius: "8px", overflowX: "auto" }}>
            {this.state.errorInfo?.componentStack || this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px", padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
