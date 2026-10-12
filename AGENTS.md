# AGENTS.md — Shop Eser

> **Dành cho AI coding agents** (Claude Code, Cursor, Codex và các công cụ tương tự). Đọc file này trước khi lập kế hoạch, tạo hoặc sửa code. Tài liệu stack chi tiết nằm trong [`SHOP_ESER_STACK.md`](./SHOP_ESER_STACK.md); quy tắc code server-side (Supabase, RLS, đơn hàng, kho) nằm trong [`.claude/backend/BACKEND_GUIDE.md`](./.claude/backend/BACKEND_GUIDE.md) và quy tắc giao diện trong [`.claude/frontend/FRONTEND_GUIDE.md`](./.claude/frontend/FRONTEND_GUIDE.md). Nếu repository hiện tại khác với mô tả trong tài liệu, hãy kiểm tra code/config thực tế trước khi hành động và cập nhật tài liệu thay vì giả định.

## 1. Bối cảnh dự án

**Tên dự án:** Shop Eser / Eser Flowers & Gifts  
**Loại sản phẩm:** Website thương mại điện tử bán hoa sáp và hoa lụa, ưu tiên thị trường Hà Nội.  
**Giai đoạn:** MVP bán hàng.  
**Ngôn ngữ giao diện mặc định:** Tiếng Việt.  
**Tiền tệ:** VND; hiển thị số tiền theo định dạng Việt Nam, ví dụ `250.000 ₫`.

Eser là một từ và tên riêng trong tiếng Thổ Nhĩ Kỳ, gắn với ý nghĩa tác phẩm, sản phẩm sáng tạo, dấu ấn và ảnh hưởng. Câu chuyện thương hiệu hiện tại: “Nàng thơ không phải vì nàng là Muse, mà vì nàng là hiện thân của cảm hứng tạo nên một tác phẩm.” Hãy xem đây là định hướng ý nghĩa, không tự ý biến thành slogan chính thức nếu chưa được duyệt.

### Sản phẩm và mức giá tham chiếu

- Hoa sáp, hoa lụa; mẫu và biến thể cụ thể sẽ được bổ sung dần.
- Kênh offline ở khu vực riêng: mức giá dự kiến 100.000–150.000 ₫.
- Bán online tại Hà Nội: mức giá dự kiến 250.000–500.000 ₫.
- Đây là mức giá tham chiếu theo kênh, **không phải quy tắc giá cứng**. Giá bán phải lấy từ dữ liệu sản phẩm; không tự suy ra giá từ tên hoặc loại hoa.
- Đã chốt: MVP chuyển khoản thủ công; chỉ trừ tồn khi admin xác nhận có bill chuyển khoản và chốt đơn; phí ship tính theo khoảng cách trong phạm vi khoảng 20 km (ngoài thì "Liên hệ shop") kèm chính sách hỗ trợ ship (xem `SHOP_ESER_STACK.md` mục 6).
- Chưa xác định địa chỉ shop vật lý, chính sách đổi trả, tài khoản nhận tiền (bổ sung sau, admin sửa được), bảng giá ship theo km, domain, logo, bảng màu và bộ nhận diện cuối cùng.

## 2. Mục tiêu và phạm vi

### MVP cần hỗ trợ

1. Giới thiệu thương hiệu và sản phẩm rõ ràng, có hình ảnh tốt.
2. Duyệt danh mục, xem trang chi tiết sản phẩm, giá, ảnh, tình trạng còn hàng và thông tin biến thể nếu có.
3. Thêm vào giỏ hàng, cập nhật số lượng, nhập thông tin nhận hàng và gửi đơn.
4. Cho khách lựa chọn phương thức thanh toán chỉ khi phương thức đó đã được cấu hình và xác nhận; nếu chưa có tích hợp thanh toán, hỗ trợ luồng COD/chuyển khoản thủ công có ghi rõ trạng thái, không giả lập thanh toán thành công.
5. Có trang quản trị được bảo vệ để tạo/sửa/ẩn sản phẩm, cập nhật giá và số lượng tồn cơ bản, xem và cập nhật trạng thái đơn.
6. Có các trang nội dung tối thiểu: Trang chủ, Cửa hàng/danh mục, Chi tiết sản phẩm, Giỏ hàng, Thanh toán/đặt hàng, Xác nhận đơn, Liên hệ và các trang chính sách cần thiết khi chính sách đã được chủ shop cung cấp.
7. SEO nền tảng: metadata theo trang, URL dễ đọc, sitemap, robots, Open Graph và dữ liệu có cấu trúc phù hợp khi đủ dữ liệu.

### Không thuộc MVP trừ khi được yêu cầu rõ

- Đồng bộ đa kênh TikTok/Facebook/Instagram.
- CRM/loyalty, điểm thưởng, thành viên, tài khoản khách hàng bắt buộc.
- Theo dõi hành trình vận chuyển realtime.
- Tự động đối soát ngân hàng, cổng thanh toán, vận chuyển hoặc hoàn hàng.
- Hệ thống kế toán đầy đủ, báo cáo lợi nhuận nâng cao.
- Khóa đào tạo, chứng chỉ, đặt workshop, marketplace hoặc đa cửa hàng.
- Tính năng AI tạo nội dung, chatbot hoặc AI recommendation phức tạp.

Có thể thiết kế code để mở rộng về sau, nhưng không xây sẵn các module này khi chưa có yêu cầu và dữ liệu thực tế.

## 3. Nguyên tắc làm việc của AI

1. **Khảo sát trước khi sửa:** kiểm tra cây thư mục, `package.json`, lockfile, biến môi trường mẫu, schema/database, route và component hiện có. Không giả định repository trống.
2. **Tài liệu là nguồn định hướng, code thực tế là nguồn sự thật về trạng thái hiện tại.** Nếu phát hiện khác biệt, nêu rõ và đề xuất cập nhật tài liệu.
3. **Không dựng quá mức:** ưu tiên MVP đơn giản, triển khai được, ít dịch vụ vận hành. Không thêm microservices, queue, Redis, backend riêng hoặc hệ thống event khi chưa chứng minh nhu cầu.
4. **Không tự chốt thương hiệu:** logo, font, palette, art direction, slogan, chính sách đổi trả/giao hàng và các cam kết sản phẩm đang ở trạng thái chưa xác định. Dùng token tạm có tên ngữ nghĩa để dễ thay đổi; không trình bày giả định như quyết định đã duyệt.
5. **Không bịa dữ liệu:** không tự tạo đánh giá khách hàng, số đơn, số năm kinh nghiệm, chứng nhận, cam kết giao hàng, địa chỉ hoặc thông tin liên hệ. Dữ liệu demo phải được đánh dấu rõ là demo.
6. **Ưu tiên tiếng Việt tự nhiên:** copy ngắn, cụ thể, hướng đến lợi ích và hỗ trợ quyết định mua; tránh nội dung sáo rỗng, phóng đại hoặc quá nhiều mỹ từ.
7. **Mobile-first:** trải nghiệm trên điện thoại là ưu tiên vì khách có thể đến từ social. Kiểm tra responsive ở màn nhỏ, thao tác chạm, ảnh, giỏ hàng và form checkout.
8. **Accessibility:** HTML semantic, label cho form, focus rõ, keyboard navigation, contrast đủ, alt text có ý nghĩa và thông báo lỗi dễ hiểu.
9. **Bảo mật:** quyền admin phải được xác minh ở server/database, không chỉ ẩn nút trên UI. Không đưa service-role key hoặc secret vào client. Validate input ở server và kiểm tra quyền với mọi thao tác ghi.
10. **Dữ liệu tiền và tồn kho:** dùng số nguyên VND, tránh floating-point cho tiền. Không tin giá/tổng tiền do client gửi; tính lại phía server từ dữ liệu sản phẩm hiện hành. Kiểm tra tồn kho khi đặt đơn và tránh trừ tồn hai lần.
11. **Trạng thái đơn minh bạch:** phân biệt đơn được tạo, chờ xác nhận, đã xác nhận, đang chuẩn bị, đang giao, hoàn thành, đã hủy và trạng thái thanh toán. Chỉ dùng trạng thái thật mà hệ thống có thể chứng minh.
12. **Không giả lập tích hợp:** không hiển thị “đã thanh toán”, “đã gửi vận chuyển” hoặc “đã hoàn tiền” nếu không có xác nhận thực từ provider hoặc người quản trị.
13. **Làm từng phần nhỏ:** trước khi code, xác định mục tiêu, phạm vi, file ảnh hưởng, tiêu chí nghiệm thu và cách test. Tránh refactor ngoài phạm vi.
14. **Kiểm chứng:** chạy lint, typecheck, test và build phù hợp với script thực tế trong repository. Nếu không chạy được, nói rõ nguyên nhân; không tuyên bố đã test thành công.
15. **Không thêm dependency tùy tiện:** ưu tiên thư viện đang có. Nếu thêm package, giải thích lý do và cập nhật lockfile.
16. **Nhập hàng từ text:** coi parser là bước hỗ trợ nhập liệu, không phải nguồn sự thật. Luôn hiển thị bảng preview có thể sửa trước khi lưu; ghi lại văn bản gốc; đánh dấu mặt hàng/đơn vị/giá chưa chắc chắn. Không tự tạo mặt hàng trùng, không tự ghi đè giá sỉ/lẻ và không tăng tồn từ phiếu nháp.
17. **Tách giá:** giá sỉ tham chiếu, giá bán lẻ và đơn giá nhập thực tế của từng lần mua là các khái niệm riêng. Giá ghi trong ghi chú mua hàng chỉ là giá nhập của phiếu đó trừ khi admin chủ động chọn cập nhật danh mục.
18. **Giao dịch kho an toàn:** chỉ cập nhật tồn khi phiếu nhập được xác nhận hàng thực nhận; thao tác xác nhận phải nguyên tử/idempotent để tránh cộng tồn hai lần.
19. **Giữ tài liệu đồng bộ:** cập nhật `SHOP_ESER_STACK.md` hoặc tài liệu liên quan khi thay đổi kiến trúc, schema, tích hợp hoặc quyết định sản phẩm.

## 4. Quy ước trải nghiệm và nội dung

- Tôn trọng định hướng Eser là hoa nghệ thuật/tác phẩm, nhưng ưu tiên khả năng hiểu sản phẩm và mua hàng trước storytelling dài.
- Mỗi sản phẩm bán online nên có: tên, slug, loại hoa (hoa sáp/hoa lụa), giá bán, ảnh, mô tả, tình trạng bán, số lượng tồn nếu quản lý tồn, và thông tin biến thể khi cần.
- Danh mục vật tư nội bộ có thể bao gồm giấy gói, hoa, lá, keo, dụng cụ và phụ kiện; không mặc định mọi vật tư đều là sản phẩm storefront.
- Admin có thể dán ghi chú nhập hàng như `Giấy xé vân đá: Hồng phấn 3 sấp, Xanh baby 3 sấp (35k/1 sấp)`. Hệ thống phải chuyển thành các dòng nhập nháp có tên, màu, số lượng, đơn vị, đơn giá và thành tiền để review. Đặc tả chi tiết nằm ở `docs/ADMIN_INVENTORY_TEXT_IMPORT.md`.
- Ảnh phải có tỷ lệ và cách crop nhất quán; tránh layout nhảy khi ảnh tải. Dùng ảnh thật do chủ shop cung cấp khi có; không tự nhận ảnh AI/stock là ảnh sản phẩm thực tế.
- Thông tin giao hàng, thời gian chuẩn bị, đổi trả và thanh toán chỉ hiển thị khi đã được chủ shop xác nhận. Nếu chưa có, đánh dấu nội dung cần bổ sung thay vì tự đặt chính sách.
- Không tạo tài khoản khách hàng bắt buộc trong MVP nếu chưa có lý do rõ ràng. Checkout khách vãng lai được ưu tiên.
- Không để một thiết kế đẹp làm giảm khả năng đọc giá, chọn sản phẩm, thêm giỏ và hoàn tất đặt hàng.

## 5. Quy trình thực hiện task

Với task nhỏ: kiểm tra file liên quan → sửa tối thiểu → chạy kiểm tra thích hợp → tóm tắt thay đổi và phần chưa xác minh.

Với feature hoặc thay đổi kiến trúc:

1. Nêu mục tiêu và user flow.
2. Liệt kê quyết định đã biết, giả định và câu hỏi chặn tiến độ.
3. Đề xuất thay đổi nhỏ nhất đáp ứng MVP.
4. Xác định dữ liệu, quyền truy cập, trạng thái lỗi và tiêu chí nghiệm thu.
5. Triển khai theo từng phần có thể kiểm tra.
6. Kiểm tra responsive, accessibility, validation, quyền truy cập và trường hợp lỗi.
7. Cập nhật tài liệu nếu cần.

Chỉ hỏi người dùng khi thiếu thông tin có thể làm thay đổi đáng kể kiến trúc, trải nghiệm, chính sách kinh doanh hoặc gây rủi ro dữ liệu. Với chi tiết không chặn tiến độ, chọn phương án đơn giản, dễ đảo ngược và ghi rõ đó là giả định.

## 6. Định nghĩa hoàn thành

Một task chỉ được xem là hoàn thành khi:

- Đáp ứng tiêu chí nghiệm thu đã thống nhất.
- Không có lỗi type/lint/build mới mà chưa giải thích.
- Các trạng thái loading, empty, success và error quan trọng được xử lý.
- Giao diện hoạt động trên mobile và desktop.
- Không để lộ secrets hoặc bỏ qua kiểm tra quyền.
- Các thao tác mua hàng, giá, tồn kho và trạng thái đơn không dựa vào dữ liệu client không đáng tin.
- Có tóm tắt file thay đổi, cách kiểm tra và các giới hạn còn lại.

## Nạp danh mục và kho

- Danh mục nguyên liệu phải hỗ trợ nhập trực tiếp, import CSV/XLSX và OCR ảnh theo từng giai đoạn. Cả ba phương thức phải dùng chung validation, chuẩn hóa, phát hiện trùng và màn hình preview; không ghi chính thức trước khi admin xác nhận.
- OCR ảnh bảng giá không đồng nghĩa với phiếu nhập kho. Admin phải chọn rõ mục đích; không tăng tồn từ form, import danh mục, OCR hoặc phiếu nháp.
- Thứ tự MVP: P0 danh mục nhập trực tiếp → P1 nhập nhanh bằng text và phiếu nhập → P2 CSV/XLSX → P3 OCR ảnh. Trì hoãn Google Sheets API trực tiếp và AI parser nâng cao cho tới khi có dữ liệu thực tế chứng minh cần thiết.
