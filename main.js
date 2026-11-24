(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) document.documentElement.classList.add('js');

  // ---- Плавный скролл ----
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !reduce) {
    lenis = new Lenis({ duration: 1.25, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: id === '#top' ? 0 : -40, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  // ---- Прогресс скролла -> 3D-фон, прячем меню при скролле вниз ----
  const nav = document.querySelector('.nav');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    window.__bgScroll && window.__bgScroll(max > 0 ? y / max : 0);
    nav.classList.toggle('hide', y > lastY && y > 300);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Свечение за курсором ----
  const glow = document.querySelector('.cursor-glow');
  let gx = -999, gy = -999, tx = -999, ty = -999;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px,${gy}px)`;
    requestAnimationFrame(loop);
  })();

  // ---- Терминал focus.log ----
  const lines = [
    ['<span class="c">$</span> <span class="k">request</span>  клиент оставил заявку', 0],
    ['<span class="c">→</span> <span class="k">next</span>     понятный следующий шаг', 0],
    ['<span class="c">→</span> <span class="k">routine</span>  ручная работа убрана', 0],
    ['<span class="ok">✓ done</span>     бизнес двигается дальше', 0],
  ];
  const term = document.getElementById('term');
  let typed = false;
  function typeTerm() {
    if (typed) return; typed = true;
    let li = 0, html = '';
    const plain = s => s.replace(/<[^>]+>/g, '');
    const step = () => {
      if (li >= lines.length) { term.innerHTML = html + '<span class="caret"></span>'; return; }
      const full = lines[li][0], text = plain(full);
      let ci = 0;
      const tick = () => {
        ci += 2;
        if (ci >= text.length) { html += full + '\n'; term.innerHTML = html + '<span class="caret"></span>'; li++; setTimeout(step, 260); return; }
        term.innerHTML = html + text.slice(0, ci) + '<span class="caret"></span>';
        setTimeout(tick, 22);
      };
      tick();
    };
    step();
  }

  // ---- Наклон карточек и подсветка ----
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', x * 100 + '%');
      card.style.setProperty('--my', y * 100 + '%');
      if (hasGsap && !reduce) gsap.to(card, { rotateY: (x - .5) * 7, rotateX: (.5 - y) * 7, duration: .8, ease: 'power3.out' });
    });
    card.addEventListener('pointerleave', () => {
      if (hasGsap) gsap.to(card, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1,.6)' });
    });
  });

  // ---- Магнитные кнопки ----
  if (hasGsap && !reduce) document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .6, ease: 'power3.out' });
    });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.5)' }));
  });

  // ---- Анимации появления ----
  if (!hasGsap) { typeTerm(); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (reduce) { typeTerm(); gsap.set('.reveal,.hero-title .line>span', { clearProps: 'all' }); }
  else {
    gsap.timeline({ delay: .2 })
      .to('.hero-title .line>span', { y: 0, duration: 1.4, ease: 'expo.out', stagger: .09 })
      .to('.hero .reveal', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: .1 }, '-=1.0');

    // параллакс героя
    gsap.to('.hero-title', { yPercent: -30, opacity: .15, scale: .94, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    gsap.utils.toArray('.reveal').filter(el => !el.closest('.hero')).forEach(el => {
      gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    ScrollTrigger.create({ trigger: '.terminal', start: 'top 80%', onEnter: typeTerm });

    // карточки: поднимаются из глубины
    gsap.utils.toArray('.card').forEach((c, i) => {
      gsap.fromTo(c, { opacity: 0, y: 120, rotateX: 18, scale: .94, filter: 'blur(10px)' },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'expo.out', delay: (i % 3) * .08,
          scrollTrigger: { trigger: c, start: 'top 92%' } });
    });

    gsap.to('.spark path', { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.mock-table', start: 'top 80%' } });

    // бегущая строка, ускоряется от скорости прокрутки
    const track = document.querySelector('.marquee-track');
    let mx = 0, boost = 0;
    if (lenis) lenis.on('scroll', ({ velocity }) => { boost = velocity; });
    gsap.ticker.add(() => {
      mx -= 0.6 + Math.abs(boost) * 0.5;
      boost *= 0.92;
      const half = track.scrollWidth / 2;
      if (-mx >= half) mx += half;
      track.style.transform = `translateX(${mx}px) skewX(${gsap.utils.clamp(-12, 12, -boost * 0.6)}deg)`;
    });

    gsap.fromTo('.huge', { scale: .7, letterSpacing: '.02em' }, { scale: 1, letterSpacing: '-.06em', ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center center', scrub: 1 } });
  }

  // ---- Модалка с разбором ----
  const cases = {
    palladium: {
      kind: '01 · реальный клиент', title: 'Palladium Legal: сайт, который объясняет сложное простым языком',
      context: 'Юридической фирме в Лондоне нужен был сайт, после которого у потенциального клиента есть понятный следующий шаг ещё до первого звонка.',
      done: 'Визуальная концепция, адаптивная вёрстка, формы обращения, SEO и настройка сервера. С нуля, за 4–5 дней.',
      result: 'Сайт запущен и работает: услуги описаны простым языком, путь к консультации короткий.',
      stack: 'дизайн → разработка → SEO → запуск на сервере', link: 'https://palladiumlegal.co.uk/'
    },
    fastspam: {
      kind: '02 · реальный клиент', title: 'FastSpamBot: массовая рассылка в Telegram с гибкими сценариями',
      context: 'Рассылки, подписки, парсер и инвайтинг были разрознены. Нужен был один инструмент с понятной навигацией.',
      done: 'Telegram-бот с единым меню: профиль пользователя, баланс, доступные инструменты, FAQ.',
      result: 'Все сценарии собраны в одном боте, пользователь всегда видит своё состояние и следующий шаг.',
      stack: 'Telegram Bot API, сценарии массовой рассылки', link: 'https://t.me/FastSpammBot'
    },
    order: {
      kind: '03 · демо', title: 'Заказ в Telegram: путь от меню до оплаты без отдельного приложения',
      context: 'Небольшому фуд-бизнесу нужен приём заказов без разработки мобильного приложения.',
      done: 'Mini App: клиент выбирает позиции, оставляет контакты и видит статус заказа.',
      result: 'Заказ оформляется за пару касаний прямо в Telegram.',
      stack: 'Telegram Mini App, TypeScript, Node.js'
    },
    inbox: {
      kind: '04 · демо', title: 'Заявки без хаоса: единый вход для сообщений из разных каналов',
      context: 'Заявки приходят из форм, Telegram и уведомлений и теряются между каналами.',
      done: 'Автоматизация, которая сводит все источники в один поток с понятным интерфейсом.',
      result: 'Ни одна заявка не теряется, всё видно в одном месте.',
      stack: 'n8n, React, Webhooks'
    },
    booking: {
      kind: '05 · демо', title: 'Запись на услугу: клиент выбирает слот без переписки',
      context: 'Консультант с почасовой оплатой тратит время на согласование времени в переписке.',
      done: 'Mini App ведёт пользователя от выбора услуги до свободного слота в календаре.',
      result: 'Запись без лишних сообщений.',
      stack: 'React, Mini App, calendar API'
    },
    monitor: {
      kind: '06 · демо', title: 'Мониторинг каталога: изменения цен видны до того, как станут проблемой',
      context: 'Цены конкурентов приходится проверять вручную по разным источникам.',
      done: 'Интерфейс парсинга каталогов: источники в одной таблице, изменения цен подсвечены.',
      result: 'Оператору остаются только решения, требующие внимания.',
      stack: 'Python, Playwright, REST API'
    }
  };
  const modal = document.getElementById('modal');
  const $ = id => document.getElementById(id);
  const open = key => {
    const c = cases[key]; if (!c) return;
    $('m-kind').textContent = c.kind; $('m-title').textContent = c.title;
    $('m-context').textContent = c.context; $('m-done').textContent = c.done;
    $('m-result').textContent = c.result; $('m-stack').textContent = c.stack;
    const l = $('m-link'); l.hidden = !c.link; if (c.link) l.href = c.link;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
    modal.querySelector('.modal-close').focus({ preventScroll: true });
  };
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => open(c.dataset.case)));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
