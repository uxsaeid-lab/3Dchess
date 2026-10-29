import React, { useState } from 'react';
import type { BotConfig } from '../../types/chess';
import './LandingPage.css';

interface LandingPageProps {
  onStartGame: (bot: BotConfig, worldId: string) => void;
}

const BOTS: BotConfig[] = [
  {
    id: 'noob',
    name: 'نوب اسب',
    nameEn: 'Noob Horse',
    power: 20,
    difficulty: 'easy',
    tag: 'خیلی آسان',
    desc: 'هنوز دارم یاد می‌گیرم! برای اولین بازی‌ها کنارتم.',
  },
  {
    id: 'fischer',
    name: 'بابی فیشر',
    nameEn: 'Bobby Fischer',
    power: 50,
    difficulty: 'medium',
    tag: 'متوسط',
    desc: 'برای شروع یک چالش واقعی و استراتژی کلاسیک.',
  },
  {
    id: 'kasparov',
    name: 'گری کاسپاروف',
    nameEn: 'Garry Kasparov',
    power: 75,
    difficulty: 'hard',
    tag: 'سخت',
    desc: 'استراتژی و حمله‌های حساب‌شده و تهاجم بی‌رحمانه.',
  },
  {
    id: 'magnus',
    name: 'مگنوس کارلسن',
    nameEn: 'Magnus Carlsen',
    power: 100,
    difficulty: 'hard',
    tag: 'استاد نهایی',
    desc: 'آماده‌ای با بهترین‌ها روبه‌رو بشی؟ قهرمان جهان در برابر توست.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartGame }) => {
  const [selectedBot, setSelectedBot] = useState<BotConfig>(BOTS[0]);
  const [botModalOpen, setBotModalOpen] = useState<boolean>(false);
  const [worldModalOpen, setWorldModalOpen] = useState<boolean>(false);
  const [soonModalOpen, setSoonModalOpen] = useState<boolean>(false);
  const [soonFeatureName, setSoonFeatureName] = useState<string>('');

  const openSoonModal = (feature: string) => {
    setSoonFeatureName(feature);
    setSoonModalOpen(true);
  };

  const closeSoonModal = () => {
    setSoonModalOpen(false);
  };

  const openBotModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setBotModalOpen(true);
  };

  const closeBotModal = () => {
    setBotModalOpen(false);
  };

  const goToWorldModal = () => {
    setBotModalOpen(false);
    setWorldModalOpen(true);
  };

  const closeWorldModal = () => {
    setWorldModalOpen(false);
  };

  const backToBotModal = () => {
    setWorldModalOpen(false);
    setBotModalOpen(true);
  };

  const handleSelectArena = (worldId: string) => {
    closeWorldModal();
    closeBotModal();
    onStartGame(selectedBot, worldId);
  };

  return (
    <div className="landing-scope">
      {/* هدر سایت */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <a className="landing-brand" href="#home" aria-label="شاه‌مات، صفحه اصلی">
            <span className="landing-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 3h8v3h3v4h-3v3h3v3H5v-3h3v-3H5V6h3V3Z" fill="currentColor" />
                <path d="M6 19h12v2H6z" fill="currentColor" />
              </svg>
            </span>
            <span>شاه‌مات</span>
          </a>
          <nav className="landing-nav-links" aria-label="منوی اصلی">
            <a href="#play" onClick={(e) => openBotModal(e)}>شروع بازی</a>
            <a href="#features">امکانات</a>
            <a href="#recent">بازی‌های اخیر</a>
          </nav>
          <div className="landing-nav-actions">
            <a className="landing-btn landing-btn-outline" href="#recent">بازی‌های اخیر</a>
            <button className="landing-btn landing-btn-primary" onClick={(e) => openBotModal(e)}>
              شروع بازی <span aria-hidden="true">←</span>
            </button>
            <button className="landing-menu-toggle" aria-label="نمایش منو">☰</button>
          </div>
        </div>
      </header>

      {/* هیرو سکشن */}
      <main id="home">
        <section className="landing-hero" id="play">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-content">
              <div className="landing-eyebrow">
                <span className="landing-eyebrow-dot"></span> دنیای تازه‌ای از شطرنج سه‌بعدی
              </div>
              <h1>حرکت بعدی تو،<br /><span>شروع یک پیروزی</span></h1>
              <p className="landing-hero-copy">
                هوشمندانه بازی کن، مهارتت رو ارتقا بده و با حریفان قدرتمند رقابت کن. صفحه‌ی سه‌بعدی شطرنج آماده‌ست؛ نوبت تسخیر محراب نبرده.
              </p>
              <div className="landing-hero-actions">
                <button className="landing-btn landing-btn-primary" onClick={(e) => openBotModal(e)}>
                  شروع بازی <span aria-hidden="true">←</span>
                </button>
                <a className="landing-btn landing-btn-outline" href="#features">
                  کشف امکانات <span aria-hidden="true">⌄</span>
                </a>
              </div>
              <div className="landing-hero-note">
                <div className="landing-avatars" aria-hidden="true">
                  <span className="landing-avatar">♞</span>
                  <span className="landing-avatar">♟</span>
                  <span className="landing-avatar">♜</span>
                  <span className="landing-avatar">♛</span>
                </div>
                <span>بیش از ۱۲,۰۰۰ نبرد هم‌اکنون در جریان است</span>
              </div>
            </div>

            <div className="landing-hero-visual" aria-label="تصویر سه‌بعدی مهره‌های شطرنج">
              <img className="landing-hero-image" src="/hero-pink-king.png" alt="شاه صورتی روی صفحه شطرنج آبی" />
            </div>
          </div>
        </section>

        {/* بخش امکانات */}
        <section className="landing-section" id="features">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="kicker">ویژگی‌های برجسته</span>
              <h2>تجربه بی‌نقص از شطرنج حرفه‌ای</h2>
              <p>تمام ابزارهای مورد نیاز برای تمرین، ارتقای ریتینگ و بازی با هوش مصنوعی‌های پیشرفته در یک رابط مدرن گردهم آمده است.</p>
            </div>
            <div className="landing-features">
              <div className="landing-feature">
                <div className="landing-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3>گرافیک زنده و تعاملی</h3>
                <p>رندر سه‌بعدی دقیق مهره‌ها با زاویه دید ایزومتریک، آکوستیک زنده صدا و امکان تغییر دوربین بدون افت فریم.</p>
              </div>
              <div className="landing-feature">
                <div className="landing-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>نبردهای آنی و بدون تأخیر</h3>
                <p>ارتباط همگام با موتور تحلیل شطرنج و امکان رقابت بلادرنگ یا بازی دونفره محلی (Pass & Play) بدون نیاز به نصب هیچ ابزاری.</p>
              </div>
              <div className="landing-feature">
                <div className="landing-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>حریفان تمرینی هوشمند</h3>
                <p>بات‌های هوش مصنوعی با کاراکترها و سبک‌های تهاجمی یا دفاعی متنوع جهت آماده‌سازی بازیکن برای مسابقات ریتینگی.</p>
              </div>
            </div>
          </div>
        </section>

        {/* بازی‌های اخیر */}
        <section className="landing-section landing-recent-section" id="recent">
          <div className="landing-container">
            <div className="landing-recent-top">
              <div>
                <h2>میزهای مسابقه در حال اجرا</h2>
                <p>به صورت زنده نبرد بازیکنان را دنبال کنید یا بازی جدید بسازید.</p>
              </div>
              <button className="landing-btn landing-btn-outline" onClick={() => openSoonModal('بخش تماشای زنده و مسابقات آنلاین')}>
                مشاهده تمام میزها
              </button>
            </div>
            <div className="landing-games">
              <div className="landing-game-card" onClick={() => openSoonModal('تماشای زنده میز مگنوس کارلسن و آرش')}>
                <div className="landing-mini-board">
                  <i>♜</i><i></i><i></i><i>♚</i>
                  <i></i><i>♟</i><i></i><i></i>
                  <i></i><i></i><i>♙</i><i></i>
                  <i>♔</i><i></i><i></i><i>♖</i>
                </div>
                <div className="landing-game-info">
                  <strong>مگنوس کارلسن vs. آرش</strong>
                  <span>تالار کتابخانه سلطنتی • بلیتز ۵ دقیقه‌ای</span>
                  <div className="landing-game-meta">
                    <span className="landing-tag">حرکت ۳۴</span>
                    <span className="landing-game-time">۰۱:۴۲ مانده</span>
                  </div>
                </div>
              </div>
              <div className="landing-game-card" onClick={() => openSoonModal('تماشای زنده میز نوب اسب و کیان')}>
                <div className="landing-mini-board">
                  <i></i><i>♞</i><i></i><i>♚</i>
                  <i>♟</i><i></i><i></i><i></i>
                  <i></i><i>♙</i><i></i><i></i>
                  <i>♔</i><i></i><i>♗</i><i></i>
                </div>
                <div className="landing-game-info">
                  <strong>نوب اسب vs. کیان</strong>
                  <span>قلمرو مکعبی ماینکرفت • رپید ۱۰ دقیقه‌ای</span>
                  <div className="landing-game-meta">
                    <span className="landing-tag">حرکت ۱۸</span>
                    <span className="landing-game-time">۰۶:۱۵ مانده</span>
                  </div>
                </div>
              </div>
              <div className="landing-game-card" onClick={() => openSoonModal('بازبینی نبرد گری کاسپاروف و بردیا')}>
                <div className="landing-mini-board">
                  <i>♜</i><i></i><i></i><i>♚</i>
                  <i></i><i></i><i>♛</i><i></i>
                  <i></i><i>♕</i><i></i><i></i>
                  <i>♔</i><i></i><i></i><i>♖</i>
                </div>
                <div className="landing-game-info">
                  <strong>گری کاسپاروف vs. بردیا</strong>
                  <span>معبد شکوفه‌های ساکورا • استاندارد ۱۵ دقیقه‌ای</span>
                  <div className="landing-game-meta">
                    <span className="landing-tag">کیش و مات</span>
                    <span className="landing-game-time">پایان بازی</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* بنر انتها */}
        <section className="landing-container landing-bottom-cta">
          <div className="landing-cta-panel">
            <div>
              <h2>آماده فتح محراب شطرنج هستید؟</h2>
              <p>به هزاران شطرنج‌باز بپیوندید و اولین حرکت پیروزی‌بخش خود را همین حالا ثبت کنید.</p>
            </div>
            <button className="landing-btn" onClick={(e) => openBotModal(e)}>شروع بازی</button>
          </div>
        </section>
      </main>

      {/* فوتر */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <span>© ۲۰۲۶ تمامی حقوق برای پلتفرم ۳D Chess محفوظ است.</span>
          <div className="landing-footer-links">
            <a href="#play" onClick={(e) => openBotModal(e)}>شروع بازی</a>
            <a href="#features">امکانات پلتفرم</a>
            <a href="#recent" onClick={() => openSoonModal('بخش تماشای زنده')}>تماشای زنده</a>
          </div>
        </div>
      </footer>

      {/* دیالوگ اطلاع‌رسانی «به زودی» */}
      <div
        className={`soon-modal-backdrop ${soonModalOpen ? 'active' : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains('soon-modal-backdrop')) closeSoonModal();
        }}
      >
        <div className="soon-modal-card" role="alertdialog" aria-modal="true">
          <div className="soon-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
            </svg>
          </div>
          <span className="soon-badge">به‌روزرسانی آینده شاه‌مات</span>
          <h3 className="soon-title">«{soonFeatureName}» به‌زودی اضافه می‌شود!</h3>
          <p className="soon-desc">
            امکان رقابت آنلاین با بازیکنان واقعی و تماشای زنده میزهای مسابقه در حال توسعه است و به‌زودی فعال خواهد شد. هم‌اکنون می‌توانید با هوش مصنوعی‌های قهرمان وارد نبرد شوید!
          </p>
          <div className="soon-actions">
            <button type="button" className="landing-btn landing-btn-outline" onClick={closeSoonModal}>
              متوجه شدم
            </button>
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              onClick={() => {
                closeSoonModal();
                setBotModalOpen(true);
              }}
            >
              شروع بازی ←
            </button>
          </div>
        </div>
      </div>

      {/* مودال گام اول: انتخاب حریف */}
      <div
        className={`bot-modal-backdrop ${botModalOpen ? 'active' : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains('bot-modal-backdrop')) closeBotModal();
        }}
      >
        <div className="bot-modal" role="dialog" aria-modal="true">
          <button className="modal-close-btn" onClick={closeBotModal} aria-label="بستن پنجره">
            ✕
          </button>

          <div className="modal-header">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow-dot"></span> گام ۱ از ۲ • انتخاب حریف
            </div>
            <h2>حریفت رو انتخاب کن!</h2>
            <p>از اولین حرکت تا نبرد با استادان شطرنج؛ سطح خودت رو انتخاب کن.</p>
          </div>

          <div className="bot-cards-grid">
            {/* ۱. نوب اسب */}
            <div
              className={`bot-card ${selectedBot.id === 'noob' ? 'selected' : ''}`}
              data-bot="noob"
              onClick={() => setSelectedBot(BOTS[0])}
            >
              {selectedBot.id === 'noob' && <span className="card-check-badge">✓</span>}
              <div className="bot-portrait-wrap" style={{ background: '#e0f2fe' }}>
                <svg className="bot-portrait-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="54" fill="#dbeafe" />
                  <path d="M22 116 C25 86, 38 82, 60 82 C82 82, 95 86, 98 116 Z" fill="#ffffff" />
                  <path d="M44 84 L60 98 L76 84 Z" fill="#93c5fd" />
                  <path d="M57 96 C55 94, 56 91, 58 90 C60 90, 62 91, 61 93 C63 92, 65 94, 64 96 C64 98, 61 99, 57 99 Z" fill="#0284c7" />
                  <rect x="52" y="66" width="16" height="18" fill="#fed7aa" />
                  <circle cx="60" cy="52" r="23" fill="#ffedd5" />
                  <path d="M37 46 C35 30, 48 24, 60 24 C72 24, 85 30, 83 46 C80 39, 74 34, 60 34 C46 34, 40 40, 37 46 Z" fill="#b45309" />
                  <path d="M42 26 L46 16 L52 25 L58 14 L65 24 L72 17 L76 27 Z" fill="#b45309" />
                  <circle cx="37" cy="53" r="6" fill="#fed7aa" />
                  <circle cx="83" cy="53" r="6" fill="#fed7aa" />
                  <ellipse cx="50" cy="46" rx="5.5" ry="6.5" fill="#ffffff" />
                  <ellipse cx="70" cy="46" rx="4.5" ry="5.5" fill="#ffffff" />
                  <circle cx="51" cy="47" r="2.8" fill="#1e293b" />
                  <circle cx="69" cy="47" r="2.2" fill="#1e293b" />
                  <circle cx="52" cy="45" r="1" fill="#ffffff" />
                  <circle cx="70" cy="45" r="0.8" fill="#ffffff" />
                  <path d="M45 38 Q50 36 55 40" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M65 41 Q70 37 75 39" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="60" cy="52" r="3" fill="#fca5a5" />
                  <circle cx="44" cy="55" r="4" fill="#f87171" opacity="0.4" />
                  <circle cx="76" cy="55" r="4" fill="#f87171" opacity="0.4" />
                  <path d="M46 58 Q60 74 74 60 Z" fill="#dc2626" />
                  <path d="M48 60 Q60 66 72 61 L70 65 Q60 69 50 63 Z" fill="#ffffff" />
                </svg>
              </div>
              <h3 className="bot-name">نوب اسب</h3>
              <span className="bot-name-en">Noob Horse</span>
              <div className="power-meta">
                <span className="power-label">قدرت</span>
                <span className="power-value">۲۰ از ۱۰۰</span>
              </div>
              <div className="power-bar-bg"><div className="power-bar-fill"></div></div>
              <span className="difficulty-tag tag-easy">خیلی آسان</span>
              <p className="bot-desc">هنوز دارم یاد می‌گیرم! برای اولین بازی‌ها کنارتم.</p>
              <button className="card-action-btn" type="button">بازی با نوب اسب</button>
            </div>

            {/* ۲. بابی فیشر */}
            <div
              className={`bot-card ${selectedBot.id === 'fischer' ? 'selected' : ''}`}
              data-bot="fischer"
              onClick={() => setSelectedBot(BOTS[1])}
            >
              {selectedBot.id === 'fischer' && <span className="card-check-badge">✓</span>}
              <div className="bot-portrait-wrap" style={{ background: '#eef5fc' }}>
                <svg className="bot-portrait-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="54" fill="#dbeafe" />
                  <path d="M22 116 C25 86, 38 76, 60 76 C82 76, 95 86, 98 116 Z" fill="#1e293b" />
                  <polygon points="53,76 67,76 64,116 56,116" fill="#f8fafc" />
                  <polygon points="58,80 62,80 63,105 60,110 57,105" fill="#1d4ed8" />
                  <rect x="52" y="65" width="16" height="15" fill="#fed7aa" />
                  <path d="M40 50 C40 36, 49 32, 60 32 C71 32, 80 36, 80 50 C80 68, 70 73, 60 73 C50 73, 40 68, 40 50 Z" fill="#ffedd5" />
                  <path d="M38 45 C38 28, 48 23, 60 23 C72 23, 82 28, 81 44 C76 34, 66 30, 56 30 C46 30, 40 37, 38 45 Z" fill="#78350f" />
                  <path d="M39 42 L41 53 L44 51 L43 42 Z" fill="#78350f" />
                  <path d="M46 44 L55 45" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M65 45 L74 44" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="51" cy="49" rx="2.5" ry="2" fill="#1e293b" />
                  <ellipse cx="69" cy="49" rx="2.5" ry="2" fill="#1e293b" />
                  <path d="M60 47 L58 56 L62 57" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  <line x1="55" y1="64" x2="65" y2="64" stroke="#9a3412" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="bot-name">بابی فیشر</h3>
              <span className="bot-name-en">Bobby Fischer</span>
              <div className="power-meta">
                <span className="power-label">قدرت</span>
                <span className="power-value">۵۰ از ۱۰۰</span>
              </div>
              <div className="power-bar-bg"><div className="power-bar-fill"></div></div>
              <span className="difficulty-tag tag-medium">متوسط</span>
              <p className="bot-desc">برای شروع یک چالش واقعی و استراتژی کلاسیک.</p>
              <button className="card-action-btn" type="button">بازی با بابی فیشر</button>
            </div>

            {/* ۳. گری کاسپاروف */}
            <div
              className={`bot-card ${selectedBot.id === 'kasparov' ? 'selected' : ''}`}
              data-bot="kasparov"
              onClick={() => setSelectedBot(BOTS[2])}
            >
              {selectedBot.id === 'kasparov' && <span className="card-check-badge">✓</span>}
              <div className="bot-portrait-wrap" style={{ background: '#e8f0fa' }}>
                <svg className="bot-portrait-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="54" fill="#bfdbfe" />
                  <path d="M20 116 C24 85, 38 75, 60 75 C82 75, 96 85, 100 116 Z" fill="#0f172a" />
                  <polygon points="51,75 69,75 65,116 55,116" fill="#f8fafc" />
                  <polygon points="58,79 62,79 64,106 60,112 56,106" fill="#1e3a8a" />
                  <rect x="52" y="64" width="16" height="15" fill="#fed7aa" />
                  <path d="M37 51 C37 38, 47 34, 60 34 C73 34, 83 38, 83 51 C83 67, 73 74, 60 74 C47 74, 37 67, 37 51 Z" fill="#ffedd5" />
                  <path d="M36 50 C36 34, 46 26, 60 26 C74 26, 84 34, 84 50 C80 39, 72 37, 60 37 C48 37, 40 40, 36 50 Z" fill="#1e293b" />
                  <path d="M36 48 L42 45 L41 52 Z" fill="#94a3b8" />
                  <path d="M84 48 L78 45 L79 52 Z" fill="#94a3b8" />
                  <path d="M43 45 L58 48" stroke="#020617" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M62 48 L77 45" stroke="#020617" strokeWidth="3.6" strokeLinecap="round" />
                  <circle cx="50" cy="52" r="2.5" fill="#020617" />
                  <circle cx="70" cy="52" r="2.5" fill="#020617" />
                  <path d="M60 48 L58 57 L63 58" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  <line x1="54" y1="64" x2="66" y2="64" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="bot-name">گری کاسپاروف</h3>
              <span className="bot-name-en">Garry Kasparov</span>
              <div className="power-meta">
                <span className="power-label">قدرت</span>
                <span className="power-value">۷۵ از ۱۰۰</span>
              </div>
              <div className="power-bar-bg"><div className="power-bar-fill"></div></div>
              <span className="difficulty-tag tag-hard">سخت</span>
              <p className="bot-desc">استراتژی و حمله‌های حساب‌شده و تهاجم بی‌رحمانه.</p>
              <button className="card-action-btn" type="button">بازی با کاسپاروف</button>
            </div>

            {/* ۴. مگنوس کارلسن */}
            <div
              className={`bot-card ${selectedBot.id === 'magnus' ? 'selected' : ''}`}
              data-bot="magnus"
              onClick={() => setSelectedBot(BOTS[3])}
            >
              {selectedBot.id === 'magnus' && <span className="card-check-badge">✓</span>}
              <div className="bot-portrait-wrap" style={{ background: '#e0e9f6' }}>
                <svg className="bot-portrait-svg" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="54" fill="#cbd5e1" />
                  <path d="M20 116 C24 86, 38 77, 60 77 C82 77, 96 86, 100 116 Z" fill="#1e293b" />
                  <polygon points="48,77 72,77 60,104" fill="#ffffff" />
                  <rect x="52" y="65" width="16" height="15" fill="#fed7aa" />
                  <path d="M37 50 C37 36, 47 33, 60 33 C73 33, 83 36, 83 50 C83 67, 74 72, 60 72 C46 72, 37 67, 37 50 Z" fill="#ffedd5" />
                  <path d="M35 44 C35 24, 46 19, 60 19 C74 19, 85 24, 85 44 C80 34, 70 28, 60 28 C50 28, 42 33, 35 44 Z" fill="#92400e" />
                  <path d="M46 24 C54 28, 66 26, 75 32 C68 29, 58 30, 46 24 Z" fill="#78350f" />
                  <path d="M45 44 L56 43" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M64 43 L75 44" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
                  <ellipse cx="50" cy="48" rx="2.8" ry="1.6" fill="#0f172a" />
                  <ellipse cx="70" cy="48" rx="2.8" ry="1.6" fill="#0f172a" />
                  <path d="M60 46 L58 55 L63 56" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  <path d="M54 62 Q60 63 66 62" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M56 65 Q60 66 64 65" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="bot-name">مگنوس کارلسن</h3>
              <span className="bot-name-en">Magnus Carlsen</span>
              <div className="power-meta">
                <span className="power-label">قدرت</span>
                <span className="power-value">۱۰۰ از ۱۰۰</span>
              </div>
              <div className="power-bar-bg"><div className="power-bar-fill"></div></div>
              <span className="difficulty-tag tag-master">استاد نهایی</span>
              <p className="bot-desc">آماده‌ای با بهترین‌ها روبه‌رو بشی؟ قهرمان جهان در برابر توست.</p>
              <button className="card-action-btn" type="button">بازی با مگنوس</button>
            </div>
          </div>

          <div className="modal-footer">
            <div className="modal-hint">
              💡 در گام بعدی، میز و سرزمین نبرد سه‌بعدی خود را انتخاب خواهید کرد.
            </div>
            <button className="btn-start-game" onClick={goToWorldModal}>
              ادامه و انتخاب میز نبرد ({selectedBot.name}) ←
            </button>
          </div>
        </div>
      </div>

      {/* مودال گام دوم: انتخاب مپ (میز فعال سبز رنگ) */}
      <div
        className={`bot-modal-backdrop ${worldModalOpen ? 'active' : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains('bot-modal-backdrop')) closeWorldModal();
        }}
      >
        <div className="bot-modal" role="dialog" aria-modal="true">
          <button className="modal-close-btn" onClick={closeWorldModal} aria-label="بستن پنجره">
            ✕
          </button>

          <div className="modal-header">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow-dot"></span> گام ۲ از ۲ • انتخاب سرزمین نبرد
            </div>
            <h2>میز و قلمرو نبرد را انتخاب کنید</h2>
            <p>
              حریف انتخاب‌شده: <strong style={{ color: 'var(--blue-2)' }}>{selectedBot.name}</strong> — اکنون میز مسابقه را جهت ورود به بازی انتخاب کنید.
            </p>
          </div>

          <div className="worlds-grid">
            {/* میز ۱: تالار کتابخانه سلطنتی (فعال - سبز رنگ) */}
            <div className="world-card active-world" onClick={() => handleSelectArena('classic-library')}>
              <div className="world-cover-bg world-cover-classic"></div>
              <div className="world-gradient-overlay"></div>

              <div className="world-top-badges">
                <span className="badge-ready">● فعال • آماده نبرد</span>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#059669', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}>
                  ✓
                </span>
              </div>

              <div className="world-info-box">
                <span className="world-kicker" style={{ color: '#34d399' }}>👑 میز کلاسیک اشرافی</span>
                <h3 className="world-title-fa">تالار کتابخانه سلطنتی</h3>
                <span className="world-title-en">CLASSIC ROYAL LIBRARY</span>
                <p className="world-desc">میز گرد چوب گردو و ماهون، چراغ مطالعه بانکداری و مهره‌های دست‌تراش استونتون با افکت خروج روح مهره‌ها.</p>
                <button type="button" className="world-select-btn">ورود به این میز ←</button>
              </div>
            </div>

            {/* میز ۲: قلمرو مکعبی ماینکرفت (قفل + به زودی) */}
            <div className="world-card locked-world" onClick={() => openSoonModal('میز «قلمرو مکعبی ماینکرفت»')}>
              <div className="world-cover-bg world-cover-minecraft"></div>
              <div className="world-gradient-overlay"></div>

              <div className="world-top-badges">
                <span className="badge-soon">🔒 به‌زودی</span>
              </div>

              <div className="center-lock-circle">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>

              <div className="world-info-box" style={{ opacity: 0.85 }}>
                <span className="world-kicker" style={{ color: '#cbd5e1' }}>⚔️ دنیای وکسل و بلوک‌ها</span>
                <h3 className="world-title-fa">قلمرو مکعبی ماینکرفت</h3>
                <span className="world-title-en" style={{ color: '#94a3b8' }}>MINECRAFT VOXEL REALM</span>
                <p className="world-desc">نبرد بر فراز صخره‌های معلق مکعبی، آبشارهای پیکسلی، فانوس‌های فروزان و غروب آفتاب چهارگوش.</p>
                <button type="button" className="world-select-btn locked-btn">🔒 در دست ساخت (به‌زودی)</button>
              </div>
            </div>

            {/* میز ۳: معبد شکوفه‌های ساکورا (قفل + به زودی) */}
            <div className="world-card locked-world" onClick={() => openSoonModal('میز «معبد شکوفه‌های ساکورا»')}>
              <div className="world-cover-bg world-cover-japan"></div>
              <div className="world-gradient-overlay"></div>

              <div className="world-top-badges">
                <span className="badge-soon">🔒 به‌زودی</span>
              </div>

              <div className="center-lock-circle">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>

              <div className="world-info-box" style={{ opacity: 0.85 }}>
                <span className="world-kicker" style={{ color: '#cbd5e1' }}>🌸 باغ سامورایی و ذن</span>
                <h3 className="world-title-fa">معبد شکوفه‌های ساکورا</h3>
                <span className="world-title-en" style={{ color: '#94a3b8' }}>JAPANESE SAKURA TEMPLE</span>
                <p className="world-desc">صفحه شطرنج در دل باغ سنتی ژاپن، ریزش گلبرگ‌های صورتی گیلاس و فانوس‌های سنگی کنار برکه.</p>
                <button type="button" className="world-select-btn locked-btn">🔒 در دست ساخت (به‌زودی)</button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="landing-btn landing-btn-outline" onClick={backToBotModal}>
              → بازگشت به انتخاب حریف
            </button>
            <button
              type="button"
              className="btn-start-game"
              onClick={() => handleSelectArena('classic-library')}
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
            >
              ورود به تالار کتابخانه سلطنتی و شروع بازی ⚔️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
