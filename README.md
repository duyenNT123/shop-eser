# 🌸 Shop Eser — Vibecode Template

Bộ khung và tài liệu hướng dẫn AI (Claude Code) để xây **website bán hoa sáp và hoa lụa Eser** cho thị trường Hà Nội. Repository này **chưa phải website hoàn chỉnh**: nó cung cấp bối cảnh dự án, quy ước, slash command và agent skill để AI đi từ ý tưởng → spec → plan → build → review → ship theo một cách nhất quán.

**Stack:** Next.js (App Router) + TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage) · Vercel. Kiến trúc modular monolith, không có backend riêng (không FastAPI, Celery, RabbitMQ, Redis).

---

## 📂 Cấu trúc thư mục

```
.
├── README.md                    # ← Bạn đang ở đây
├── CLAUDE.md                    # Tóm tắt ngắn, tự nạp mỗi phiên: quy tắc cứng + link
├── AGENTS.md                    # Bối cảnh dự án, phạm vi MVP, quy tắc làm việc của AI (đọc đầu tiên)
├── SHOP_ESER_STACK.md           # Stack, mô hình dữ liệu, luồng đặt hàng, lộ trình, quyết định còn mở
│
├── docs/
│   ├── PRD_TEMPLATE.md                  # Mẫu PRD
│   └── ADMIN_INVENTORY_TEXT_IMPORT.md   # Đặc tả nhập hàng bằng văn bản tự do
│
└── .claude/
    ├── backend/BACKEND_GUIDE.md     # Quy tắc code server-side: Supabase, RLS, đơn hàng, kho
    ├── frontend/FRONTEND_GUIDE.md   # Quy tắc giao diện: Next.js, giỏ hàng, a11y, SEO
    ├── commands/                    # Slash command (*.md)
    └── skills/                      # Agent skill tái sử dụng (*/SKILL.md)
```

Ứng dụng đã được dựng từ **Next.js and Supabase Starter Kit** (Next.js, Tailwind, shadcn/ui, `@supabase/ssr`, đăng nhập mẫu) ở **thư mục gốc**: `app/`, `components/`, `lib/supabase/`, `proxy.ts`. Phần giao diện mẫu của bộ starter (trang chủ, `components/tutorial`) chưa được thay bằng nội dung Eser. Thư mục `supabase/` (migration) chưa có; tạo khi cần theo `SHOP_ESER_STACK.md` mục 2.

---

## 🧭 Các tài liệu cốt lõi

| File | Mục đích | Khi nào đọc |
| --- | --- | --- |
| [`AGENTS.md`](AGENTS.md) | Bối cảnh Eser, phạm vi MVP, 19 nguyên tắc, định nghĩa "hoàn thành" | Mọi task |
| [`SHOP_ESER_STACK.md`](SHOP_ESER_STACK.md) | Stack, schema, luồng đặt đơn, SEO, lộ trình Phase 0–5, quyết định còn mở | Task kiến trúc, dữ liệu, kế hoạch |
| [`.claude/backend/BACKEND_GUIDE.md`](.claude/backend/BACKEND_GUIDE.md) | Server Action, Supabase client, RLS, migration, tạo đơn, tồn kho, upload ảnh, test | Task phía server / database |
| [`.claude/frontend/FRONTEND_GUIDE.md`](.claude/frontend/FRONTEND_GUIDE.md) | Server vs Client Component, giỏ hàng, format tiền, UI, accessibility, SEO | Task giao diện |
| [`docs/ADMIN_INVENTORY_TEXT_IMPORT.md`](docs/ADMIN_INVENTORY_TEXT_IMPORT.md) | Nhập hàng từ ghi chú tiếng Việt → bảng nháp → phiếu nhập | Task admin / kho |

**Nguyên tắc vàng:** đọc `AGENTS.md` và guide liên quan trước khi viết code. Tài liệu là định hướng; **code thực tế là nguồn sự thật** về trạng thái hiện tại. Nếu hai bên lệch nhau, nêu rõ và cập nhật tài liệu.

> Claude Code tự động nạp [`CLAUDE.md`](CLAUDE.md) (bản tóm tắt ngắn: quy tắc cứng + link). `AGENTS.md` và các guide chỉ được đọc khi cần, để giữ ngữ cảnh gọn.

---

## ⚡ Slash Command

Định nghĩa trong [`.claude/commands/`](.claude/commands/). Gõ trong Claude Code để điều khiển quy trình.

| Command | Chức năng | Skill đứng sau |
| --- | --- | --- |
| `/spec` | Viết đặc tả có cấu trúc trước khi code | `spec-driven-development` |
| `/plan` | Chia nhỏ công việc thành task kiểm chứng được, kèm tiêu chí nghiệm thu và thứ tự phụ thuộc → `tasks/plan.md`, `tasks/todo.md` | `planning-and-task-breakdown` |
| `/build` | Làm task kế tiếp (TDD: RED → GREEN → verify → commit), rồi dừng | `incremental-implementation` + `test-driven-development` |
| `/build auto` | Plan + build toàn bộ spec trong một lượt (đã duyệt), mỗi task một commit | như trên |
| `/test` | TDD cho tính năng mới; mẫu **Prove-It** cho sửa bug (tái hiện → sửa → chống hồi quy) | `test-driven-development` |
| `/review` | Review 5 trục: correctness, readability, architecture, security, performance | `code-review-and-quality` |
| `/code-simplify` | Giảm độ phức tạp mà không đổi hành vi | `code-simplification` |
| `/webperf` | Audit hiệu năng web (Deep mode với Lighthouse/CrUX, nếu không thì Quick mode) | persona `web-performance-auditor` |
| `/ship` | Fan-out song song trước release tới 3 persona → quyết định **go/no-go** + kế hoạch rollback | `shipping-and-launch` |

```
/spec  →  /plan  →  /build (lặp)  →  /test  →  /review  →  /ship
                                         ↘  /code-simplify  /webperf  (khi cần)
```

---

## 🛠️ Agent Skill

Nằm trong [`.claude/skills/`](.claude/skills/). Claude tự gọi skill phù hợp, hoặc bạn có thể yêu cầu theo tên.

**Quy trình & bàn giao:** `spec-driven-development` · `planning-and-task-breakdown` · `incremental-implementation` · `test-driven-development` · `shipping-and-launch` · `git-workflow-and-versioning`

**Chất lượng & an toàn:** `code-review-and-quality` · `code-simplification` · `security-and-hardening` · `debugging-and-error-recovery` · `doubt-driven-development` · `performance-optimization`

**Thiết kế & tài liệu:** `api-and-interface-design` · `frontend-ui-engineering` · `browser-testing-with-devtools` · `documentation-and-adrs`

**Tư duy & bối cảnh:** `idea-refine` · `interview-me` · `context-engineering` · `source-driven-development` · `using-agent-skills`

> Một số skill là hướng dẫn chung, không riêng cho Next.js + Supabase. Khi skill và `AGENTS.md`/guide mâu thuẫn, ưu tiên `AGENTS.md` và guide.

---

## 🤖 Agent Persona (chưa có sẵn)

`/ship` và `/webperf` fan-out tới các persona subagent. Template **chưa chứa** thư mục `agents/`; tạo `agents/<name>.md` để bật đầy đủ:

| Persona | Dùng bởi | Vai trò |
| --- | --- | --- |
| `code-reviewer` | `/ship` | Review 5 trục |
| `security-auditor` | `/ship` | Rà OWASP, threat model, CVE |
| `test-engineer` | `/ship` | Phân tích khoảng trống test coverage |
| `web-performance-auditor` | `/webperf` | Bảng điểm hiệu năng + danh sách vấn đề xếp hạng |

---

## 🏁 Bắt đầu

1. **Đọc** [`AGENTS.md`](AGENTS.md) và [`SHOP_ESER_STACK.md`](SHOP_ESER_STACK.md).
2. **Chốt các quyết định còn mở** (`SHOP_ESER_STACK.md` mục 12): logo/palette, domain và liên hệ, thanh toán, phí ship, đổi trả, quy tắc giữ/trừ tồn.
3. **Phase 0 — audit:** kiểm tra repo thực tế (có `package.json`, schema chưa) trước khi dựng gì mới.
4. **Viết PRD:** copy [`docs/PRD_TEMPLATE.md`](docs/PRD_TEMPLATE.md) → `docs/PRD_<tinh-nang>.md` rồi điền.
5. **Chạy quy trình:** `/spec` → `/plan` → `/build` (hoặc `/build auto` sau khi duyệt plan).
6. **Kiểm tra & ship:** `/test` → `/review` → `/ship`.

Lộ trình gợi ý: storefront có dữ liệu → giỏ hàng và đặt đơn → admin cơ bản → launch readiness. Chi tiết ở `SHOP_ESER_STACK.md` mục 11.

---

## 🧱 Tech Stack

- **App:** Next.js App Router · TypeScript strict · Tailwind CSS · shadcn/ui · React Hook Form + Zod (khi cần)
- **Dữ liệu & auth:** Supabase PostgreSQL · Supabase Auth (admin) · Supabase Storage (ảnh) · RLS · migration SQL có version
- **Hosting:** Vercel
- **Chưa chọn:** analytics, email/notification, cổng thanh toán, đơn vị vận chuyển. Không thêm cho tới khi cần.

Chi tiết và quy tắc xuyên suốt → [`AGENTS.md`](AGENTS.md), [`SHOP_ESER_STACK.md`](SHOP_ESER_STACK.md).
