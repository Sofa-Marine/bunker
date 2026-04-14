// ============================================
// БУНКЕР — All Data
// ============================================

export const ROOMS_DATA = [
  { id:1, name:'АПОКАЛИПСИС-7', desc:'Ядерная война. Стандартный пак.', players:6, max:8, status:'waiting', host:'IGOR_V' },
  { id:2, name:'ВЫЖИТЬ В МОСКВЕ', desc:'Пандемия. Медицинский пак.', players:4, max:6, status:'playing', host:'MASHA_K' },
  { id:3, name:'ПОСЛЕДНИЙ БУНКЕР', desc:'Метеорит. Без ограничений.', players:10, max:10, status:'full', host:'ALEX_D' },
  { id:4, name:'ЗОМБИ OUTBREAK', desc:'Зомби-апокалипсис. 18+', players:3, max:8, status:'waiting', host:'DARK_ONE' },
  { id:5, name:'ТИХИЙ КОНЕЦ', desc:'Климатическая катастрофа.', players:7, max:12, status:'playing', host:'ELENA_P' },
  { id:6, name:'НОВЫЙ МИР', desc:'Инопланетное вторжение. Кастом пак.', players:2, max:6, status:'waiting', host:'VLAD_S' },
];

export const CATEGORIES = [
  { id:'professions', name:'Профессии' },
  { id:'health', name:'Здоровье' },
  { id:'phobia', name:'Фобии' },
  { id:'hobby', name:'Хобби' },
  { id:'baggage', name:'Багаж' },
  { id:'fact', name:'Факт о себе' },
  { id:'action', name:'Спец-действие' },
  { id:'age', name:'Возраст' },
  { id:'gender', name:'Пол' },
];

export const CARDS_DATA = {
  professions: ['Хирург', 'Инженер-ядерщик', 'Агроном', 'Военный снайпер', 'Психолог', 'Повар', 'Электрик', 'Программист', 'Биолог', 'Механик'],
  health: ['Абсолютно здоров', 'Диабет 1 типа', 'Аллергия на пыль', 'Ночная слепота', 'Хроническая боль в спине', 'Здоров как бык'],
  phobia: ['Клаустрофобия', 'Агорафобия', 'Арахнофобия', 'Никтофобия', 'Страх крови', 'Нет фобий'],
  hobby: ['Садоводство', 'Боевые искусства', 'Медитация', 'Охота', 'Радиолюбительство', 'Программирование', 'Кулинария'],
  baggage: ['АК-47 с 3 магазинами', 'Аптечка первой помощи', 'Семена 20 видов растений', 'Ноутбук с энциклопедией', 'Пустой рюкзак'],
  fact: ['Бывший военный', 'Знает 5 языков', 'Служил в ФСБ', 'Вырос в деревне', 'Чёрный пояс по карате'],
  action: ['Может убедить группу', 'Может исследовать зону', 'Меняет профессию', 'Спасает изгнанного'],
  age: ['18 лет', '25 лет', '34 года', '45 лет', '52 года', '67 лет'],
  gender: ['Мужчина', 'Женщина', 'Не бинарный'],
};

export const PLAYERS_DATA = [
  { name:'ALEKSEI_V', role:'Хирург', avatar:'AV', active:true, votes:0 },
  { name:'MASHA_K', role:'???', avatar:'MK', active:false, votes:2 },
  { name:'IGOR_D', role:'Инженер', avatar:'ID', active:false, votes:1 },
  { name:'ELENA_P', role:'???', avatar:'EP', active:false, votes:0 },
  { name:'DARK_ONE', role:'???', avatar:'DO', active:false, votes:3, eliminated:true },
  { name:'VLAD_S', role:'Агроном', avatar:'VS', active:false, votes:1 },
  { name:'NINA_R', role:'???', avatar:'NR', active:false, votes:0 },
  { name:'PETYA_B', role:'???', avatar:'PB', active:false, votes:2 },
];

export const CHAT_MESSAGES = [
  { author:'СИСТЕМА', text:'Игра началась. Раунд 3.', system:true },
  { author:'ALEKSEI_V', text:'Я хирург с 12-летним опытом. В бункере без меня не обойтись.' },
  { author:'MASHA_K', text:'Интересно, а что у тебя за фобия? Почему не раскрываешь?' },
  { author:'IGOR_D', text:'Голосую за DARK_ONE. Не раскрыл уже 3 карты.' },
  { author:'СИСТЕМА', text:'DARK_ONE изгнан из бункера. 7 игроков осталось.', system:true },
];

export const EVENTS = [
  { text:'ALEKSEI_V раскрыл: Хирург', important:true, time:'14:32' },
  { text:'IGOR_D раскрыл: Возраст — 34 года', time:'14:31' },
  { text:'Голосование завершено', important:true, time:'14:28' },
  { text:'DARK_ONE изгнан единогласно', danger:true, time:'14:28' },
  { text:'Начало раунда 3', time:'14:25' },
  { text:'VLAD_S раскрыл: Агроном', time:'14:22' },
];

export const MY_CARDS = [
  { label:'Профессия', val:'Психолог', hidden:false },
  { label:'Здоровье', val:'Диабет', hidden:true },
  { label:'Фобия', val:'???', hidden:true },
  { label:'Хобби', val:'Боевые искусства', hidden:false },
  { label:'Багаж', val:'???', hidden:true },
  { label:'Факт', val:'Служил в ФСБ', hidden:false },
  { label:'Спец-действие', val:'???', hidden:true },
  { label:'Возраст', val:'34 года', hidden:false },
];

export const ACHIEVEMENTS = [
  { name:'ПЕРВАЯ КРОВЬ', desc:'Выиграй первую игру', icon:'⚔', earned:true },
  { name:'ВЫЖИВШИЙ', desc:'Выживи в 10 играх подряд', icon:'☢', earned:true },
  { name:'УБЕЖДЁННЫЙ', desc:'Убеди всех раскрыть карты', icon:'◈', earned:true },
  { name:'АРХИВАРИУС', desc:'Создай 5 паков карточек', icon:'◉', earned:false },
  { name:'ДИКТАТОР', desc:'Изгони 20 игроков', icon:'✦', earned:false },
  { name:'БУНКЕРНЫЙ КРОТ', desc:'Сыграй 100 игр', icon:'▲', earned:false },
];

export const NEWS_ITEMS = [
  { cat:'ОБНОВЛЕНИЕ', title:'Добавлены тематические паки: Зомби-апокалипсис', date:'10 апр. 2026' },
  { cat:'СОБЫТИЕ', title:'Турнир "Последний выживший" — регистрация открыта', date:'8 апр. 2026' },
  { cat:'СООБЩЕСТВО', title:'5000 зарегистрированных игроков!', date:'5 апр. 2026' },
  { cat:'ГАЙД', title:'Стратегии убеждения: как не быть изгнанным', date:'3 апр. 2026' },
  { cat:'ПАТЧ', title:'Исправлены баги голосования и чата', date:'1 апр. 2026' },
];

export const TEST_QUESTIONS = [
  { q:'Среди выживших есть медицинский работник?', options:['Да, профессиональный врач', 'Есть базовые знания медицины', 'Нет медицинских навыков'], scores:[3,1,-2] },
  { q:'Насколько сбалансирован состав по возрасту?', options:['Есть молодые и опытные (20-50 лет)', 'В основном молодёжь до 25 лет', 'Преимущественно старше 55 лет'], scores:[2,0,-1] },
  { q:'У кого-то из выживших есть сельскохозяйственные навыки?', options:['Агроном или фермер в группе', 'Базовые знания о выращивании', 'Никто не занимался сельским хозяйством'], scores:[3,1,-1] },
  { q:'Как обстоит дело с психологической совместимостью?', options:['Группа хорошо общалась, нет острых конфликтов', 'Небольшие разногласия были', 'Серьёзные конфликты в ходе игры'], scores:[2,0,-3] },
  { q:'Есть ли инженерные или технические навыки?', options:['Инженер или техник в группе', 'Кто-то разбирается в технике', 'Никаких технических навыков'], scores:[2,1,-1] },
  { q:'Наличие физически слабых или больных членов группы?', options:['Все в хорошей физической форме', '1-2 человека с ограничениями', 'Несколько тяжелобольных'], scores:[1,0,-2] },
  { q:'Есть ли среди выживших кто-то с клаустрофобией?', options:['Нет', 'Есть, но лёгкая форма', 'Да, серьёзная клаустрофобия'], scores:[0,-1,-3] },
  { q:'Как укомплектован багаж группы?', options:['Полезные выживательные предметы', 'Смешанный набор вещей', 'Бесполезные предметы'], scores:[2,1,-1] },
];

export const GUIDE_SECTIONS = [
  { id:'g1', title:'Что такое Бункер?', content: `
    <p class="guide-text">«Бункер» — ролевая настольная игра для 4–12 игроков, в которой разворачивается сценарий апокалипсиса. Места в бункере ограничены, и игрокам предстоит убедить остальных, что именно они заслуживают выжить.</p>
    <p class="guide-text">Каждый игрок получает случайные карточки с характеристиками своего персонажа: профессию, состояние здоровья, фобии, хобби, багаж и секретный факт. Часть карт изначально скрыта — только вы знаете их содержание.</p>
    <div class="guide-tip"><strong>Главная идея:</strong> Раскрывай информацию стратегически. Слишком много — уязвим. Слишком мало — подозрителен.</div>
  `},
  { id:'g2', title:'Как начать игру', content: `
    <div class="rule-list">
      <div class="rule-item"><span class="rule-num">1</span><span class="rule-text">Создай комнату или присоединись к существующей в разделе «Комнаты»</span></div>
      <div class="rule-item"><span class="rule-num">2</span><span class="rule-text">Выбери пак карточек (стандартный или кастомный) и настрой параметры игры</span></div>
      <div class="rule-item"><span class="rule-num">3</span><span class="rule-text">Дождись минимум 4 игроков. Ведущий нажимает «Начать игру»</span></div>
      <div class="rule-item"><span class="rule-num">4</span><span class="rule-text">Ведущий объявляет сценарий катастрофы и условия бункера</span></div>
      <div class="rule-item"><span class="rule-num">5</span><span class="rule-text">Все получают карточки — начинается первый раунд раскрытия</span></div>
    </div>
  `},
  { id:'g3', title:'Карточки персонажа', content: `
    <p class="guide-text">Каждый персонаж имеет 8 характеристик. В начале игры часть из них скрыта.</p>
    <div class="guide-tip"><strong>Совет:</strong> Профессии с прикладными навыками (медицина, инженерия, агрономия) обычно ценятся выше в стандартных сценариях.</div>
  `},
  { id:'g4', title:'Ход игры и фазы', content: `
    <p class="guide-text">Игра делится на раунды. В каждом раунде происходят:</p>
    <div class="rule-list">
      <div class="rule-item"><span class="rule-num">I</span><span class="rule-text"><strong style="color:var(--accent)">Раскрытие:</strong> Каждый игрок обязан раскрыть одну карточку. Выбор — за игроком.</span></div>
      <div class="rule-item"><span class="rule-num">II</span><span class="rule-text"><strong style="color:var(--accent)">Дебаты:</strong> Игроки обсуждают, убеждают, задают вопросы. Нет ограничений по времени.</span></div>
      <div class="rule-item"><span class="rule-num">III</span><span class="rule-text"><strong style="color:var(--accent)">Голосование:</strong> Анонимное голосование за того, кого нужно изгнать.</span></div>
      <div class="rule-item"><span class="rule-num">IV</span><span class="rule-text"><strong style="color:var(--accent)">Изгнание:</strong> Игрок с большинством голосов покидает игру (раскрывает все карты).</span></div>
    </div>
  `},
  { id:'g5', title:'Голосование и изгнание', content: `
    <p class="guide-text">Голосование анонимное. Каждый игрок выбирает одного кандидата на исключение. Игрок с наибольшим числом голосов изгоняется.</p>
    <div class="guide-tip"><strong>При ничьей:</strong> Проводится дополнительный раунд аргументов, после которого повторное голосование только между кандидатами.</div>
    <p class="guide-text">После изгнания все карты выбывшего раскрываются. Это может существенно изменить расстановку сил — иногда изгнание «ценного» игрока оборачивается катастрофой для оставшихся.</p>
  `},
  { id:'g6', title:'Сценарии и бункер', content: `
    <p class="guide-text">Перед игрой ведущий (создатель комнаты) задаёт сценарий катастрофы и параметры бункера. Это определяет, какие характеристики будут наиболее ценными.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
      <div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--accent);padding:1rem;"><div style="font-family:var(--mono);font-size:0.6rem;color:var(--accent);margin-bottom:4px;">ЯДЕРНАЯ ВОЙНА</div><div style="font-size:0.8rem;color:var(--text2);">Ценятся: Врачи, Инженеры. Вред: Болезни, Клаустрофобия</div></div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid var(--green-light);padding:1rem;"><div style="font-family:var(--mono);font-size:0.6rem;color:var(--green-light);margin-bottom:4px;">ПАНДЕМИЯ</div><div style="font-size:0.8rem;color:var(--text2);">Ценятся: Врачи, Биологи. Вред: Любые болезни</div></div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid #e06060;padding:1rem;"><div style="font-family:var(--mono);font-size:0.6rem;color:#e06060;margin-bottom:4px;">ЗОМБИ</div><div style="font-size:0.8rem;color:var(--text2);">Ценятся: Военные, Охотники. Вред: Страх крови</div></div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid #5a9ed4;padding:1rem;"><div style="font-family:var(--mono);font-size:0.6rem;color:#5a9ed4;margin-bottom:4px;">КЛИМАТ</div><div style="font-size:0.8rem;color:var(--text2);">Ценятся: Агрономы, Геологи. Вред: Аллергии</div></div>
    </div>
  `},
  { id:'g7', title:'Финальный тест выживания', content: `
    <p class="guide-text">В конце игры, когда нужное количество игроков отобрано для бункера, проводится финальный тест. Он определяет, смогут ли выжившие продержаться, исходя из их совокупных характеристик.</p>
    <p class="guide-text">Тест учитывает: разнообразие профессий, совместимость персонажей, наличие критических навыков, запасы бункера и характер катастрофы.</p>
    <div class="guide-tip"><strong>Важно:</strong> Группа может «выиграть» голосование, но «проиграть» финальный тест — если состав отряда окажется несбалансированным. Планируй заранее!</div>
  `},
  { id:'g8', title:'Создание своего пака', content: `
    <p class="guide-text">Перейди в раздел «Редактор», чтобы создать собственный пак. Ты можешь добавлять карточки в любую категорию, а также создавать кастомный сценарий с уникальной катастрофой и параметрами бункера.</p>
    <div class="rule-list">
      <div class="rule-item"><span class="rule-num">1</span><span class="rule-text">Создай новый пак, задай название и описание</span></div>
      <div class="rule-item"><span class="rule-num">2</span><span class="rule-text">Добавь карточки в каждую категорию (минимум 5 вариантов)</span></div>
      <div class="rule-item"><span class="rule-num">3</span><span class="rule-text">Настрой сценарий и параметры бункера во вкладке «Сценарий»</span></div>
      <div class="rule-item"><span class="rule-num">4</span><span class="rule-text">Задай критерии теста выживания — что важно для выживания в твоём сценарии</span></div>
      <div class="rule-item"><span class="rule-num">5</span><span class="rule-text">Сохрани и поделись — пак появится в списке доступных</span></div>
    </div>
  `},
];

export const GAME_HISTORY = [
  { date:'12.04.2026', scenario:'Ядерная война', result:'ВЫЖИЛ', role:'Хирург', players:8 },
  { date:'11.04.2026', scenario:'Пандемия', result:'ИЗГНАН', role:'Психолог', players:6 },
  { date:'10.04.2026', scenario:'Зомби', result:'ВЫЖИЛ', role:'Военный', players:10 },
  { date:'9.04.2026', scenario:'Метеорит', result:'ИЗГНАН', role:'Инженер', players:8 },
  { date:'8.04.2026', scenario:'Климат', result:'ВЫЖИЛ', role:'Агроном', players:7 },
];
