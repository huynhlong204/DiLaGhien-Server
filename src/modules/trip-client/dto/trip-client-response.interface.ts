// @/src/modules/trip-client/dto/trip-client-response.interface.ts

// Định nghĩa kiểu dữ liệu cho thông tin Khuyến mãi
export interface PromotionInfo {
  id: number;
  code: string;
  description: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_value: number;
  company_id: number | null;
}

// Định nghĩa kiểu dữ liệu cơ bản cho Location
interface SimpleLocation {
  name: string;
}

// Kiểu dữ liệu chính mà Frontend (SearchResultsClient) mong đợi
export interface TripClientResponse {
  id: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  fromLocation: SimpleLocation;
  toLocation: SimpleLocation;
  companyName: string;
  companyLogoUrl: string;
  companyId: number;
  busType: string;
  amenities: any[];
  companyAverageRating: number | null;
  companyTotalReviews: number;
  seatsAvailable: number;
  is_good_price: boolean;
  // Sử dụng kiểu đã định nghĩa ở trên
  promotion_info: PromotionInfo | null;
}
