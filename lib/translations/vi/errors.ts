export const errorsVi = {
  // Budget Error Codes
  BUDGET_ALREADY_EXISTS: "Ngân sách đã tồn tại cho tháng này",
  BUDGET_NOT_FOUND: "Không tìm thấy ngân sách",
  INVALID_BUDGET_AMOUNT: "Số tiền ngân sách không hợp lệ",
  BUDGET_LIMIT_EXCEEDED: "Bạn đã đạt giới hạn số lượng ngân sách",
  INSUFFICIENT_BUDGET: "Ngân sách không đủ cho chi phí này",
  BUDGET_UPDATE_FAILED: "Cập nhật ngân sách thất bại",
  BUDGET_DELETE_FAILED: "Xóa ngân sách thất bại",
  BUDGET_CREATE_FAILED: "Tạo ngân sách thất bại",
  
  // Transaction Error Codes
  TRANSACTION_NOT_FOUND: "Không tìm thấy giao dịch",
  INVALID_TRANSACTION_AMOUNT: "Số tiền giao dịch không hợp lệ",
  TRANSACTION_UPDATE_FAILED: "Cập nhật giao dịch thất bại",
  TRANSACTION_DELETE_FAILED: "Xóa giao dịch thất bại",
  TRANSACTION_CREATE_FAILED: "Tạo giao dịch thất bại",
  
  // General Error Codes
  UNAUTHORIZED: "Bạn không có quyền thực hiện hành động này",
  FORBIDDEN: "Hành động này bị cấm",
  VALIDATION_ERROR: "Vui lòng kiểm tra thông tin và thử lại",
  INTERNAL_SERVER_ERROR: "Đã xảy ra lỗi. Vui lòng thử lại sau",
  BAD_REQUEST: "Yêu cầu không hợp lệ",
  NOT_FOUND: "Không tìm thấy tài nguyên",
  CONFLICT: "Hành động này xung đột với dữ liệu hiện có",
  TOO_MANY_REQUESTS: "Quá nhiều yêu cầu. Vui lòng thử lại sau",
  SERVICE_UNAVAILABLE: "Dịch vụ tạm thời không khả dụng",
  
  // Network Error Codes
  NETWORK_ERROR: "Lỗi mạng. Vui lòng kiểm tra kết nối",
  TIMEOUT_ERROR: "Yêu cầu hết thời gian. Vui lòng thử lại",
  CONNECTION_ERROR: "Không thể kết nối đến máy chủ",
  
  // Auth Error Codes
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
  USER_NOT_FOUND: "Không tìm thấy người dùng",
  EMAIL_ALREADY_EXISTS: "Email đã tồn tại",
  INVALID_TOKEN: "Token không hợp lệ hoặc đã hết hạn",
  SESSION_EXPIRED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại",
  
  // Validation Error Codes
  REQUIRED_FIELD: "Trường này là bắt buộc",
  INVALID_EMAIL: "Định dạng email không hợp lệ",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 6 ký tự",
  INVALID_DATE: "Ngày không hợp lệ",
  INVALID_MONTH: "Tháng không hợp lệ",
  INVALID_YEAR: "Năm không hợp lệ",
  
  // Goal Error Codes
  INVALID_GOAL: "Dữ liệu mục tiêu không hợp lệ",
  GOAL_NOT_FOUND: "Không tìm thấy mục tiêu",
  GOAL_INVALID_TARGET_AMOUNT: "Số tiền mục tiêu không hợp lệ",
  GOAL_INVALID_DUE_DATE: "Ngày đến hạn không hợp lệ",
  GOAL_TITLE_ALREADY_EXISTS: "Mục tiêu với tên này đã tồn tại",
  GOAL_INSUFFICIENT_BALANCE: "Số dư không đủ để rút tiền",
  
  // Default fallback
  UNKNOWN_ERROR: "Đã xảy ra lỗi không mong muốn",
};