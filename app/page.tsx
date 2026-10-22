import Link from "next/link";

const collections = [
  {
    name: "Khởi",
    meaning: "Một khởi đầu dịu dàng",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85",
    tone: "collection-card--rose",
  },
  {
    name: "Dịu",
    meaning: "Dành cho những điều mềm mại",
    image:
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=85",
    tone: "collection-card--cream",
  },
  {
    name: "Dấu",
    meaning: "Lưu lại một khoảnh khắc",
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85",
    tone: "collection-card--sage",
  },
  {
    name: "Tĩnh",
    meaning: "Vẻ đẹp của sự an yên",
    image:
      "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1000&q=85",
    tone: "collection-card--lavender",
  },
  {
    name: "Rộ",
    meaning: "Nở rộ theo cách riêng",
    image:
      "https://images.unsplash.com/photo-1494625927555-6ec4433b1571?auto=format&fit=crop&w=1000&q=85",
    tone: "collection-card--peach",
  },
];

export default function Home() {
  return (
    <main>
      <div className="announcement">
        <p>Một tác phẩm nhỏ, dành riêng cho người bạn thương</p>
      </div>

      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Eser — Trang chủ">
          eser<span>✳</span>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <a href="#story">Câu chuyện Eser</a>
          <a href="#collections">Bộ sưu tập</a>
          <a href="#materials">Chất liệu</a>
        </nav>
        <a className="header-cta" href="#contact">
          Kết nối với Eser <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span /> FLOWERS & GIFTS · HANOI</p>
          <h1>
            Những điều
            <br />
            đẹp đẽ luôn
            <br />
            <em>tìm cách ở lại.</em>
          </h1>
          <p className="hero-description">
            Eser tạo nên những bó hoa nghệ thuật từ hoa sáp và hoa lụa — để
            cảm xúc được nâng niu lâu hơn một mùa hoa.
          </p>
          <a className="button button-dark" href="#collections">
            Khám phá thế giới Eser <span aria-hidden="true">↗</span>
          </a>
          <p className="hero-note">Made with care, wrapped with meaning.</p>
        </div>
        <div className="hero-visual" role="img" aria-label="Bó hoa tông hồng nhẹ nhàng trong ánh sáng tự nhiên">
          <div className="hero-image" />
          <div className="image-caption">
            <span>01 / THE ART OF GIVING</span>
            <span>Hà Nội, Việt Nam</span>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>made</span>
            <strong>with</strong>
            <span>feeling ✳</span>
          </div>
        </div>
      </section>

      <section className="intro-strip" id="story">
        <p className="eyebrow">A LITTLE NOTE FROM ESER</p>
        <p className="intro-quote">
          “Không chỉ là một bó hoa.
          <br />
          Là điều bạn muốn người ấy <em>nhớ mãi.</em>”
        </p>
        <p className="intro-description">
          Eser — trong tiếng Thổ Nhĩ Kỳ, là một tác phẩm. Với chúng mình, mỗi
          món quà là một cách rất riêng để nói lời yêu thương.
        </p>
      </section>

      <section className="collections-section" id="collections">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR FEELING</p>
            <h2>Mỗi bộ sưu tập, <em>một sắc thái.</em></h2>
          </div>
          <p>
            Chọn một cảm xúc. Eser sẽ cùng bạn gửi nó đi, bằng những cánh hoa
            được sắp đặt đầy dụng ý.
          </p>
        </div>
        <div className="collection-grid">
          {collections.map((collection, index) => (
            <article className={`collection-card ${collection.tone}`} key={collection.name}>
              <div
                className="collection-image"
                role="img"
                aria-label={`Ảnh hoa đại diện cho bộ sưu tập ${collection.name}`}
                style={{ backgroundImage: `url("${collection.image}")` }}
              />
              <div className="collection-overlay" />
              <div className="collection-content">
                <span className="collection-index">0{index + 1} / ESER</span>
                <div>
                  <h3>{collection.name}</h3>
                  <p>{collection.meaning}</p>
                </div>
                <a href="#contact" aria-label={`Hỏi Eser về bộ sưu tập ${collection.name}`}>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="collection-footnote">
          Các bộ sưu tập đang được hoàn thiện. Liên hệ Eser để được tư vấn mẫu hoa phù hợp.
        </p>
      </section>

      <section className="materials-section" id="materials">
        <div className="materials-image" role="img" aria-label="Những bông hoa được sắp đặt thủ công" />
        <div className="materials-copy">
          <p className="eyebrow">MADE TO LAST, MADE TO MEAN</p>
          <h2>Vẻ đẹp không nhất thiết phải <em>vội tàn.</em></h2>
          <p>
            Từ hoa sáp đến hoa lụa, Eser chọn những chất liệu lưu giữ dáng
            hoa và sắc màu lâu dài — để món quà tiếp tục hiện diện trong những
            góc nhỏ thân quen.
          </p>
          <div className="material-list">
            <div><span>01</span><p><strong>Hoa sáp</strong><br />Mềm mại, tinh tế, giàu cảm xúc.</p></div>
            <div><span>02</span><p><strong>Hoa lụa</strong><br />Tự nhiên, thanh lịch, bền dáng.</p></div>
          </div>
          <a className="text-link" href="#contact">Tìm món quà của bạn <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="closing-section" id="contact">
        <div className="closing-flower" aria-hidden="true">✳</div>
        <p className="eyebrow">A GIFT THAT SPEAKS FOR YOU</p>
        <h2>Có điều gì bạn muốn <em>gửi trao?</em></h2>
        <p>Hãy kể Eser nghe về người bạn thương và khoảnh khắc bạn muốn lưu giữ.</p>
        <a className="button button-light" href="mailto:shophoaeser@gmail.com?subject=T%C6%B0%20v%E1%BA%A5n%20hoa%20Eser">
          Trò chuyện cùng Eser <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className="site-footer">
        <Link className="wordmark footer-wordmark" href="/">
          eser<span>✳</span>
        </Link>
        <p>Những khoảnh khắc đẹp đẽ luôn tìm cách để ở lại.</p>
        <a href="mailto:shophoaeser@gmail.com">shophoaeser@gmail.com</a>
        <span className="copyright">© {new Date().getFullYear()} Eser Flowers & Gifts</span>
      </footer>
    </main>
  );
}
