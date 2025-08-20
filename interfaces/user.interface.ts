export interface User {
  id: number;
  name: string;
  ln_pat: string;
  ln_mat: string;
  phone?: string;
  email: string;
  password: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}
export interface UserFormProps {
  user?: User;
  onSave: (user: Partial<Omit<User, "id">>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export type UserPayload = Omit<User, "password">;
