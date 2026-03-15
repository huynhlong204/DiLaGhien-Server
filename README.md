

# DiLaGhien-Server

## Giới thiệu

**DiLaGhien-Server** là dự án backend phục vụ cho hệ thống website đặt vé và quản lý vận tải hành khách. Hệ thống này có nhiệm vụ xử lý các tác vụ như quản lý thông tin chuyến xe, đặt chỗ, thanh toán, và cung cấp các API hỗ trợ frontend tương tác dễ dàng và hiệu quả.

## Chức năng chính

- **Quản lý thông tin chuyến xe**: Tạo, sửa, xóa, và cập nhật chi tiết các chuyến xe.
- **Đặt vé và thanh toán**: Hỗ trợ đặt vé trực tuyến và xác nhận thanh toán.
- **Quản lý người dùng**: Đăng ký, đăng nhập, và quản lý thông tin tài khoản khách hàng, tài xế, và nhân viên.
- **Thống kê**: Tổng hợp doanh thu và ghi nhận lịch sử giao dịch.
- **Tương tác API**: Cung cấp các endpoint RESTful API để giao tiếp với frontend.

## Các module chính

### **1. `controllers/`**
- **Nhiệm vụ**: Xử lý toàn bộ logic nghiệp vụ.
- **Các controllers tiêu biểu**:
  - **`TripController`**: Quản lý thông tin các chuyến xe (lịch trình, điểm đi, điểm đến, thời gian, số ghế...).
  - **`AuthController`**: Xử lý đăng ký, đăng nhập, và xác thực người dùng.
  - **`BookingController`**: Đặt vé, hủy vé, và quản lý lịch sử giao dịch.
  - **`PaymentController`**: Tích hợp với các cổng thanh toán như Momo, ViettelPay...
  
### **2. `routes/`**
- **Nhiệm vụ**: Định nghĩa các endpoint chính của hệ thống.
- **Ví dụ các route**:
  - `POST /auth/register`: Đăng ký tài khoản.
  - `POST /trips`: Tạo chuyến xe mới.
  - `GET /booking/:id`: Lấy thông tin đặt vé dựa trên ID.
  - `POST /payment/checkout`: Xử lý thanh toán.

### **3. `models/`**
- **Nhiệm vụ**: Định nghĩa cấu trúc dữ liệu của cơ sở dữ liệu (database schema).
- **Các model chính**:
  - **`User`**: Thông tin về người dùng (tên, số điện thoại, loại tài khoản...).
  - **`Trip`**: Thông tin về chuyến xe (thời gian khởi hành, tuyến đường...).
  - **`Booking`**: Lưu trữ chi tiết đặt chỗ (mã vé, ghế ngồi, trạng thái...).
  - **`Payment`**: Ghi nhận thông tin thanh toán đơn hàng.

### **4. `middlewares/`**
- **Nhiệm vụ**:
  - Xác thực người dùng (Authentication Middleware).
  - Phân quyền (Authorization Middleware).
  - Ghi log request.
- **Ví dụ**:
  - Kiểm tra token hợp lệ trước khi truy cập API yêu cầu xác thực.

### **5. `utils/`**
- **Nhiệm vụ**: Hàm tiện ích dùng chung.
- **Ví dụ**:
  - Generate mã vé đặt chỗ (`generateBookingCode`).
  - Tạo JWT Token cho người dùng.
  - Hàm format thời gian hiển thị.

### **6. `services/`**
- **Nhiệm vụ**:
  - Thực hiện logic nghiệp vụ cụ thể tại các tầng thấp hơn controllers.
- **Ví dụ**:
  - Tích hợp API thanh toán từ các bên thứ 3.
  - Tính toán chi phí và doanh thu từ các chuyến đi.

---

## Hướng dẫn triển khai

### **Yêu cầu**

- Node.js phiên bản >= X.
- Database: PostgreSQL hoặc MongoDB (tuỳ vào thiết lập).
- Cần các cổng API bên thứ ba nếu hỗ trợ (cổng thanh toán, SMS).

### **Cài đặt**

1. Clone repo:
   ```sh
   git clone https://github.com/huynhlong204/DiLaGhien-Server.git
   cd DiLaGhien-Server
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Cấu hình file `.env`:
   - Tạo file `.env` theo mẫu `.env.example` và cấu hình các giá trị:
     ```env
     DATABASE_URL=<DATABASE_CONNECTION_STRING>
     PORT=<PORT_NUMBER>
     JWT_SECRET=<YOUR_SECRET_KEY>
     PAYMENT_API_KEY=<PAYMENT_GATEWAY_API_KEY>
     ```

4. Chạy server:
   ```bash
   npm run dev
   ```

### **Triển khai môi trường sản xuất**

- Cần thiết lập hệ thống CI/CD (Continuous Integration/Continuous Deployment) nếu cần.
- Dockerize ứng dụng để dễ dàng deploy.

---

## Cấu trúc thư mục

```
DiLaGhien-Server/
│
├── src/
│   ├── controllers/      # Xử lý logic API
│   ├── middlewares/      # Xử lý request phía middleware
│   ├── models/           # Định nghĩa schema database
│   ├── routes/           # Khai báo API endpoint
│   ├── services/         # Code xử lý tầng nghiệp vụ
│   ├── utils/            # Tiện ích hỗ trợ
│
├── .env.example          # File mẫu biến môi trường
├── package.json          # Quản lý dependencies
├── README.md             # Tài liệu dự án
└── ...
```

---

## Đóng góp

1. **Fork** repository.
2. **Tạo branch mới**:
   ```bash
   git checkout -b feature/<tên-chức-năng>
   ```
3. **Commit thay đổi của bạn**:
   ```bash
   git commit -m "Thêm tính năng <tên-chức-năng>"
   ```
4. **Push lên branch của bạn**:
   ```bash
   git push origin feature/<tên-chức-năng>
   ```
5. Gửi **Pull Request** để xem xét và merge.

---

## License

Dự án được phát hành dưới giấy phép **MIT License**. Xem chi tiết tại file `LICENSE`.

---

