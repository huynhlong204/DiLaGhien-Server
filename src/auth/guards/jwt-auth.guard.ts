import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard bảo vệ các routes yêu cầu JWT authentication
 * Kế thừa từ AuthGuard của Passport với strategy 'jwt'
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    /**
     * Xử lý kết quả của quá trình xác thực JWT
     * @param err Error object nếu có lỗi xảy ra trong quá trình xác thực
     * @param user Object chứa thông tin user sau khi decode từ JWT token
     * @param info Object chứa thông tin bổ sung về quá trình xác thực
     * @returns Object chứa thông tin user nếu xác thực thành công
     * @throws UnauthorizedException nếu xác thực thất bại hoặc không có user
     */
    handleRequest(err: any, user: any, info: any) {
        // Kiểm tra nếu có lỗi hoặc không tìm thấy user
        if (err || !user) {
            throw err || new UnauthorizedException('Không được phép truy cập. Token không hợp lệ hoặc không tồn tại.');
        }
        return user;
    }
}