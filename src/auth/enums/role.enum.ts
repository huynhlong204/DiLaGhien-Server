 // src/auth/enums/role.enum.ts

/**
 * @enum UserRole
 * @description Định nghĩa các vai trò (roles) người dùng trong ứng dụng.
 * Các vai trò này giúp quản lý quyền truy cập và phân loại người dùng.
 */
export enum UserRole {
    /**
     * @description Vai trò quản trị viên cao nhất, có toàn quyền truy cập và quản lý hệ thống.
     */
    ADMIN = 'admin',
  
    /**
     * @description Vai trò chủ sở hữu công ty/nhà xe.
     */
    OWNER = 'owner', // <-- THÊM VAI TRÒ OWNER nếu bạn dùng trong companyLogin
  
    /**
     * @description Vai trò người dùng thông thường, có quyền truy cập cơ bản.
     */
    USER = 'user',
  
    /**
     * @description Vai trò khách truy cập, thường có quyền hạn rất hạn chế, có thể không cần đăng nhập.
     */
    PASSENGER = 'passenger',
  
    /**
     * @description Vai trò chỉnh sửa nội dung, có quyền tạo, sửa và xóa một số nội dung nhất định.
     */
    EDITOR = 'editor',
  
    /**
     * @description Vai trò kiểm duyệt viên, có quyền duyệt hoặc từ chối nội dung do người dùng khác tạo.
     */
    MODERATOR = 'moderator',

    DRIVER = 'driver'
  }