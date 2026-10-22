# Shop Eser — Stack & Architecture (MVP)

**Trạng thái:** Đề xuất kiến trúc ban đầu, cần đối chiếu repository trước khi triển khai.  
**Mục tiêu:** Ra mắt website bán hoa sáp/hoa lụa tại Hà Nội với chi phí vận hành thấp, quản trị đơn giản và khả năng mở rộng vừa đủ.

## 1. Quyết định kiến trúc đề xuất

### Stack ưu tiên

| Lớp | Đề xuất | Lý do |
|---|---|---|
| Framework full-stack | Next.js App Router + TypeScript strict | Một codebase cho storefront, trang admin và server-side logic; SEO tốt |
| UI | Tailwind CSS + shadcn/ui khi phù hợp | Xây UI nhanh, component có thể kiểm soát; không khóa thương hiệu vào một theme |
| Form/validation | React Hook Form + Zod (chỉ khi cần form phức tạp; validation server là bắt buộc) | UX form tốt và schema dùng lại được |
| Database | PostgreSQL do Supabase cung cấp | Quan hệ sản phẩm/đơn hàng rõ ràng, có backup và công cụ quản trị |
| Auth admin | Supabase Auth | Tránh tự xây password/session cho trang quản trị |
| File/ảnh | Supabase Storage ban đầu | Lưu ảnh sản phẩm; có thể đổi CDN/object storage sau |
| Data access | Supabase server client / SQL có kiểm soát; migration bằng SQL hoặc công cụ phù hợp repository | Giảm một backend riêng không cần thiết ở MVP |
| Hosting | Vercel cho Next.js | Triển khai preview và production thuận tiện |
| Analytics | Chưa khóa provider; bắt đầu với event cơ bản và công cụ phù hợp sau khi có domain/consent | Không thêm hệ thống phân tích trước khi cần |
| Email/notification | Chưa chọn provider; MVP có thể dùng trang xác nhận và quy trình admin, sau đó thêm email transactional | Tránh phụ thuộc dịch vụ khi chưa rõ nhu cầu |

**Nguyên tắc:** ưu tiên kiến trúc modular monolith. Không cần FastAPI, Celery, RabbitMQ, Redis hoặc backend service riêng cho MVP trừ khi khảo sát code hiện tại cho thấy có lý do cụ thể.

### Lưu ý khi dùng Supabase

- Dùng publishable key (trước đây gọi là anon key) ở client chỉ khi policy phù hợp; không bao giờ đưa `service_role` key vào bundle client.
- Bật Row Level Security (RLS) cho bảng có thể truy cập qua client và viết policy tối thiểu cần thiết.
- Quyền quản trị phải được kiểm tra server-side và/hoặc bằng role đáng tin cậy trong database; không dựa vào email hoặc state ở trình duyệt.
- Tạo schema/migration có version trong repository; không chỉnh production database thủ công mà không ghi lại migration.
- Với thao tác đặt đơn và kiểm tra tồn kho, dùng server-side function/transaction để tính lại giá, kiểm tra hàng và ghi đơn một cách nhất quán.
- Supabase là lựa chọn đề xuất, không phải sự thật đã triển khai. Nếu repository đã tích hợp một database/auth khác, đánh giá chi phí chuyển đổi trước khi thay.

## 2. Cấu trúc thư mục đề xuất

Điều chỉnh theo cấu trúc thật của repository, không tạo bản sao cấu trúc nếu đã có quy ước tương đương.

```text
/
├── AGENTS.md
├── SHOP_ESER_STACK.md
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx                 # Trang chủ
│   │   ├── shop/page.tsx            # Danh sách sản phẩm
│   │   ├── products/[slug]/page.tsx # Chi tiết sản phẩm
│   │   ├── cart/page.tsx            # Giỏ hàng
│   │   ├── checkout/page.tsx        # Checkout
│   │   ├── order-success/page.tsx   # Xác nhận đặt hàng
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard đơn giản
│   │   ├── products/                # CRUD sản phẩm
│   │   └── orders/                  # Danh sách/chi tiết đơn
│   ├── api/                         # Chỉ dùng route handlers khi cần
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── storefront/
│   └── admin/
├── lib/
│   ├── supabase/                    # Client/server helpers
│   ├── validations/
│   ├── money.ts
│   └── orders/                      # Logic đơn hàng phía server
├── public/
├── supabase/
│   ├── migrations/
│   └── seed.sql                     # Dữ liệu demo nếu cần
├── tests/
└── .env.example
```

Không cần tạo mọi thư mục ngay từ đầu; chỉ thêm khi có code sử dụng. Nếu template hiện tại đặt app trong `frontend/`, giữ cấu trúc đó thay vì chuyển toàn bộ chỉ để khớp ví dụ.

## 3. Phạm vi MVP

### Storefront

- Trang chủ: giới thiệu ngắn về Eser, bộ sưu tập/nổi bật, CTA xem sản phẩm.
- Danh sách sản phẩm: ảnh, tên, giá, lọc tối thiểu theo loại hoa nếu có đủ dữ liệu.
- Chi tiết sản phẩm: gallery, tên, mô tả, giá, tồn trạng thái, số lượng, thêm giỏ.
- Giỏ hàng: sửa số lượng, xóa dòng hàng, tạm tính.
- Checkout: tên người nhận, số điện thoại, địa chỉ giao hàng, ghi chú, phương thức thanh toán được bật.
- Trang xác nhận: mã đơn và thông tin trạng thái ban đầu.
- Trang liên hệ/chính sách: chỉ công bố thông tin đã xác minh.

### Admin

- Đăng nhập quản trị.
- CRUD sản phẩm cơ bản: tên, slug, loại hoa, mô tả, giá, ảnh, trạng thái hiển thị, số lượng tồn.
- Xem danh sách đơn và chi tiết đơn.
- Cập nhật trạng thái đơn theo các chuyển đổi hợp lệ.
- Xem trạng thái thanh toán tách biệt với trạng thái xử lý đơn.
- Danh mục vật tư/nguyên liệu nội bộ có tên chuẩn, nhóm hàng, màu/biến thể, đơn vị, ảnh tham chiếu và giá sỉ/lẻ nếu áp dụng.
- Nhập hàng nhanh bằng cách dán ghi chú tiếng Việt; hệ thống phân tích thành bảng nháp để admin kiểm tra rồi mới tạo phiếu nhập.
- Phiếu nhập có đơn giá nhập thực tế riêng, tách biệt giá sỉ tham chiếu và giá bán lẻ; chỉ tăng tồn khi admin xác nhận đã nhận hàng.
- Đặc tả chi tiết: [`docs/ADMIN_INVENTORY_TEXT_IMPORT.md`](./docs/ADMIN_INVENTORY_TEXT_IMPORT.md).

### Chưa làm trong MVP

- Tài khoản khách hàng/lịch sử đơn cá nhân (có thể xem lại theo mã đơn ở giai đoạn sau).
- Theo dõi vận chuyển realtime, tự động tạo vận đơn/hoàn hàng.
- Tích hợp nhiều cổng thanh toán, đối soát tự động.
- Đồng bộ social commerce, đăng bài từ admin sang nhiều nền tảng.
- Quản lý kho nhiều địa điểm, kế toán, phân quyền nhiều cấp.
- Booking workshop, đào tạo/chứng chỉ và marketplace.

## 4. Mô hình dữ liệu tối thiểu

### `products`

- `id` UUID primary key
- `name` text not null
- `slug` text unique not null
- `category` enum/text giới hạn: `soap_flower`, `silk_flower`, `other` (có thể mở rộng)
- `description` text nullable
- `price_vnd` bigint/integer not null, phải >= 0
- `compare_at_price_vnd` nullable; chỉ dùng khi có giá so sánh thật
- `stock_quantity` integer not null default 0, phải >= 0
- `status` enum/text: `draft`, `active`, `archived`
- `featured` boolean default false
- `created_at`, `updated_at`

### `product_images`

- `id` UUID
- `product_id` foreign key
- `storage_path` hoặc URL được quản lý
- `alt_text` text
- `sort_order` integer

Nếu biến thể như màu sắc/kích cỡ thực sự ảnh hưởng đến SKU, giá hoặc tồn kho, tạo `product_variants` riêng. Không thêm bảng biến thể trước khi xác định cách bán hàng thực tế.

### `orders`

- `id` UUID
- `order_number` mã đơn dễ đọc, unique
- `customer_name`, `customer_phone`
- `shipping_address`, `shipping_note` nullable
- `subtotal_vnd` (tiền hàng), `shipping_fee_vnd` (phí ship theo khoảng cách), `shipping_support_vnd` (shop hỗ trợ), `express_surcharge_vnd` (phụ phí hỏa tốc), `discount_vnd`, `total_vnd` kiểu số nguyên VND. `total_vnd = subtotal + shipping_fee - shipping_support + express_surcharge - discount`
- `delivery_type`: `standard`, `express`; `shipping_distance_km` (snapshot lúc tính phí)
- `stock_deducted_at` nullable: đánh dấu đã trừ tồn, dùng để trừ/hoàn đúng một lần
- `payment_method` (chỉ giá trị đã bật)
- `payment_status`: `unpaid`, `pending`, `paid`, `failed`, `refunded` khi phù hợp
- `order_status`: `pending_confirmation`, `confirmed`, `preparing`, `shipping`, `completed`, `cancelled`
- `created_at`, `updated_at`

### `order_items`

- `id` UUID
- `order_id` foreign key
- `product_id` nullable hoặc tham chiếu sản phẩm theo chính sách lưu trữ
- `product_name_snapshot`
- `unit_price_vnd`
- `quantity`
- `line_total_vnd`

Lưu snapshot tên và giá tại thời điểm đặt để đơn cũ không đổi khi sản phẩm được sửa. Cần quyết định quy tắc xóa sản phẩm trước khi triển khai; ưu tiên archive thay vì hard delete nếu đã có đơn liên quan.

### `shop_settings`

Cấu hình do admin sửa được, không hardcode: thông tin tài khoản nhận tiền (ngân hàng, số tài khoản, chủ tài khoản), ngưỡng và mức hỗ trợ ship, bảng giá ship theo khoảng cách, bán kính phục vụ, thông tin liên hệ shop. Chỉ admin được ghi. Phần hiển thị cho khách (tài khoản nhận tiền, liên hệ) đọc qua server.

### Danh mục vật tư và nhập hàng

Với yêu cầu nhập hàng bằng văn bản tự do, xem mô hình dữ liệu, quy tắc parse, preview, phiếu nhập và transaction kho tại [`docs/ADMIN_INVENTORY_TEXT_IMPORT.md`](./docs/ADMIN_INVENTORY_TEXT_IMPORT.md). Không gộp giá nhập thực tế, giá sỉ tham chiếu và giá lẻ thành một trường. Không tăng tồn từ phiếu nháp.

### `admin_profiles` (nếu cần)

Lưu role hoặc hồ sơ liên kết với Supabase Auth. Chỉ admin được cấp quyền qua quy trình tin cậy; không cho người dùng tự đăng ký thành admin.

## 5. Luồng đặt hàng và quy tắc nghiệp vụ

1. Khách duyệt sản phẩm và thêm vào giỏ.
2. Checkout gửi ID sản phẩm/biến thể, số lượng, loại giao (thường/hỏa tốc) và thông tin nhận hàng.
3. Server tải lại giá/tồn kho từ database; bỏ qua tổng tiền do client tự tính.
4. Server tính khoảng cách. **Nếu ngoài bán kính phục vụ (khoảng 20 km): không tạo đơn, hiển thị "Liên hệ shop"** kèm thông tin liên hệ do chủ shop cung cấp.
5. Server xác thực số lượng, **kiểm tra tồn kho (chưa trừ)**, tính subtotal, phí ship, hỗ trợ ship, phụ phí hỏa tốc, total.
6. Tạo đơn cùng order items trong transaction/RPC (`order_status = pending_confirmation`, `payment_status = unpaid`). Hệ thống tạo **bill** cho khách: mã đơn, tiền hàng, phí ship, hỗ trợ, tổng tiền, nội dung chuyển khoản (mã đơn) và tài khoản nhận tiền lấy từ `shop_settings`.
7. Khách chuyển khoản và gửi bill (ảnh/biên lai chuyển khoản) cho shop.
8. Admin đối chiếu bill, bấm **"Xác nhận đã nhận chuyển khoản và chốt đơn"**. Đây là lúc **trừ tồn** (mục dưới). Sau đó admin chuẩn bị, giao hàng và hoàn thành.
9. Nếu có tích hợp thanh toán sau này, chỉ chuyển `payment_status` thành `paid` khi webhook/provider đã được xác minh; xử lý webhook idempotently.

**Quy tắc tồn kho (đã chốt):** chỉ **trừ tồn khi admin xác nhận đã có bill chuyển khoản và chốt đơn**, không trừ lúc khách đặt.
- Việc trừ nằm trong một transaction, có điều kiện (`UPDATE ... WHERE stock_quantity >= n`) và idempotent qua `stock_deducted_at` (bấm hai lần không trừ hai lần).
- Đơn chưa chốt **không giữ hàng**. Vì vậy hai khách có thể đặt cùng món cuối; khi chốt đơn thứ hai mà không đủ tồn, thao tác thất bại, đơn giữ nguyên trạng thái chờ và admin xử lý (liên hệ khách, đổi sản phẩm hoặc hoàn tiền). Giao diện admin phải hiển thị rõ lỗi "không đủ tồn".
- Hủy đơn chưa trừ tồn: không hoàn gì. Hủy đơn đã trừ tồn: hoàn đúng một lần.
- Không cần tự hủy đơn để nhả tồn, vì đơn chưa chốt không giữ hàng.

## 6. Giá, giao hàng và thanh toán

### Giá

- Giá lưu và tính bằng VND số nguyên.
- Mức giá tham chiếu hiện tại: offline 100.000–150.000 ₫; online Hà Nội 250.000–500.000 ₫.
- Không hardcode khoảng giá vào logic. Mỗi sản phẩm có giá cụ thể do admin quản lý.
- Chưa quyết định giá có khác theo kênh hay không. MVP website chỉ cần một giá online theo sản phẩm; không xây price list đa kênh khi chưa cần.

### Giao hàng

- Thị trường ưu tiên: Hà Nội. **Khu vực phục vụ (đã chốt):** nội thành, trong khoảng 20 km. Ngoài phạm vi: không cho đặt, hiển thị "Liên hệ shop".
- **Phí ship (đã chốt):** không có phí ship gốc cố định; tính **theo khoảng cách** đến địa chỉ nhận. Bảng giá theo km và điểm gốc tính khoảng cách là cấu hình trong `shop_settings` (chưa có số liệu).
- **Chính sách hỗ trợ phí ship (đã chốt), dựa trên tiền hàng (`subtotal`), chưa gồm ship:**
  - Dưới 399.000 ₫: khách tự chịu toàn bộ phí ship.
  - Từ 399.000 ₫ đến dưới 599.000 ₫: shop hỗ trợ 20.000 ₫ phí ship.
  - Từ 599.000 ₫ trở lên: shop hỗ trợ 50.000 ₫ phí ship.
  - Giao hỏa tốc cho đơn gấp: khách trả phần phí phát sinh.
- Ngưỡng và mức hỗ trợ là **cấu hình** (không hardcode rải rác); logic tính nằm ở một hàm server duy nhất, có test.
- **Đã chốt:** mức hỗ trợ tối đa bằng phí ship thực tế: `hỗ trợ = min(mức hỗ trợ, phí ship)`.
- Phí hỏa tốc phát sinh do khách trả; cách tính (cố định hay theo km) chưa chốt, nên là cấu hình hoặc admin nhập khi có đơn hỏa tốc.
- Chưa chốt: bảng giá theo km, cách đo khoảng cách (dịch vụ bản đồ hay admin nhập tay), điểm gốc, phụ phí hỏa tốc, đơn vị vận chuyển, thời gian chuẩn bị, quy trình hoàn hàng.
- Không tuyên bố có tracking realtime khi chưa tích hợp.

### Thanh toán

- **MVP ưu tiên chuyển khoản thủ công** (đã chốt). COD chỉ thêm nếu chủ shop yêu cầu.
- **Tài khoản nhận tiền sẽ bổ sung sau**, lưu trong `shop_settings` và admin sửa được trên giao diện. Không hardcode, không bịa số tài khoản. Chưa cấu hình thì không được mở bán chuyển khoản trên production; bản demo phải đánh dấu rõ là demo.
- Khi khách tạo đơn, hệ thống tính phí rồi tạo bill (tiền hàng, ship, hỗ trợ, tổng, nội dung chuyển khoản). `payment_status` chỉ thành `paid` khi admin xác nhận đã nhận chuyển khoản.
- Nếu chuyển khoản thủ công, không tự động đánh dấu đã thanh toán chỉ vì khách chọn phương thức đó.
- Chỉ thêm VNPay/MoMo/OnePay hoặc provider khác sau khi xác định phí, điều kiện tài khoản, webhook, môi trường sandbox và luồng hoàn tiền.

## 7. Thiết kế và thương hiệu

### Đã biết

- Tên: Eser / Eser Flowers & Gifts.
- Ý nghĩa định hướng: tác phẩm, sáng tạo, dấu ấn; liên tưởng Muse → cảm hứng → tác phẩm.
- Sản phẩm: hoa sáp và hoa lụa.
- Thị trường online ưu tiên: Hà Nội.

### Chưa chốt — không được tự coi là brand decision

- Logo và biến thể logo.
- Màu chính/phụ, font, design tokens chính thức.
- Art direction, phong cách ảnh, illustration/icon style.
- Slogan chính thức và brand voice hoàn chỉnh.
- Domain, địa chỉ, số điện thoại, email chính thức.
- Chính sách giao hàng, đổi trả, bảo hành, thanh toán.

Trong lúc chờ, xây design tokens trung tính, dễ thay đổi; tập trung vào typography dễ đọc, khoảng trắng, ảnh sản phẩm, giá và CTA. Không áp một palette hoặc font thành chính thức nếu chưa được duyệt.

## 8. SEO và khả năng được AI tìm thấy

Mục tiêu dài hạn là để Eser được tìm thấy qua search engine và được các hệ thống AI đề xuất khi phù hợp. Không thể đảm bảo thứ hạng hoặc việc được AI đề xuất. MVP nên chuẩn bị nền tảng:

- Nội dung sản phẩm độc nhất, cụ thể, mô tả đúng chất liệu, kích thước và mục đích tặng khi có dữ liệu.
- Title/description riêng cho trang chủ, danh mục và sản phẩm.
- URL ổn định, canonical, sitemap.xml, robots.txt.
- Open Graph và ảnh chia sẻ phù hợp.
- Product structured data chỉ dùng trường dữ liệu có thật; giá/tồn kho/schema phải khớp nội dung hiển thị.
- Thông tin liên hệ và chính sách minh bạch khi đã được xác nhận.
- Trang tải nhanh, responsive, ảnh tối ưu và nội dung HTML có thể crawl.
- Sau khi ra mắt: thiết lập Search Console/analytics phù hợp và xây nội dung hữu ích theo câu hỏi thực tế của khách hàng.

Không nhồi keyword, không tạo trang địa phương giả, không sinh review giả hoặc schema sai sự thật.

## 9. Bảo mật, chất lượng và vận hành

- Dùng `.env.local` cho local; chỉ commit `.env.example` với tên biến và placeholder, không có secret.
- Xác thực admin ở server và database; bật RLS khi sử dụng Supabase.
- Rate-limit hoặc chống spam cho endpoint tạo đơn nếu cần; validate và normalize số điện thoại, ghi chú, địa chỉ.
- Không ghi log dữ liệu cá nhân đầy đủ nếu không cần.
- Kiểm tra các trường hợp: hết hàng, số lượng không hợp lệ, giá thay đổi trước checkout, gửi đơn lặp, lỗi mạng, đơn bị hủy và admin không có quyền.
- Dùng test cho logic tính tiền, tạo đơn, quyền admin và chuyển trạng thái.
- Chạy `lint`, `typecheck`, `test`, `build` theo scripts hiện hữu trước khi release.
- Không dùng dữ liệu khách hàng thật trong seed/test.

## 10. Biến môi trường dự kiến

Tên chính xác phải khớp SDK và repository thực tế. Ví dụ khi dùng Supabase:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ được dùng ở server trong trường hợp thật sự cần, không được prefix `NEXT_PUBLIC_`, không gửi xuống client và không ghi vào log. Ưu tiên thao tác server có quyền tối thiểu thay vì dùng service role cho mọi truy vấn.

Có thể bổ sung biến cho site URL, email, analytics hoặc payment provider khi đã chọn tích hợp. Không tạo biến cho dịch vụ chưa sử dụng.

## 11. Lộ trình phát triển khuyến nghị

### Phase 0 — Audit template

- Xem `package.json`, cấu trúc source, scripts, UI hiện tại và các integration.
- Xác nhận stack đã tồn tại; xóa/thay nội dung template không liên quan đến Eser nhưng giữ lại workflow/skills hữu ích.
- Chọn cấu trúc code dựa trên repo thực tế.

### Phase 1 — Storefront có dữ liệu

- Design tokens tạm.
- Trang chủ, shop, product detail, responsive navigation.
- Schema sản phẩm và seed data được đánh dấu demo.

### Phase 2 — Giỏ hàng và đặt đơn

- Cart, checkout khách vãng lai, validation.
- Tính tiền server-side, tạo đơn an toàn, trang xác nhận.
- Quyết định quy tắc tồn kho, phí ship và thanh toán trước production.

### Phase 3 — Admin cơ bản

- Admin auth và role.
- CRUD sản phẩm/ảnh/tồn kho.
- Quản lý đơn và trạng thái, xác nhận thanh toán thủ công.
- Kho và nhập hàng (theo `docs/ADMIN_INVENTORY_TEXT_IMPORT.md`; thứ tự P0 danh mục → P1 nhập text/phiếu nhập → P2 CSV/XLSX → P3 OCR).

### Phase 4 — Launch readiness

- Chính sách và thông tin liên hệ đã xác nhận.
- SEO, sitemap, metadata, structured data.
- Accessibility, mobile QA, test luồng mua hàng, backup, error monitoring tối thiểu.
- Domain và production environment.

### Phase 5 — Chỉ sau khi có dữ liệu sử dụng

- Tự động hóa vận chuyển/thanh toán.
- Analytics nâng cao, tích hợp social, CRM, loyalty, tài khoản khách hàng.
- Workshop/đào tạo và các mục tiêu mở rộng dài hạn.

## 12. Các quyết định còn mở

| Quyết định | Trạng thái | Không nên tự giả định |
|---|---|---|
| Logo, palette, font, art direction | Chưa chốt | Không biến lựa chọn tạm thành nhận diện chính thức |
| Domain và thông tin liên hệ | Chưa chốt | Không dùng thông tin bịa |
| Phương thức thanh toán | **Đã chốt:** chuyển khoản thủ công. Tài khoản nhận tiền bổ sung sau (admin sửa được) | Không giả lập thanh toán thành công; không bịa số tài khoản |
| Phí ship/khu vực/thời gian giao | **Đã chốt:** phạm vi 20 km (ngoài thì "Liên hệ shop"), phí theo khoảng cách, hỗ trợ theo ngưỡng. Chưa có bảng giá/km, cách đo khoảng cách, phụ phí hỏa tốc, thời gian giao | Không bịa bảng giá; không quảng cáo miễn phí ship hoặc giao nhanh ngoài chính sách |
| Chính sách đổi trả/hoàn hàng | Chưa chốt | Không tự đặt điều khoản |
| Quy tắc tồn kho | **Đã chốt:** trừ tồn khi admin xác nhận có bill chuyển khoản và chốt đơn; đơn chưa chốt không giữ hàng | Cần xử lý trường hợp chốt đơn khi không đủ tồn |
| Có bán biến thể theo màu/kích cỡ | Chưa chốt | Không tạo mô hình variant phức tạp khi chưa cần |
| Giá riêng theo kênh online/offline | Chưa chốt | Không hardcode giá theo kênh |
| Nhà cung cấp email/payment/shipping | Chưa chốt | Không thêm integration chưa được chọn |

## 13. Tiêu chí nghiệm thu MVP

- Khách có thể xem sản phẩm, giá và ảnh trên mobile/desktop.
- Khách có thể thêm/sửa/xóa sản phẩm trong giỏ và gửi đơn với thông tin hợp lệ.
- Server tự xác minh giá và tồn kho trước khi tạo đơn.
- Khách nhận được mã đơn và trạng thái trung thực.
- Admin được xác thực có thể quản lý sản phẩm và xử lý đơn; khách thường không thể truy cập chức năng admin.
- Không có thông tin giả về review, thanh toán, giao hàng hoặc chính sách.
- Metadata và URL cơ bản cho trang chủ, danh mục và sản phẩm hoạt động.
- Các kiểm tra lint/typecheck/test/build đã chạy hoặc mọi giới hạn được ghi rõ.


- Nạp danh mục nguyên liệu theo ba cách: form admin, import CSV/XLSX và OCR ảnh; tất cả đi qua validator/normalizer và preview dùng chung trước khi xác nhận.
- Thứ tự ưu tiên: form danh mục → nhập nhanh bằng text/phiếu nhập → CSV/XLSX → OCR ảnh. Google Sheets API trực tiếp và AI parse nâng cao để sau khi MVP có dữ liệu sử dụng thực tế.
- Chi tiết quy trình, schema và tiêu chí nghiệm thu: [`docs/ADMIN_INVENTORY_TEXT_IMPORT.md`](./docs/ADMIN_INVENTORY_TEXT_IMPORT.md).
