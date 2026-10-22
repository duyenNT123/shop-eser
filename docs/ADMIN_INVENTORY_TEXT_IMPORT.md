# Shop Eser — Đặc tả nhập hàng bằng văn bản tự do

**Trạng thái:** Yêu cầu sản phẩm đã ghi nhận; chi tiết UI và parser cần kiểm thử bằng dữ liệu thực tế.  
**Phạm vi:** Admin MVP — nhập danh sách nguyên liệu/phụ kiện từ text, chuẩn hóa thành dòng hàng và tạo phiếu nhập nháp.  
**Không thuộc phạm vi:** Tự đặt hàng với nhà cung cấp, tự thanh toán, hoặc tự ghi tăng tồn kho trước khi người quản trị xác nhận hàng thực nhận.

## 1. Mục tiêu

Người quản trị có thể dán một ghi chú nhập hàng bằng tiếng Việt, ví dụ:

> Giấy xé vân đá: Hồng phấn 3 sấp, Xanh baby 3 sấp, Xanh cốm 2 xấp, Đen 1 sấp, trắng 1 sấp (35k/1 sấp)

Hệ thống phân tích nội dung thành các dòng có cấu trúc gồm tên mặt hàng, màu/biến thể, số lượng, đơn vị, đơn giá nhập và thành tiền; ghép với danh mục sản phẩm/nguyên liệu đã được nhập trước đó; sau đó tạo **phiếu nhập hàng nháp** để admin rà soát và xác nhận.

## 2. Dữ liệu danh mục nhập trước

Admin có thể tạo hoặc import danh mục từ form/bảng hoặc ảnh tham chiếu được người dùng cung cấp. Mỗi mặt hàng nên hỗ trợ:

- Tên chuẩn, SKU/mã nội bộ nếu có.
- Nhóm hàng: hoa, lá, giấy gói, phụ kiện, dụng cụ, vật tư khác.
- Loại/nhãn hàng và mô tả.
- Màu sắc hoặc biến thể.
- Đơn vị quản lý chuẩn, ví dụ: bó, cành, bông, hộp, sấp, cuộn, túi, chiếc.
- Đơn giá nhập tham chiếu/giá sỉ.
- Giá bán lẻ nếu mặt hàng có bán lẻ.
- Ảnh minh họa (không bắt buộc với nguyên liệu nội bộ).
- Nhà cung cấp mặc định (nếu đã biết).
- Trạng thái đang sử dụng/ngừng sử dụng.

**Không coi giá sỉ, giá lẻ và giá nhập thực tế là một trường duy nhất:**

- `wholesale_price_vnd`: giá sỉ tham chiếu trong danh mục, nếu có.
- `retail_price_vnd`: giá bán lẻ, nếu có.
- `unit_cost_vnd` trên từng dòng phiếu nhập: đơn giá nhập thực tế của lần mua này.

Giá ghi trong đoạn text nhập hàng được hiểu là **đơn giá nhập của phiếu hiện tại**. Nếu khác giá sỉ tham chiếu, hiển thị cảnh báo chênh lệch để admin xác nhận. Không tự động ghi đè giá bán lẻ hoặc giá sỉ trong danh mục.

## 3. Luồng sử dụng

1. Admin đăng nhập và mở **Kho → Nhập hàng → Nhập nhanh bằng văn bản**.
2. Dán nội dung ghi chú mua hàng vào ô text nhiều dòng.
3. Chọn nhà cung cấp nếu biết; có thể để trống nếu chưa xác định.
4. Chọn **Phân tích nội dung**.
5. Hệ thống trả về bảng xem trước, không ghi dữ liệu chính thức ngay:
   - Tên mặt hàng chuẩn
   - Nhóm hàng
   - Màu/biến thể
   - Số lượng
   - Đơn vị
   - Đơn giá nhập
   - Thành tiền
   - Mức độ khớp danh mục/cảnh báo
6. Admin sửa trực tiếp dòng sai, chọn mặt hàng/biến thể phù hợp hoặc tạo mục danh mục mới nếu có quyền.
7. Hệ thống hiển thị tổng số lượng theo dòng và tổng tiền phiếu nhập.
8. Admin lưu thành **phiếu nháp** hoặc **xác nhận nhập hàng**.
9. Chỉ khi admin xác nhận hàng đã nhận, hệ thống mới ghi giao dịch kho và cập nhật tồn kho. Phiếu nháp không làm thay đổi tồn.
10. Lưu văn bản gốc, kết quả đã chuẩn hóa, người tạo, thời điểm, trạng thái và lịch sử chỉnh sửa để truy vết.

## 4. Quy tắc phân tích

- Phải hỗ trợ tiếng Việt có dấu/không dấu ở mức hợp lý, dấu phẩy, dấu chấm phẩy, xuống dòng và dấu ngoặc.
- Ví dụ `35k`, `35 K`, `35.000đ`, `35.000/1 sấp` có thể chuẩn hóa về 35.000 VND khi ngữ cảnh rõ ràng.
- Tách tên mặt hàng và các biến thể theo cấu trúc `Tên mặt hàng: Màu A số lượng đơn vị, Màu B số lượng đơn vị`.
- Phân tích đơn vị từ dữ liệu danh mục và từ văn bản. Những từ như `sấp`/`xấp` có thể là cách viết khác nhau; chỉ chuẩn hóa thành một đơn vị khi admin đã cấu hình alias hoặc xác nhận trong màn xem trước.
- Không tự suy ra màu, đơn vị, số lượng, đơn giá hoặc mặt hàng còn thiếu.
- Nếu có nhiều cách hiểu, để trường chưa xác định và yêu cầu admin sửa; không tự chọn một kết quả có rủi ro làm sai tiền hoặc tồn kho.
- Nếu không tìm được mặt hàng khớp, đánh dấu **Chưa ghép danh mục**. Không âm thầm tạo sản phẩm trùng lặp.
- Nếu không có đơn giá trong text, dùng giá nhập tham chiếu từ danh mục làm gợi ý nhưng phải đánh dấu **Giá gợi ý — cần xác nhận**. Không coi đó là giá mua thực tế đã xác minh.
- Nếu số lượng không có đơn vị hoặc đơn vị không tương thích, chặn xác nhận dòng cho tới khi admin sửa.
- Tất cả giá trị tiền lưu bằng số nguyên VND. `line_total_vnd = quantity × unit_cost_vnd`; tính ở server và kiểm tra lại trước khi lưu.
- Chuẩn hóa viết hoa/viết thường để tìm kiếm, nhưng giữ nguyên tên gốc trong bản ghi nguồn.
- Không dùng kết quả do mô hình AI sinh ra như dữ liệu đã được xác minh. Luôn có bước review trước khi ghi dữ liệu.

## 5. Ví dụ kết quả mong đợi

Với văn bản:

`Giấy xé vân đá: Hồng phấn 3 sấp, Xanh baby 3 sấp, Xanh cốm 2 xấp, Đen 1 sấp, trắng 1 sấp (35k/1 sấp)`

Kết quả xem trước kỳ vọng:

| Mặt hàng | Màu | Số lượng | Đơn vị | Đơn giá nhập | Thành tiền |
|---|---|---:|---|---:|---:|
| Giấy xé vân đá | Hồng phấn | 3 | sấp | 35.000 ₫ | 105.000 ₫ |
| Giấy xé vân đá | Xanh baby | 3 | sấp | 35.000 ₫ | 105.000 ₫ |
| Giấy xé vân đá | Xanh cốm | 2 | sấp/xấp cần chuẩn hóa | 35.000 ₫ | 70.000 ₫ |
| Giấy xé vân đá | Đen | 1 | sấp | 35.000 ₫ | 35.000 ₫ |
| Giấy xé vân đá | Trắng | 1 | sấp | 35.000 ₫ | 35.000 ₫ |
| **Tổng** | | **10** | | | **350.000 ₫** |

Dòng Xanh cốm cần xác nhận đơn vị nếu danh mục chưa khai báo `xấp` là alias của `sấp`. Bảng trên là kết quả minh họa; không được bỏ qua bước xác nhận này trong sản phẩm thật.

## 6. Mô hình dữ liệu gợi ý

Tùy schema hiện tại, dùng hoặc mở rộng các bảng tương đương; không tạo bảng trùng chỉ vì tên khác.

### `inventory_items` (hoặc danh mục vật tư dùng chung)

- `id`, `sku`, `name`, `normalized_name`
- `item_group` (flower, foliage, wrapping_paper, accessory, tool, other)
- `variant_attributes`/bảng biến thể, bao gồm màu sắc
- `base_unit`, `unit_aliases`
- `wholesale_price_vnd` nullable
- `retail_price_vnd` nullable
- `default_supplier_id` nullable
- `image_url` nullable, `is_active`, timestamps

Nếu một sản phẩm được bán trên storefront, liên kết với `products` hoặc mô hình sản phẩm phù hợp; không bắt buộc đưa mọi vật tư nội bộ lên cửa hàng online.

### `purchase_orders`

- `id`, `code`, `supplier_id` nullable
- `source_text`
- `status`: `draft`, `received`, `cancelled`
- `subtotal_vnd`, `notes`, `created_by`, `created_at`, `received_at`

### `purchase_order_lines`

- `id`, `purchase_order_id`
- `inventory_item_id` nullable trong giai đoạn nháp khi chưa ghép danh mục
- `item_name_snapshot`, `variant_snapshot` (ví dụ màu)
- `quantity`, `unit`
- `unit_cost_vnd`, `line_total_vnd`
- `match_status`: `matched`, `needs_review`, `unmatched`
- timestamps

### `inventory_transactions`

- `id`, `inventory_item_id`, variant reference nếu có
- `transaction_type`: `purchase_received`, `adjustment`, `sale`, `return`
- `quantity_delta`, `unit_cost_vnd` nullable
- `reference_type`, `reference_id`, `created_by`, `created_at`

Tồn kho được tính/cập nhật bằng transaction an toàn ở server khi phiếu chuyển sang `received`. Tránh tăng tồn lặp nếu admin nhấn xác nhận nhiều lần; chuyển trạng thái và ghi transaction phải nguyên tử/idempotent.

## 7. Yêu cầu UI/UX

- Ô nhập text lớn, có ví dụ định dạng ngay trong placeholder hoặc helper text.
- Nút chính: **Phân tích nội dung**.
- Khu vực xem trước có thể chỉnh sửa inline.
- Trạng thái rõ: Đã khớp, Cần kiểm tra, Chưa tìm thấy, Đơn vị chưa rõ, Giá chênh lệch.
- Hiển thị tổng tiền và tổng số dòng; làm rõ đây là **tổng tiền dự kiến** trước khi xác nhận.
- Hỗ trợ thêm/xóa dòng và chọn từ danh mục hiện có.
- Cho phép lưu nháp để xử lý sau.
- Không yêu cầu admin gõ lại dữ liệu đã parse nếu chỉ cần sửa một vài trường.
- Giao diện responsive, nhưng tối ưu thao tác nhập liệu trên desktop.
- Có thông báo lỗi cụ thể, giữ lại văn bản gốc nếu phân tích thất bại.

## 8. Tiêu chí nghiệm thu

1. Với ví dụ ở trên, hệ thống tạo được 5 dòng theo màu, số lượng và đơn giá.
2. Tổng tiền được tính đúng là 350.000 VND khi mọi đơn vị đã được xác nhận tương thích.
3. Không tự tạo sản phẩm trùng khi tên mặt hàng đã có trong danh mục.
4. Không tự ghi đè giá sỉ/lẻ khi đơn giá nhập trong text khác danh mục.
5. Dòng thiếu đơn giá/đơn vị hoặc không khớp danh mục được đánh dấu để review.
6. Lưu nháp không thay đổi tồn kho.
7. Xác nhận nhận hàng chỉ tăng tồn đúng một lần, kể cả khi request bị gửi lặp.
8. Chỉ admin đã xác thực được phân tích/lưu/xác nhận phiếu nhập.
9. Có test cho parse tiếng Việt, định dạng giá, đơn vị, dòng lỗi, tính tổng, quyền truy cập và chống ghi tồn lặp.
10. Không khẳng định parser hỗ trợ mọi cách viết; bổ sung test dựa trên ghi chú nhập hàng thực tế của Eser.


## 9. Nạp danh mục nguyên liệu ban đầu — ba phương thức

Eser cần hỗ trợ đồng thời ba cách tạo danh mục. Cả ba phải đưa dữ liệu qua **cùng một lớp chuẩn hóa và cùng màn hình rà soát**, tránh tạo ba luồng dữ liệu khác nhau.

### 9.1 Nhập trực tiếp trên admin — triển khai đầu tiên

Admin tạo một mặt hàng bằng form gồm tên chuẩn, nhóm hàng, đơn vị cơ sở, màu/biến thể, SKU tùy chọn, giá nhập tham chiếu, giá sỉ, giá lẻ, ảnh và nhà cung cấp mặc định nếu có.

- Cho phép lưu nháp khi chưa đủ thông tin.
- Không bắt buộc mọi trường giá nếu mặt hàng là nguyên liệu nội bộ hoặc chưa có giá bán.
- Cho phép thêm nhiều màu/biến thể trong cùng một mặt hàng.
- Ảnh có thể tải lên hoặc thêm URL ảnh hợp lệ; không bắt buộc phải có ảnh với mọi vật tư.
- Kiểm tra khả năng trùng tên + nhóm hàng + thuộc tính biến thể; gợi ý bản ghi hiện có thay vì tạo trùng.

### 9.2 Import bảng tính — triển khai thứ hai

Hỗ trợ `.xlsx` và `.csv` trước; Google Sheets có thể được hỗ trợ bằng cách tải xuống CSV/XLSX ở MVP, chưa cần tích hợp OAuth/API trực tiếp.

Luồng đề xuất:
1. Tải file hoặc dùng file mẫu do Eser cung cấp.
2. Chọn sheet và ánh xạ cột nếu tên cột khác mẫu.
3. Xem trước dữ liệu đã đọc, chỉ ra cột thiếu hoặc kiểu dữ liệu không hợp lệ.
4. Chuẩn hóa tên nhóm hàng, đơn vị, màu, số lượng và giá trị tiền.
5. Kiểm tra trùng lặp với danh mục hiện có.
6. Hiển thị các dòng hợp lệ, cảnh báo và lỗi; cho phép sửa hoặc bỏ qua dòng lỗi.
7. Xác nhận import; lưu báo cáo kết quả gồm số dòng thêm mới, cập nhật, bỏ qua và lỗi.

Quy tắc:
- Không mặc định import sẽ ghi đè bản ghi hiện có.
- Mặc định là **chỉ thêm mới**; nếu trùng, đánh dấu để người dùng chọn bỏ qua hoặc cập nhật.
- Import danh mục sản phẩm không đồng nghĩa với nhập kho. Chỉ tạo/ cập nhật danh mục; không thay đổi tồn kho nếu file không được chỉ định rõ là file kiểm kê và admin không xác nhận thao tác riêng.
- Cột ảnh có thể là URL; xử lý tải ảnh về storage chỉ khi người dùng chọn và hệ thống có thể xác thực URL an toàn. Không tự fetch URL nội bộ/private.
- Giá được parse thành số nguyên VND, không lưu chuỗi hiển thị làm nguồn dữ liệu.
- Có giới hạn dung lượng file, xác thực MIME/đuôi file và xử lý an toàn nội dung bảng tính.

### 9.3 OCR từ ảnh chụp — triển khai thứ ba

Admin tải ảnh chụp bảng giá, danh sách hàng hoặc ghi chú nhà cung cấp. OCR trích xuất text; sau đó cùng pipeline parser phân tích thành các trường chuẩn và hiển thị bản xem trước.

Luồng:
1. Tải ảnh (JPG, PNG, WEBP; giới hạn kích thước cấu hình được).
2. Hiển thị ảnh nguồn và trạng thái OCR.
3. Trích xuất văn bản có thể chỉnh sửa; giữ liên kết tới ảnh gốc.
4. Chuyển văn bản qua parser dùng chung.
5. Hiển thị các dòng dữ liệu cùng mức tin cậy/cảnh báo, nếu nhà cung cấp OCR có cung cấp confidence.
6. Admin sửa lỗi OCR, kiểm tra giá, đơn vị, màu sắc và tên hàng.
7. Xác nhận lưu danh mục hoặc tạo phiếu nhập tùy mục đích đã chọn.

Ranh giới an toàn:
- OCR không phải nguồn dữ liệu đáng tin tuyệt đối; không tự lưu dữ liệu chưa review.
- Nếu ảnh chỉ là bảng giá, không tạo phiếu nhập và không tăng tồn kho.
- Trước khi xử lý, admin chọn một trong hai mục đích: **Nạp/cập nhật danh mục** hoặc **Tạo phiếu nhập nháp**. Không suy đoán mục đích từ ảnh.
- Nếu OCR không đọc rõ số hoặc đơn vị, đánh dấu cần kiểm tra; không tự sửa thành giá trị gần đúng.
- Lưu dấu vết file ảnh, text OCR, người tải, thời điểm và kết quả được xác nhận theo chính sách lưu trữ của Eser.

## 10. Kiến trúc dùng chung cho ba phương thức

Ba đầu vào phải hội tụ về cùng mô hình dữ liệu:

- `manual_entry` → dữ liệu form → validator/normalizer.
- `spreadsheet_import` → reader + column mapper → validator/normalizer.
- `image_ocr` → OCR adapter → text extraction → parser → validator/normalizer.

Sau bước chuẩn hóa:
1. Kiểm tra bắt buộc và kiểu dữ liệu.
2. Chuẩn hóa alias nhóm hàng, đơn vị, màu sắc và định dạng tiền.
3. Đối chiếu danh mục hiện có và phát hiện trùng.
4. Trả kết quả preview với lỗi/cảnh báo.
5. Chỉ ghi dữ liệu khi admin xác nhận.
6. Ghi audit log cho import/OCR và những cập nhật quan trọng.

Không gắn chặt nghiệp vụ với một nhà cung cấp OCR hoặc một thư viện parser cụ thể. Bọc OCR sau interface/adapter để có thể thay thế sau này. Không cần triển khai AI/LLM cho mọi bước: dùng parser quy tắc cho định dạng rõ ràng; chỉ cân nhắc mô hình AI khi dữ liệu tự do khó phân tích, và vẫn bắt buộc preview.

## 11. Thứ tự triển khai MVP và điều kiện hoàn thành

### P0 — Nền tảng danh mục và nhập trực tiếp
- Schema danh mục, nhóm hàng, đơn vị, biến thể/màu và các loại giá riêng biệt.
- Form admin tạo/sửa/xem danh mục.
- Kiểm tra trùng và alias đơn vị.
- Phân quyền admin, validation server và audit cơ bản.
- Chưa yêu cầu OCR hay import.

**Hoàn thành khi:** admin tạo và sửa được mặt hàng/biến thể; dữ liệu không trùng do nhập lặp đơn giản; không làm thay đổi tồn kho ngoài ý muốn.

### P1 — Phiếu nhập + nhập nhanh bằng text
- Ô text nhiều dòng, parse thành các dòng xem trước.
- Ghép danh mục, chỉnh sửa inline, lưu nháp.
- Phiếu nhập, xác nhận nhận hàng và inventory transaction idempotent.
- Bộ test cho cách viết thực tế của Eser.

**Hoàn thành khi:** ví dụ giấy xé vân đá được tách đúng 5 dòng; tổng tiền 350.000 VND khi đơn vị được xác nhận; phiếu nháp không tăng tồn; xác nhận chỉ tăng tồn một lần.

### P2 — Import CSV/XLSX
- Tải file mẫu.
- Mapping cột và preview.
- Kiểm tra lỗi, trùng, cập nhật có xác nhận.
- Báo cáo kết quả import.
- Import danh mục tách biệt với nhập kho.

**Hoàn thành khi:** file có dòng lỗi không làm hỏng các dòng hợp lệ; người dùng thấy rõ dòng nào thêm mới/bỏ qua/lỗi; import lặp không tự tạo hàng loạt bản ghi trùng.

### P3 — OCR ảnh
- Upload và lưu ảnh an toàn.
- OCR adapter, trích xuất text, chỉnh sửa text.
- Preview dữ liệu chuẩn hóa và bước xác nhận.
- Theo dõi lỗi OCR, confidence nếu khả dụng, giới hạn chi phí xử lý.
- Chọn rõ mục đích nạp danh mục hay tạo phiếu nhập nháp.

**Hoàn thành khi:** ảnh bảng giá có thể chuyển thành dữ liệu nháp để review; không có dữ liệu OCR nào được ghi chính thức hoặc làm tăng tồn trước khi admin xác nhận.

### P4 — Tối ưu sau khi có dữ liệu thực tế
- Thống kê lỗi parser/OCR và loại dữ liệu thường gặp.
- Bổ sung alias và test dựa trên file/ảnh thật.
- Cân nhắc tích hợp Google Sheets API nếu lợi ích đủ lớn.
- Cân nhắc gợi ý cập nhật giá tham chiếu theo lịch sử nhập, nhưng không tự cập nhật giá bán.

## 12. Ma trận kiểm thử tối thiểu

| Trường hợp | Kết quả mong đợi |
|---|---|
| Nhập form đủ dữ liệu | Lưu danh mục sau xác nhận |
| Tên gần trùng với danh mục | Cảnh báo và gợi ý ghép bản ghi |
| CSV/XLSX có cột tên khác | Cho ánh xạ cột trước khi import |
| File có dòng hợp lệ và dòng lỗi | Báo lỗi theo dòng; không âm thầm bỏ qua |
| Import cùng file lần hai | Phát hiện trùng, không tự nhân bản |
| Ảnh bảng giá rõ nét | OCR → text → preview có thể sửa |
| Ảnh mờ, số tiền không rõ | Đánh dấu cần kiểm tra, không đoán |
| Ảnh bảng giá không có số lượng mua | Chỉ nạp danh mục, không tạo phiếu nhập trừ khi admin chọn rõ |
| OCR nhận diện đơn vị chưa biết | Không tự quy đổi; yêu cầu xác nhận |
| Admin chưa xác nhận | Không ghi dữ liệu chính thức, không thay đổi tồn |
