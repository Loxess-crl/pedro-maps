"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { setErrorHandler } from "@/services/axiosClient";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

export const ErrorHandler = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setErrorHandler(() => setIsModalOpen(true));
  }, []);

  const handleLogout = () => {
    setIsModalOpen(false);
    logout();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log("ErrorHandler mounted", isModalOpen);
  }, [isModalOpen]);

  return (
    <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <FontAwesome
              name="exclamation-triangle"
              className="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sesión Expirada
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400 py-4">
          Tu sesión ha expirado por motivos de seguridad. Por favor, inicia
          sesión nuevamente para continuar.
        </AlertDialogDescription>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center gap-2">
          <AlertDialogCancel
            onPress={handleCancel}
            className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FontAwesome name="times" className="h-4 w-4" />
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onPress={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <FontAwesome name="lock" className="h-4 w-4" />
            Iniciar Sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
