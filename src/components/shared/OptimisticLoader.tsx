import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimisticLoaderProps {
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

export function OptimisticLoader({
  isLoading,
  isSuccess = false,
  isError = false,
  successMessage = 'Opération réussie',
  errorMessage = 'Une erreur est survenue',
  className,
}: OptimisticLoaderProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-primary', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">En cours...</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={cn('flex items-center gap-2 text-green-600', className)}>
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">{successMessage}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex items-center gap-2 text-destructive', className)}>
        <XCircle className="h-4 w-4" />
        <span className="text-sm">{errorMessage}</span>
      </div>
    );
  }

  return null;
}

// Composant pour afficher l'état d'une mutation
export function MutationStatus({ 
  mutation, 
  successMessage, 
  errorMessage,
  className 
}: {
  mutation: any;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}) {
  return (
    <OptimisticLoader
      isLoading={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      successMessage={successMessage}
      errorMessage={errorMessage || mutation.error?.message}
      className={className}
    />
  );
}