import React from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export const useToast = () => {
  const success = (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    });
  };

  const error = (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      duration: 7000,
    });
  };

  const warning = (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
    });
  };

  const info = (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: <Info className="h-4 w-4 text-blue-500" />,
    });
  };

  return {
    success,
    error,
    warning,
    info,
  };
};
