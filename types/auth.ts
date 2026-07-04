export type RoleName = "BUYER" | "SELLER" | "DRIVER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  activeRole: RoleName | null;
  roles: RoleName[];
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};