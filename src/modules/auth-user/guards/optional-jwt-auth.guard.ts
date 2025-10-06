// src/auth-user/guards/optional-jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt-cus') { // Vẫn dùng strategy 'jwt-customer'

    // Ghi đè phương thức handleRequest
    handleRequest(err, user, info, context, status) {
        // Phương thức này cho phép chúng ta tùy chỉnh hành vi khi xác thực.
        // Thay vì ném lỗi khi không có user (token không hợp lệ hoặc không có),
        // chúng ta chỉ đơn giản trả về đối tượng `user` (có thể là null hoặc undefined).
        // Controller sẽ nhận được `req.user` là thông tin người dùng nếu đăng nhập,
        // hoặc `undefined` nếu là khách.
        return user;
    }
}