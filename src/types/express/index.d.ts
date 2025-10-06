// src/types/express/index.d.ts hoặc src/@types/express/index.d.ts

import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'; // Điều chỉnh đường dẫn cho đúng

// Quan trọng: Sử dụng declare global để mở rộng Express.Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser; // Khai báo rằng thuộc tính 'user' có thể tồn tại và có kiểu AuthenticatedUser
    }
  }
}