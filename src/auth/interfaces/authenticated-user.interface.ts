// src/auth/interfaces/authenticated-user.interface.ts
export interface AuthenticatedUser {
  user_id: number;
  email: string;
  role_id: number;
  company_id: number | null; // Có thể là null nếu không thuộc công ty nào
  role: { name: string }; // Tên vai trò
}