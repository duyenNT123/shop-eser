# Shop Eser — CLAUDE.md

Website bán hoa sáp và hoa lụa Eser (Hà Nội), giao diện tiếng Việt, tiền VND. Giai đoạn MVP. Repo hiện là bộ khung/tài liệu, chưa có code ứng dụng: kiểm tra code thực tế trước khi giả định.

**Stack:** Next.js App Router + TypeScript strict · Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage) · Vercel. Modular monolith. Không FastAPI, Celery, RabbitMQ, Redis, NextAuth.

## Đọc khi cần (không nạp hết mỗi lần)
- Bối cảnh, phạm vi MVP, nguyên tắc đầy đủ: @AGENTS.md
- Stack, schema, luồng đặt đơn, ship, quyết định còn mở: @SHOP_ESER_STACK.md
- Code server (Supabase, RLS, đơn, kho): .claude/backend/BACKEND_GUIDE.md
- Code giao diện: .claude/frontend/FRONTEND_GUIDE.md
- Nhập hàng từ text: docs/ADMIN_INVENTORY_TEXT_IMPORT.md

## Quy tắc cứng
1. Tiền là **số nguyên VND**, không float. Format qua một helper duy nhất (`250.000 ₫`).
2. **Server tự tính lại** giá, phí ship, tổng tiền và tồn kho. Không tin số liệu client gửi.
3. Bật **RLS** cho bảng truy cập được từ client. Quyền admin kiểm tra ở server/database, không chỉ ẩn UI.
4. `SUPABASE_SERVICE_ROLE_KEY` chỉ ở server, không prefix `NEXT_PUBLIC_`, không log.
5. Mọi thay đổi schema là một file migration trong `supabase/migrations/`.
6. **Chỉ trừ tồn khi admin xác nhận có bill chuyển khoản và chốt đơn** (transaction, có điều kiện, idempotent). Đặt đơn không giữ hàng. Hủy đơn đã trừ thì hoàn đúng một lần; gửi đơn lặp không tạo hai đơn.
7. Thanh toán MVP: chuyển khoản thủ công. Không tự đánh dấu "đã thanh toán"; chỉ admin xác nhận. Tài khoản nhận tiền nằm trong cài đặt admin, không hardcode, không bịa.
8. **Phiếu nháp, import, OCR không đổi tồn.** Chỉ "xác nhận đã nhận hàng" mới cộng tồn, và chạy một lần (idempotent). Luôn có bảng preview chỉnh sửa trước khi ghi.
9. Giá sỉ tham chiếu, giá bán lẻ và giá nhập thực tế (`unit_cost_vnd`) là ba trường riêng.
10. **Không bịa dữ liệu:** review, số đơn, địa chỉ, liên hệ, số tài khoản, chính sách. Dữ liệu demo phải đánh dấu rõ là demo. Không tự chốt logo, palette, slogan.

## Chính sách đã chốt
- Ship theo khoảng cách, không có phí gốc; phục vụ khoảng 20 km, ngoài thì hiển thị "Liên hệ shop". Tiền hàng < 399k: khách chịu ship; ≥ 399k: hỗ trợ 20k; ≥ 599k: hỗ trợ 50k (tối đa bằng phí ship thực tế). Hỏa tốc: khách trả phần phát sinh. Mọi ngưỡng/bảng giá là cấu hình, tính ở một hàm server duy nhất.
- Chi tiết, giả định và phần chưa chốt: SHOP_ESER_STACK.md mục 6 và 12.

## Cách làm việc
- Mobile-first, a11y, đủ 4 trạng thái loading/empty/success/error. Mặc định Server Component.
- Làm từng phần nhỏ: `/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship`.
- Chạy `lint`, `typecheck`, `test`, `build` theo `package.json` thật. Không chạy được thì nói rõ, không tuyên bố đã test.
- Không thêm dependency hoặc dịch vụ khi chưa cần. Giữ tài liệu đồng bộ khi đổi kiến trúc hoặc quyết định.
