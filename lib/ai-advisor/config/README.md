# Date Mock Config

## Cách sử dụng để test các scenario khác nhau

Mở file `date-mock.ts` và thay đổi giá trị `MOCK_DATE_SCENARIO`:

### Test đầu tháng (Start of Month):
```typescript
export const MOCK_DATE_SCENARIO: DateScenario = 'start_of_month';
```

### Test cuối tháng (End of Month):
```typescript
export const MOCK_DATE_SCENARIO: DateScenario = 'end_of_month';
```

### Test giữa tháng (Normal Day):
```typescript
export const MOCK_DATE_SCENARIO: DateScenario = 'normal_day';
```

### Về lại normal (Real Date):
```typescript
export const MOCK_DATE_SCENARIO: DateScenario = null;
```

## Kết quả mong đợi:

- **Start of Month**: AI sẽ show Goal Dashboard + Pay Yourself First
- **End of Month**: AI sẽ show Budgeting Dashboard + Monthly Review options  
- **Normal Day**: AI sẽ show Budgeting Dashboard + Daily tracking options

## Lưu ý:
- Đây chỉ là solution tạm thời cho testing
- Nhớ set về `null` sau khi test xong
- Restart development server sau khi thay đổi config 