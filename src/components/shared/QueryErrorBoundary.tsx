import React, { Component, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Query Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Erreur de chargement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Une erreur inattendue s'est produite lors du chargement des données.
              </p>
              {this.state.error && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Détails techniques</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger la page
              </Button>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

// Composant wrapper qui combine QueryErrorResetBoundary et ErrorBoundary
export function QueryErrorBoundary({ children, fallback }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={
            fallback || (
              <Card className="max-w-md mx-auto mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Erreur de requête
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Une erreur s'est produite lors de la récupération des données.
                  </p>
                  <Button onClick={reset} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            )
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}