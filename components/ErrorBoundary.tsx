import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in rendering:", error, errorInfo);
  }
  
  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg">
          <h4 className="font-bold mb-2">Rendering Error</h4>
          <p>
            Sorry, there was an error rendering the proof. This can sometimes happen due to invalid mathematical notation (LaTeX) in the AI's response.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}