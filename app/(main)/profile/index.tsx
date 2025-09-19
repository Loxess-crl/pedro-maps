import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { User } from "@/interfaces/user.interface";
import { cn } from "@/lib/utils";
import { getMe } from "@/services/userService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getMe();
      setUser(res.data);
      console.log("User data:", res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error al cargar los datos del perfil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Fictional function for profile update - you can implement this later
  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    try {
      // TODO: Implement actual update API call
      console.log("Actualizando perfil con:", updatedData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update local state (in real implementation, you'd refetch or update from API response)
      if (user) {
        setUser({ ...user, ...updatedData });
      }

      setIsEditModalVisible(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el perfil. Inténtalo de nuevo."
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: () => {
          // TODO: Implement logout logic
          console.log("Cerrando sesión...");
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (user) {
      setEditFormData({
        name: user.name,
        ln_pat: user.ln_pat,
        ln_mat: user.ln_mat,
        phone: user.phone,
        email: user.email,
      });
      setIsEditModalVisible(true);
    }
  };

  const getUserInitials = (user: User) => {
    return `${user.name.charAt(0)}${user.ln_pat.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return "bg-red-500";
      case "driver":
        return "bg-blue-500";
      case "user":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderLoadingState = () => (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <LinearGradient
        colors={["#2873b4", "#7bd2e6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-8 px-5"
      >
        <SafeAreaView>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-1">Perfil</Text>
              <Text className="text-white/80 text-base">
                Información personal
              </Text>
            </View>
            <View className="bg-white/20 rounded-2xl p-3">
              <MaterialIcons name="person" size={32} color="white" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1 -mt-4">
        <View className="bg-white rounded-t-3xl pt-6 min-h-full px-5">
          {/* Avatar skeleton */}
          <View className="items-center mb-6">
            <Skeleton className="w-24 h-24 rounded-full bg-slate-200 mb-4" />
            <Skeleton className="w-48 h-6 bg-slate-200 rounded mb-2" />
            <Skeleton className="w-32 h-4 bg-slate-200 rounded" />
          </View>

          {/* Cards skeleton */}
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="mb-4 border-0 shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="w-full h-16 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-8 px-5"
      >
        <SafeAreaView>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-1">Perfil</Text>
              <Text className="text-white/80 text-base">
                Información personal
              </Text>
            </View>
            <View className="bg-white/20 rounded-2xl p-3">
              <MaterialIcons name="person" size={32} color="white" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View className="flex-1 bg-white rounded-t-3xl -mt-4 items-center justify-center px-8">
        <View className="bg-red-50 rounded-3xl p-8 mb-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <MaterialIcons name="error-outline" size={64} color="#ef4444" />
          </View>
        </View>

        <Text className="text-slate-900 text-2xl font-bold text-center mb-3">
          Error al cargar perfil
        </Text>
        <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-xs opacity-80">
          {error ||
            "No se pudo cargar la información del perfil. Verifica tu conexión."}
        </Text>

        <TouchableOpacity
          onPress={fetchUser}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl px-8 py-4 shadow-lg"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Reintentar
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
            <Text className="text-blue-600 text-base font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Editar Perfil</Text>
          <TouchableOpacity
            onPress={() => handleUpdateProfile(editFormData)}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            <View>
              <Label className="text-gray-700 font-medium mb-2">Nombre</Label>
              <Input
                value={editFormData.name}
                onChangeText={(text) =>
                  setEditFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Ingresa tu nombre"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View>
              <Label className="text-gray-700 font-medium mb-2">
                Apellido Paterno
              </Label>
              <Input
                value={editFormData.ln_pat}
                onChangeText={(text) =>
                  setEditFormData((prev) => ({ ...prev, ln_pat: text }))
                }
                placeholder="Ingresa tu apellido paterno"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View>
              <Label className="text-gray-700 font-medium mb-2">
                Apellido Materno
              </Label>
              <Input
                value={editFormData.ln_mat}
                onChangeText={(text) =>
                  setEditFormData((prev) => ({ ...prev, ln_mat: text }))
                }
                placeholder="Ingresa tu apellido materno"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View>
              <Label className="text-gray-700 font-medium mb-2">Teléfono</Label>
              <Input
                value={editFormData.phone}
                onChangeText={(text) =>
                  setEditFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Ingresa tu teléfono"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View>
              <Label className="text-gray-700 font-medium mb-2">Email</Label>
              <Input
                value={editFormData.email}
                onChangeText={(text) =>
                  setEditFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Ingresa tu email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (error || !user) {
    return renderErrorState();
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header con gradiente */}
      <LinearGradient
        colors={["#2873b4", "#7bd2e6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-8 px-5"
      >
        <SafeAreaView>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-1">Perfil</Text>
              <Text className="text-white/80 text-base">
                Información personal
              </Text>
            </View>
            <TouchableOpacity
              onPress={openEditModal}
              className="bg-white/20 rounded-2xl p-3"
            >
              <MaterialIcons name="edit" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1 -mt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchUser}
            colors={["#6366f1"]}
            tintColor="#6366f1"
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="bg-white rounded-t-3xl pt-6 min-h-full">
          {/* Profile Avatar & Basic Info */}
          <View className="items-center mb-8 px-5">
            <View className="mb-4">
              <View className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center shadow-lg">
                <Text className="text-white text-2xl font-bold">
                  {getUserInitials(user)}
                </Text>
              </View>
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center">
              {user.name} {user.ln_pat} {user.ln_mat}
            </Text>
            <Text className="text-gray-600 text-base mt-1">{user.email}</Text>

            {/* Role Badges */}
            <View className="flex-row flex-wrap gap-2 mt-3">
              {user.roles.map((role) => (
                <Badge
                  key={role.id}
                  className={cn(
                    "px-3 py-1 rounded-full",
                    getRoleBadgeColor(role.name)
                  )}
                >
                  <Text className="text-white text-xs font-semibold">
                    {role.name.toUpperCase()}
                  </Text>
                </Badge>
              ))}
            </View>
          </View>

          {/* User Information Cards */}
          <View className="px-5 space-y-4">
            {/* Personal Information */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-full p-2 mr-3">
                    <MaterialIcons name="person" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Información Personal
                  </Text>
                </View>
              </CardHeader>
              <CardContent className="pt-0">
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="badge" size={16} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-2 w-20">ID:</Text>
                    <Text className="text-gray-900 font-medium flex-1">
                      #{user.id}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="person-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text className="text-gray-500 text-sm ml-2 w-20">
                      Nombre:
                    </Text>
                    <Text className="text-gray-900 font-medium flex-1">
                      {user.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="family-restroom"
                      size={16}
                      color="#6b7280"
                    />
                    <Text className="text-gray-500 text-sm ml-2 w-20">
                      Apellidos:
                    </Text>
                    <Text className="text-gray-900 font-medium flex-1">
                      {user.ln_pat} {user.ln_mat}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <View className="flex-row items-center">
                  <View className="bg-green-100 rounded-full p-2 mr-3">
                    <MaterialIcons
                      name="contact-mail"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Información de Contacto
                  </Text>
                </View>
              </CardHeader>
              <CardContent className="pt-0">
                <View className="space-y-3">
                  <TouchableOpacity className="flex-row items-center">
                    <MaterialIcons name="email" size={16} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-2 w-20">
                      Email:
                    </Text>
                    <Text className="text-blue-600 font-medium flex-1 underline">
                      {user.email}
                    </Text>
                  </TouchableOpacity>

                  {user.phone && (
                    <TouchableOpacity className="flex-row items-center">
                      <MaterialIcons name="phone" size={16} color="#6b7280" />
                      <Text className="text-gray-500 text-sm ml-2 w-20">
                        Teléfono:
                      </Text>
                      <Text className="text-blue-600 font-medium flex-1 underline">
                        {user.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!user.phone && (
                    <View className="flex-row items-center">
                      <MaterialIcons name="phone" size={16} color="#6b7280" />
                      <Text className="text-gray-500 text-sm ml-2 w-20">
                        Teléfono:
                      </Text>
                      <Text className="text-gray-400 font-medium flex-1 italic">
                        No registrado
                      </Text>
                    </View>
                  )}
                </View>
              </CardContent>
            </Card>

            {/* Roles and Permissions */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <View className="flex-row items-center">
                  <View className="bg-purple-100 rounded-full p-2 mr-3">
                    <MaterialIcons name="security" size={20} color="#8b5cf6" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Roles y Permisos
                  </Text>
                </View>
              </CardHeader>
              <CardContent className="pt-0">
                <View className="space-y-4">
                  {user.roles.map((role) => (
                    <View
                      key={role.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-900 font-semibold">
                          {role.name}
                        </Text>
                        <Badge
                          className={cn(
                            "px-2 py-1 rounded",
                            getRoleBadgeColor(role.name)
                          )}
                        >
                          <Text className="text-white text-xs">
                            {role.permissions.length} permisos
                          </Text>
                        </Badge>
                      </View>

                      {role.permissions.length > 0 && (
                        <View className="flex-row flex-wrap gap-1">
                          {role.permissions
                            .slice(0, 3)
                            .map((permission, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="px-2 py-1"
                              >
                                <Text className="text-xs text-gray-600">
                                  {permission}
                                </Text>
                              </Badge>
                            ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="px-2 py-1">
                              <Text className="text-xs text-gray-600">
                                +{role.permissions.length - 3} más
                              </Text>
                            </Badge>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>

            {/* Actions */}
            <View className="gap-2 mt-6 mb-8">
              <TouchableOpacity
                onPress={openEditModal}
                className="border-2 border-blue-500 bg-primary rounded-2xl p-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name="edit" size={20} color="#ffffff" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Editar Perfil
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="border-2 border-red-200 bg-red-50 rounded-2xl p-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name="logout" size={20} color="#ef4444" />
                  <Text className="text-red-600 font-semibold text-base ml-2">
                    Cerrar Sesión
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Extra padding for tab navigation */}
            <View className="h-20" />
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      {renderEditModal()}
    </View>
  );
};

export default ProfilePage;
