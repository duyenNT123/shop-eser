# Shop Eser — Frontend Guide (Next.js + Supabase)

> **Dành cho AI agents:** Quy tắc cho mọi code giao diện (storefront và admin). Đọc cùng [`AGENTS.md`](../../AGENTS.md) và [`SHOP_ESER_STACK.md`](../../SHOP_ESER_STACK.md); phần dữ liệu/bảo mật xem [`BACKEND_GUIDE.md`](../backend/BACKEND_GUIDE.md). Nếu repository thật khác mô tả ở đây, kiểm tra code thực tế và cập nhật tài liệu thay vì giả định.

## 1. Stack

- **Framework:** Next.js App Router + TypeScript `strict`.
- **Styling:** Tailwind CSS; shadcn/ui khi phù hợp (component nằm trong repo, sửa được).
- **Form:** React Hook Form + Zod cho form phức tạp (checkout, admin). Form đơn giản dùng `<form action>` với Server Action. Validation ở server là bắt buộc dù client đã validate.
- **Dữ liệu:** Server Component + Supabase server client. Chỉ thêm thư viện fetch/cache phía client (ví dụ TanStack Query) khi có nhu cầu thật (polling, optimistic update phức tạp), không thêm mặc định.
- **State phía client:** React state/Context cho giỏ hàng và UI. Chỉ thêm Zustand khi state dùng chung đủ phức tạp. Không lưu dữ liệu từ database vào store toàn cục.
- **Animation:** chỉ khi có mục đích rõ và không làm giảm hiệu năng; tôn trọng `prefers-reduced-motion`.
- **Không dùng NextAuth hay JWT tự quản lý.** Auth admin là Supabase Auth (xem Backend Guide mục 3).

## 2. Cấu trúc thư mục

Ứng dụng nằm ở gốc repository. Chỉ tạo thư mục khi có code dùng.

```
app/
├── (storefront)/        # Trang chủ, shop, products/[slug], cart, checkout, order-success, contact
├── admin/               # Dashboard, products, orders, kho/nhập hàng (được bảo vệ)
├── api/                 # Route handler, chỉ khi cần
├── layout.tsx
└── globals.css
components/
├── ui/                  # shadcn/ui và thành phần cơ bản
├── storefront/
└── admin/
lib/                     # supabase/, validations/, money.ts, orders/, inventory/
public/
```

Giữ các file nhỏ, tách theo component. Không tạo file đơn lẻ hàng trăm dòng trộn UI, truy vấn dữ liệu và logic nghiệp vụ.

## 3. Server Components và Client Components

- **Mặc định là Server Component.** Chỉ thêm `"use client"` cho phần cần tương tác (giỏ hàng, chọn số lượng, gallery, form động).
- Giữ ranh giới client **nhỏ và sâu trong cây**: trang vẫn là server, chỉ nút/form tương tác là client.
- Trang storefront phải render được HTML có nội dung sản phẩm phía server (SEO, crawl). Không tải danh sách sản phẩm bằng `useEffect`.
- Không import module server-only (service role key, truy vấn nhạy cảm) vào Client Component. Dùng `server-only` để chặn.
- Dữ liệu truyền từ server xuống client chỉ gồm trường cần hiển thị.

## 4. Giỏ hàng

- Giỏ lưu ở client (ví dụ `localStorage`) chỉ gồm **ID sản phẩm/biến thể và số lượng**. Không lưu giá làm nguồn sự thật.
- Giá hiển thị trong giỏ lấy từ dữ liệu sản phẩm hiện hành; khi checkout, **server tính lại** giá và tồn kho. Nếu giá hoặc tồn thay đổi, báo rõ cho khách trước khi đặt.
- Xử lý an toàn khi `localStorage` không dùng được hoặc dữ liệu cũ/hỏng; sản phẩm đã ẩn/hết hàng phải được thông báo, không làm hỏng trang.
- Chống gửi đơn lặp: vô hiệu hóa nút khi đang gửi, hiển thị trạng thái đang xử lý.
- Checkout: địa chỉ ngoài phạm vi phục vụ (khoảng 20 km) hiển thị thông báo **"Liên hệ shop"** thay vì cho đặt. Hiển thị rõ tiền hàng, phí ship, phần shop hỗ trợ, phụ phí hỏa tốc (nếu có) và tổng tiền; đây chỉ là số do server trả về.
- Sau khi đặt, trang xác nhận đơn là **bill**: mã đơn, các khoản tiền, nội dung chuyển khoản và tài khoản nhận tiền lấy từ cài đặt admin. Trạng thái hiển thị trung thực: "Chờ chuyển khoản/chờ shop xác nhận", không ghi "đã thanh toán" cho tới khi admin xác nhận.

## 5. Tiền và định dạng

- Giá là **số nguyên VND**. Format bằng một helper duy nhất (`lib/money.ts`) cho ra dạng `250.000 ₫` (`Intl.NumberFormat('vi-VN')`). Không tự ghép chuỗi giá rải rác.
- Không tính toán tiền bằng float. Tổng tiền hiển thị ở client chỉ là tạm tính.
- Ngày giờ hiển thị theo múi giờ và định dạng Việt Nam.

## 6. UI, UX và nội dung

- **Mobile-first.** Khách đến từ social, chủ yếu trên điện thoại. Kiểm tra màn nhỏ, vùng chạm đủ lớn, giỏ hàng và form checkout.
- Ưu tiên khả năng đọc giá, chọn sản phẩm, thêm giỏ và đặt hàng hơn hiệu ứng.
- Mọi màn có dữ liệu bất đồng bộ phải có đủ 4 trạng thái: **loading, empty, success, error**. Dùng `loading.tsx`, `error.tsx`, `not-found.tsx` của App Router.
- **Ảnh:** dùng `next/image`, đặt `width/height` hoặc `aspect-ratio` để không nhảy layout, crop nhất quán, `alt` có nghĩa. Dùng ảnh thật do chủ shop cung cấp khi có; ảnh demo phải đánh dấu rõ là demo.
- **Copy tiếng Việt tự nhiên**, ngắn, cụ thể. Không bịa đánh giá, số đơn, chứng nhận, cam kết giao hàng, địa chỉ, thông tin liên hệ. Chính sách chưa được chủ shop xác nhận thì hiển thị chỗ trống "cần bổ sung", không tự viết.
- **Thương hiệu chưa chốt:** dùng design token ngữ nghĩa (`--color-primary`, `--color-surface`, `--font-heading`...) khai báo ở một nơi (`globals.css`/Tailwind config) để đổi dễ. Không trình bày palette/font tạm như nhận diện chính thức.

## 7. Accessibility

- HTML semantic (`header`, `main`, `nav`, `button` cho hành động, `a` cho điều hướng).
- Mọi input có `<label>`; lỗi form gắn với trường (`aria-describedby`) và dễ hiểu.
- Focus nhìn thấy rõ, điều hướng được bằng bàn phím, đóng modal/drawer bằng Esc.
- Contrast đủ; không chỉ dùng màu để truyền đạt trạng thái.

## 8. Styling

- Chỉ dùng Tailwind utility; không dùng `style={{}}` ngẫu nhiên (trừ giá trị thật sự động). Dùng `cn()` trong `lib/utils` để gộp class.
- Không hardcode màu/khoảng cách tùy ý khi đã có token.
- Dùng component của shadcn/ui làm điểm khởi đầu rồi chỉnh theo token, không sao chép cả thư viện.

## 9. SEO và hiệu năng

- Mỗi trang có `generateMetadata` riêng (title, description, Open Graph); canonical và URL ổn định.
- `sitemap.ts`, `robots.ts`. Product structured data (JSON-LD) chỉ dùng trường có thật và phải khớp nội dung hiển thị (giá, tồn kho).
- Tối ưu ảnh, tránh bundle client lớn, tránh JS không cần thiết trên trang sản phẩm. Dùng `/webperf` để audit khi gần launch.

## 10. Chất lượng code

- TypeScript strict; **không dùng `any`**. Dùng type sinh từ Supabase schema thay vì viết tay.
- Một schema Zod dùng chung cho client và server khi có thể; server vẫn validate lại độc lập.
- Props destructure rõ ràng, import tường minh (`@/components/ui/button`).
- Không thêm dependency tùy tiện; ưu tiên thư viện đang có và giải thích khi thêm.
- Chạy `lint`, `typecheck`, `test`, `build` theo scripts thực tế; kiểm tra trên mobile và desktop trước khi báo hoàn thành.

## 11. Trang admin

- Mọi trang `/admin/*` được bảo vệ ở **server** (layout hoặc middleware kiểm tra session + role), không chỉ ẩn link.
- Bảng dữ liệu phải có tìm kiếm/lọc cơ bản, trạng thái rõ ràng; thao tác ghi cần xác nhận khi không thể hoàn tác.
- Màn nhập hàng từ text: ô dán text → **bảng preview chỉnh sửa được** → lưu nháp hoặc xác nhận. Hiển thị rõ dòng "Chưa ghép danh mục", "Giá gợi ý — cần xác nhận", cảnh báo chênh lệch giá sỉ; chặn xác nhận dòng thiếu đơn vị/số lượng. Xem `docs/ADMIN_INVENTORY_TEXT_IMPORT.md`.
- Phân biệt trực quan trạng thái xử lý đơn và trạng thái thanh toán.
- Chi tiết đơn có nút **"Xác nhận đã nhận chuyển khoản và chốt đơn"** (đây là lúc trừ tồn). Nếu server báo không đủ tồn, hiển thị rõ lỗi và giữ nguyên đơn.
- Trang cài đặt cho admin sửa tài khoản nhận tiền, bảng giá ship, ngưỡng hỗ trợ và thông tin liên hệ.
