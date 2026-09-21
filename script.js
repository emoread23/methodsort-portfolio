const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const storedTheme = localStorage.getItem('methodsort-theme');

if (storedTheme) root.dataset.theme = storedTheme;

themeButton?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = nextTheme;
  localStorage.setItem('methodsort-theme', nextTheme);
});

document.querySelector('#year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const cases = {
  palladium: {
    type: 'case study / real client',
    title: 'Palladium Legal: сайт, который объясняет сложное простым языком',
    intro: 'Коммерческий сайт для юридической компании — от первой визуальной идеи до установки на рабочий сервер за 4–5 дней.',
    context: 'Реальному клиенту нужен был новый сайт Palladium Legal: спокойный, уверенный и понятный потенциальному клиенту без юридического бэкграунда. В работе был полный цикл, включая финальный деплой.',
    solutions: [
      'Собрал визуальную систему вокруг типографики и воздуха, чтобы бренд выглядел уверенно без тяжёлого декора.',
      'Продумал адаптивные состояния и структуру страниц, чтобы ключевые услуги оставались понятны на телефоне.',
      'Настроил формы, базовое SEO и техническую часть публикации, а затем установил проект на сервер клиента.',
      'Проверил путь пользователя от первого экрана до контакта и убрал лишние переходы.'
    ],
    result: 'У клиента появился опубликованный сайт, который можно использовать как основную точку входа для новых обращений. Результат подтверждён отзывом о завершённой работе.',
    stack: 'HTML / CSS / JavaScript · адаптивная вёрстка · SEO · server deployment',
    link: 'https://palladiumlegal.co.uk/'
  },
  fastspam: {
    type: 'case study / real client',
    title: 'FastSpamBot: массовая рассылка в Telegram с гибкими сценариями',
    intro: 'Реальный Telegram-бот, который собирает рассылку, подписку и дополнительные инструменты в одном управляемом интерфейсе.',
    context: 'Заказчику нужен был единый Telegram-инструмент для массовых отправок и связанных с ними сценариев: подписки, парсера и инвайтинга. В качестве интерфейса выбран сам Telegram — без отдельной панели для пользователя.',
    solutions: [
      'Собрал главное меню по задачам, чтобы пользователь сразу видел доступные инструменты и не искал команды вручную.',
      'Разделил профиль, баланс и подписку в отдельный экран, чтобы состояние аккаунта было прозрачно.',
      'Заложил сценарий рассылки как управляемый процесс, а не одну кнопку отправки: пользователь выбирает нужный инструмент и следующий шаг.',
      'Оставил FAQ и техподдержку внутри бота, чтобы типовые вопросы не останавливались на разработчике.'
    ],
    result: 'Рабочий бот доступен в Telegram по ссылке FastSpammBot. В портфолио показываю фактическое меню и пользовательские экраны; числовые показатели не указываю, потому что они не были предоставлены.',
    stack: 'Python · Telegram Bot API · асинхронные сценарии · server deployment',
    link: 'https://t.me/FastSpammBot'
  },
  telegram: {
    type: 'demo project / product scenario',
    title: 'Заказ в Telegram: путь от меню до оплаты без отдельного приложения',
    intro: 'Демо-проект, собранный чтобы показать сценарий заказа внутри привычного интерфейса Telegram Mini App.',
    context: 'Небольшому food-проекту важно быстро показать меню и довести пользователя до заказа без скачивания нового приложения. Это демонстрационный сценарий, а не работа для заявленного клиента.',
    solutions: [
      'Сделал каталог с короткими карточками, чтобы выбор читался одним взглядом на мобильном экране.',
      'Сохранил состояние корзины внутри сценария, чтобы путь до оформления не рассыпался при навигации.',
      'Заложил статусы заказа и передачу данных боту как следующий шаг интеграции.',
      'Собрал интерфейс в стилистике Telegram, но добавил собственный визуальный слой бренда.'
    ],
    result: 'Демо показывает полный пользовательский маршрут: открыть меню, выбрать позиции, увидеть итог и перейти к оформлению. Реальных метрик у проекта нет.',
    stack: 'React · TypeScript · Telegram Mini Apps API · Node.js',
    link: ''
  },
  flow: {
    type: 'demo project / automation scenario',
    title: 'Заявки без хаоса: единый вход для сообщений из разных каналов',
    intro: 'Демо-сценарий автоматизации для малого бизнеса, где каждая новая заявка получает понятный следующий шаг.',
    context: 'Когда обращения приходят из формы, Telegram и разных менеджеров, они легко теряются. Этот проект показывает, как собрать входящие события в один рабочий поток без тяжёлой CRM.',
    solutions: [
      'Принял события через webhook, чтобы разные источники приходили в единый формат.',
      'Разделил новые заявки по статусам и оставил историю изменений видимой команде.',
      'Добавил автоматические уведомления и ответные действия, чтобы менеджер не проверял каналы вручную.',
      'Оставил архитектуру модульной: новый канал можно подключить отдельным шагом.'
    ],
    result: 'Демо показывает, как превратить разрозненные сообщения в последовательный inbox-процесс. Реальных клиентов и числовых показателей у проекта нет.',
    stack: 'n8n · React · Webhooks · REST API · JavaScript',
    link: ''
  },
  booking: {
    type: 'demo project / product scenario',
    title: 'Запись на услугу: клиент выбирает слот без переписки',
    intro: 'Демо-проект для специалиста с почасовыми консультациями: от выбора услуги до свободного времени в одном коротком сценарии.',
    context: 'Сценарий показывает, как заменить цепочку «написать — дождаться — согласовать» интерфейсом с понятным выбором услуги, даты и времени. Это демонстрационная концепция, не работа для реального клиента.',
    solutions: [
      'Сначала показываю тип услуги и длительность, чтобы человек понимал формат до выбора слота.',
      'Отдельно выделяю выбранную дату и свободные времена, снижая вероятность ошибки при записи.',
      'Оставляю интерфейс компактным и мобильным — сценарий рассчитан на запуск внутри Telegram.',
      'Готовлю точку расширения для календаря и уведомлений после подтверждения.'
    ],
    result: 'Демо показывает понятный путь от услуги к конкретному времени. Реальных клиентов и числовых показателей у проекта нет.',
    stack: 'React · TypeScript · Telegram Mini Apps API · calendar API',
    link: ''
  },
  parser: {
    type: 'demo project / data workflow',
    title: 'Мониторинг каталога: изменения цен видны до того, как станут проблемой',
    intro: 'Демо-интерфейс для парсинга каталогов и контроля изменений, где оператор видит не поток данных, а список решений.',
    context: 'Когда цены и наличие меняются на нескольких источниках, ручная проверка отнимает время. Этот сценарий показывает, как собрать источники в одну таблицу и подсветить только важные изменения.',
    solutions: [
      'Собрал таблицу вокруг ключевых сигналов: источник, текущая цена, изменение и статус обновления.',
      'Разделил успешные, изменившиеся и ожидающие источники, чтобы внимание шло на исключения.',
      'Оставил добавление нового источника отдельным действием, без перестройки всей панели.',
      'Заложил регулярный запуск парсера и выдачу результата через API.'
    ],
    result: 'Демо показывает рабочую модель мониторинга каталога без лишних графиков. Реальных клиентов и числовых показателей у проекта нет.',
    stack: 'Python · Playwright · REST API · scheduled jobs',
    link: ''
  }
};

const dialog = document.querySelector('.case-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogIntro = document.querySelector('#dialog-intro');
const dialogType = document.querySelector('#dialog-type');
const dialogContext = document.querySelector('#dialog-context');
const dialogSolutions = document.querySelector('#dialog-solutions');
const dialogResult = document.querySelector('#dialog-result');
const dialogStack = document.querySelector('#dialog-stack');
const dialogLink = document.querySelector('#dialog-link');

document.querySelectorAll('[data-case]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const data = cases[trigger.dataset.case];
    dialogType.textContent = data.type;
    dialogTitle.textContent = data.title;
    dialogIntro.textContent = data.intro;
    dialogContext.textContent = data.context;
    dialogResult.textContent = data.result;
    dialogStack.textContent = data.stack;
    dialogSolutions.innerHTML = data.solutions.map((item) => `<li>${item}</li>`).join('');
    dialogLink.href = data.link || '#contact';
    dialogLink.target = data.link ? '_blank' : '';
    dialogLink.rel = data.link ? 'noreferrer' : '';
    dialogLink.innerHTML = data.link ? 'Открыть сайт <svg class="button-arrow" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 14 14 4M6 4h8v8" /></svg>' : 'Обсудить похожую задачу <svg class="button-arrow" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 14 14 4M6 4h8v8" /></svg>';
    dialog.showModal();
  });
});

document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
