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
import { View } from "react-native";
import { Text } from "./ui/text";

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
      <AlertDialogContent className="w-full max-w-sm mx-4">
        <AlertDialogHeader className="items-center space-y-4">
          <View className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <FontAwesome
              name="exclamation-triangle"
              size={24}
              color="#dc2626"
              className="dark:text-red-400"
            />
          </View>

          <AlertDialogTitle className="text-center">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sesión Expirada
            </Text>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-center py-4">
          <Text className="text-gray-600 dark:text-gray-400">
            Tu sesión ha expirado por motivos de seguridad. Por favor, inicia
            sesión nuevamente para continuar.
          </Text>
        </AlertDialogDescription>

        <AlertDialogFooter className="flex-col space-y-2 w-full">
          <AlertDialogAction
            onPress={handleLogout}
            className="w-full bg-red-600 rounded-md px-4"
          >
            <View className="flex-row items-center justify-center px-4 space-x-2">
              <FontAwesome name="lock" size={16} color="white" />
              <Text className="text-white font-medium ml-2">
                Iniciar Sesión
              </Text>
            </View>
          </AlertDialogAction>

          <AlertDialogCancel
            onPress={handleCancel}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-md px-4"
          >
            <View className="flex-row items-center justify-center px-4 space-x-2">
              <FontAwesome name="times" size={16} color="#6b7280" />
              <Text className="text-gray-700 dark:text-gray-300 font-medium ml-2">
                Cancelar
              </Text>
            </View>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
