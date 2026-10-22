# Shop Eser — Server-side Guide (Next.js + Supabase)

> **Dành cho AI agents:** Quy tắc cho mọi code chạy phía server: truy cập database, auth admin, tạo đơn, tồn kho, nhập hàng. Đọc cùng [`AGENTS.md`](../../AGENTS.md) và [`SHOP_ESER_STACK.md`](../../SHOP_ESER_STACK.md). Nếu repository thật khác mô tả ở đây, kiểm tra code/config thực tế và cập nhật tài liệu thay vì giả định.

Shop Eser **không có backend riêng** (không FastAPI, Celery, RabbitMQ, Redis). Logic server nằm trong cùng app Next.js (modular monolith) và dữ liệu nằm ở Supabase (PostgreSQL, Auth, Storage).

## 1. Nơi đặt logic server

Chọn theo thứ tự ưu tiên:

1. **Server Component** — đọc dữ liệu cho storefront/admin.
2. **Server Action** — thao tác ghi gắn với form (thêm giỏ, tạo đơn, lưu sản phẩm).
3. **Route Handler (`app/api/...`)** — chỉ khi cần endpoint HTTP thật (webhook, upload, export).
4. **Hàm SQL/RPC trong Supabase** — khi thao tác phải nguyên tử (tạo đơn + trừ tồn, xác nhận phiếu nhập).

```
lib/
├── supabase/        # server.ts, client.ts, middleware helper
├── validations/     # Zod schema dùng chung client/server
├── money.ts         # Tính và format VND (số nguyên)
├── orders/          # Logic đơn hàng phía server
└── inventory/       # Parser nhập hàng, logic phiếu nhập
supabase/
├── migrations/      # SQL có version, luôn commit
└── seed.sql         # Dữ liệu demo, đánh dấu rõ là demo
```

Tách theo lớp: **UI/Action → hàm nghiệp vụ trong `lib/` → truy cập Supabase**. Action và route handler chỉ xác thực, validate, gọi hàm nghiệp vụ, trả kết quả; không nhồi logic tính tiền hay tồn kho vào component.

## 2. Supabase client

- Có hai client: **browser client** (publishable key, chịu RLS) và **server client** (đọc session từ cookie). Dùng `@supabase/ssr` đúng theo tài liệu hiện hành; kiểm tra tài liệu chính thức trước khi viết helper vì API thay đổi theo phiên bản.
- `SUPABASE_SERVICE_ROLE_KEY` **chỉ ở server**, không prefix `NEXT_PUBLIC_`, không import vào file có thể lọt vào bundle client, không ghi log. Dùng service role chỉ khi thật sự cần (ví dụ webhook không có session) và giới hạn ở một module nhỏ, dễ kiểm tra.
- Không tạo client mới trong vòng lặp hoặc mỗi lần render lại; dùng helper chung.

## 3. Xác thực và phân quyền admin

- Admin đăng nhập bằng **Supabase Auth**. Không tự xây password/session.
- **Mọi** Server Action, route handler và trang `/admin/*` phải xác minh ở server: lấy user từ session (`getUser()`, không tin dữ liệu đọc từ cookie/localStorage), rồi kiểm tra role.
- Role lưu ở nguồn tin cậy: bảng `admin_profiles` (hoặc claim do server cấp), **không** dựa vào email, state trình duyệt hay trường người dùng tự sửa được. Không có luồng tự đăng ký thành admin.
- Ẩn nút trên UI chỉ là UX, không phải bảo mật. Quyền thật nằm ở server và RLS.
- Khách không có tài khoản trong MVP; checkout là khách vãng lai.

## 4. Database, RLS và migration

- **Bật RLS** cho mọi bảng có thể chạm tới từ client. Viết policy tối thiểu cần thiết; mặc định từ chối.
  - `products` / `product_images`: khách chỉ đọc bản ghi `status = 'active'`.
  - `orders` / `order_items`: khách không đọc/ghi trực tiếp; tạo đơn qua server/RPC.
  - Bảng vật tư, phiếu nhập, kho: chỉ admin.
- **Mọi thay đổi schema = một file migration** trong `supabase/migrations/`. Không sửa production thủ công mà không ghi migration. Mỗi migration có thể review và chạy lại được.
- Tiền là **số nguyên VND** (`bigint`/`integer`) kèm `CHECK (>= 0)`. Không dùng float. Thêm constraint cho `stock_quantity >= 0`, enum/`CHECK` cho trạng thái, `UNIQUE` cho `slug`, `order_number`.
- Đơn hàng lưu **snapshot** tên và giá sản phẩm tại thời điểm đặt. Sản phẩm đã có đơn thì **archive**, không hard delete.
- Index cho cột lọc/sắp xếp thường dùng (`slug`, `status`, `created_at`, `order_number`). Tránh N+1: lấy quan hệ cần thiết trong một truy vấn (`select('*, product_images(*)')`).
- Types: sinh type TypeScript từ schema (`supabase gen types`) và dùng thay vì viết tay, để code và database không lệch.

## 5. Đặt đơn (bắt buộc làm đúng)

Luồng chi tiết ở `SHOP_ESER_STACK.md` mục 5. Quy tắc cho code:

1. Client chỉ gửi **ID sản phẩm/biến thể + số lượng + thông tin nhận hàng**. Bỏ qua mọi giá, tổng tiền, phí ship do client gửi.
2. Server validate input bằng Zod (số lượng nguyên dương và có giới hạn trên, số điện thoại chuẩn hóa, độ dài địa chỉ/ghi chú).
3. Server tải lại giá và tồn kho từ database, kiểm tra ngoài phạm vi phục vụ (ngoài 20 km: không tạo đơn, trả "liên hệ shop"), tính `subtotal`, phí ship, hỗ trợ ship, `total`; kiểm tra tồn nhưng **chưa trừ**.
4. Tạo `orders` + `order_items` (+ dữ liệu bill) trong **một transaction** (hàm SQL/RPC). Không ghi một phần. Không trừ tồn ở bước này.
5. **Trừ tồn nằm ở bước admin "xác nhận đã nhận chuyển khoản và chốt đơn"**: một transaction/RPC dùng cập nhật có điều kiện (`UPDATE ... WHERE stock_quantity >= n`); không đủ tồn thì cả thao tác thất bại và đơn giữ nguyên. Kiểm tra quyền admin ở server.
6. **Idempotent:** gửi đơn lặp (double-click, retry) không được tạo hai đơn; bấm chốt đơn hai lần không được trừ tồn hai lần (dùng `orders.stock_deducted_at`).
7. Hủy đơn đã trừ tồn phải hoàn tồn đúng một lần; hủy đơn chưa trừ tồn thì không hoàn.
8. Trả về mã đơn và **trạng thái thật**. Không hiển thị "đã thanh toán", "đã gửi vận chuyển" khi chưa có xác nhận thực.

> **Đã chốt:** đơn chưa chốt không giữ hàng, nên hai khách có thể đặt cùng món cuối. Khi chốt đơn mà không đủ tồn, trả lỗi rõ ràng cho admin thay vì để tồn âm.

**Phí ship:** tính trong một hàm server duy nhất. Phí theo khoảng cách (không có phí gốc cố định), hỗ trợ `min(mức hỗ trợ, phí ship)` theo ngưỡng của `subtotal` (< 399k: 0; ≥ 399k: 20k; ≥ 599k: 50k), hỏa tốc cộng phụ phí do khách trả. Bảng giá/km, ngưỡng, mức hỗ trợ và bán kính nằm trong `shop_settings`, không hardcode. Chính sách ở `SHOP_ESER_STACK.md` mục 6. Không tin phí ship client gửi lên. Chưa có bảng giá/km hoặc cách đo khoảng cách thì hỏi chủ shop, không tự bịa.

**Tài khoản nhận tiền:** đọc từ `shop_settings` (admin sửa được), không hardcode. Chưa cấu hình thì không hiển thị thông tin chuyển khoản giả.

Chuyển trạng thái đơn chỉ theo đường hợp lệ (`pending_confirmation → confirmed → preparing → shipping → completed`, và `cancelled` từ các trạng thái trước `completed`). Kiểm tra ở server/database, không chỉ ở UI. `payment_status` tách biệt `order_status`.

## 6. Nhập hàng và kho

Chi tiết: [`docs/ADMIN_INVENTORY_TEXT_IMPORT.md`](../../docs/ADMIN_INVENTORY_TEXT_IMPORT.md). Quy tắc cốt lõi:

- Parser (text, CSV/XLSX, OCR) chỉ là **bước hỗ trợ nhập liệu**. Kết quả luôn đi qua validator/normalizer và **bảng preview chỉnh sửa được** trước khi ghi chính thức.
- Lưu **văn bản gốc**, kết quả chuẩn hóa, người tạo, thời điểm, trạng thái.
- Không tự suy ra màu, đơn vị, số lượng, giá hay mặt hàng còn thiếu; mơ hồ thì để trống và đánh dấu cho admin sửa. Không tự tạo mặt hàng trùng.
- Ba loại giá là ba trường riêng: `wholesale_price_vnd` (sỉ tham chiếu), `retail_price_vnd` (bán lẻ), `unit_cost_vnd` (giá nhập thực tế trên từng dòng phiếu). Không tự ghi đè giá danh mục.
- `line_total_vnd = quantity × unit_cost_vnd` tính và kiểm tra lại ở server.
- **Phiếu nháp, form danh mục, import, OCR không làm đổi tồn.** Chỉ thao tác "xác nhận đã nhận hàng" mới ghi giao dịch kho và cộng tồn; thao tác đó chạy trong transaction và **idempotent** (xác nhận hai lần không cộng hai lần).
- Nếu dùng AI để parse, kết quả AI không phải dữ liệu đã xác minh. Chỉ thêm AI parser sau khi có dữ liệu thực tế chứng minh cần.

## 7. Upload ảnh (Supabase Storage)

- Bucket ảnh sản phẩm: công khai để đọc, **chỉ admin được ghi** (policy trên `storage.objects`).
- Validate loại file (jpeg/png/webp) và kích thước ở server; không tin phần mở rộng hay MIME do client gửi.
- Lưu `storage_path` trong `product_images`; luôn có `alt_text`. Không lưu file lên đĩa server (Vercel là serverless).
- Dùng `next/image` khi hiển thị; cấu hình `remotePatterns` cho domain Supabase.

## 8. Biến môi trường và secrets

- `.env.local` cho local; chỉ commit `.env.example` (tên biến + placeholder).
- Kiểm tra biến môi trường bắt buộc một lần khi khởi động (ví dụ `lib/env.ts` validate bằng Zod) để lỗi cấu hình hiện ra sớm.
- Không tạo biến cho dịch vụ chưa dùng. Không đưa secret vào repo, log hoặc client bundle.

## 9. Xử lý lỗi và log

- Server Action trả kết quả có cấu trúc (`{ ok: true, data } | { ok: false, error }`); lỗi dự kiến (hết hàng, validation, không có quyền) trả thông điệp tiếng Việt dễ hiểu, không lộ chi tiết nội bộ.
- Lỗi bất ngờ: log ở server với ngữ cảnh đủ để điều tra nhưng **không ghi dữ liệu cá nhân đầy đủ** (số điện thoại, địa chỉ).
- Rate-limit hoặc chống spam cho endpoint tạo đơn khi cần.

## 10. Test và kiểm chứng

Ưu tiên test cho logic có rủi ro tiền/kho/quyền:

- Tính tiền (`money.ts`, tính tổng đơn), kể cả làm tròn và giá thay đổi trước checkout.
- Tạo đơn: hết hàng, số lượng không hợp lệ, gửi lặp, lỗi giữa chừng (không ghi một phần).
- Quyền admin: người chưa đăng nhập và người không phải admin bị từ chối ở mọi thao tác ghi.
- Chuyển trạng thái đơn không hợp lệ bị chặn.
- Parser nhập hàng: ví dụ `35k`, `35.000đ`, `sấp`/`xấp`, dòng mơ hồ, mặt hàng chưa ghép.
- Xác nhận phiếu nhập hai lần chỉ cộng tồn một lần.

Không dùng dữ liệu khách hàng thật trong seed/test. Chạy `lint`, `typecheck`, `test`, `build` theo scripts thực tế trong `package.json`; nếu không chạy được, nói rõ lý do, không tuyên bố đã test.
