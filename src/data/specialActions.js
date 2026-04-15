// ═══════════════════════════════════════════════════════════
// СПЕЦ-ДЕЙСТВИЯ — полный список
// type:
//   'social'   — влияет на игру (нужно согласие пати или авто)
//   'info'     — просто информационная плашка, не меняет игру
//   'swap'     — обмен картами (согласие пати)
//   'resource' — влияет на бункер (согласие пати)
// ═══════════════════════════════════════════════════════════

export const SPECIAL_ACTIONS = [
  // ── Обмены ──────────────────────────────────────────────
  { id: 'swap_profession', name: 'Обмен профессией',   type: 'swap',   desc: 'Меняешься картой профессии с любым игроком.',                      needsConsent: true  },
  { id: 'swap_health',     name: 'Обмен здоровьем',    type: 'swap',   desc: 'Меняешь карту здоровья с выбранным игроком.',                      needsConsent: true  },
  { id: 'swap_hobby',      name: 'Обмен хобби',        type: 'swap',   desc: 'Меняешься картой хобби с выбранным игроком.',                      needsConsent: true  },
  { id: 'swap_biology',    name: 'Обмен биологией',    type: 'swap',   desc: 'Меняешь пол / возраст с выбранным игроком.',                       needsConsent: true  },
  { id: 'swap_baggage',    name: 'Обмен багажом',      type: 'swap',   desc: 'Меняешь карту багажа с выбранным игроком.',                        needsConsent: true  },
  { id: 'swap_character',  name: 'Обмен характером',   type: 'swap',   desc: 'Меняешь карту характера с выбранным игроком.',                     needsConsent: true  },
  { id: 'swap_fact',       name: 'Обмен фактами',      type: 'swap',   desc: 'Меняешь дополнительный факт / фобию / черту с игроком.',           needsConsent: true  },

  // ── Временное влияние ───────────────────────────────────
  { id: 'silence_vote',    name: 'Запрет голоса',      type: 'social', desc: 'Выбранный игрок не голосует в этом раунде.',                       needsConsent: false },
  { id: 'double_vote',     name: 'Двойной голос',      type: 'social', desc: 'Твой голос считается за два в этом раунде.',                       needsConsent: false },
  { id: 'extra_vote',      name: 'Лишний голос',       type: 'social', desc: 'Можешь проголосовать повторно в этом раунде.',                     needsConsent: false },
  { id: 'last_word',       name: 'Последнее слово',    type: 'social', desc: 'Ты говоришь последним перед голосованием.',                        needsConsent: false },
  { id: 'silence',         name: 'Молчание',           type: 'social', desc: 'Выбранный игрок не может говорить этот раунд.',                    needsConsent: false },
  { id: 'force_reveal',    name: 'Принудительное раскрытие', type: 'social', desc: 'Выбранный игрок обязан открыть любую скрытую карту.',         needsConsent: false },

  // ── Манипуляции картами ─────────────────────────────────
  { id: 'steal_card',      name: 'Украсть карту',      type: 'swap',   desc: 'Берёшь случайную характеристику выбранного игрока.',               needsConsent: true  },
  { id: 'drop_card',       name: 'Сброс карты',        type: 'social', desc: 'Выбранный игрок теряет одну характеристику.',                      needsConsent: true  },
  { id: 'new_profession',  name: 'Новая профессия',    type: 'social', desc: 'Выбранный игрок тянет новую карту профессии взамен старой.',        needsConsent: true  },
  { id: 'new_health',      name: 'Новое здоровье',     type: 'social', desc: 'Игрок получает новую случайную карту здоровья.',                   needsConsent: true  },
  { id: 'new_hobby',       name: 'Новое хобби',        type: 'social', desc: 'Игрок получает новое случайное хобби.',                            needsConsent: true  },
  { id: 'reshuffle',       name: 'Перемешать карты',   type: 'social', desc: 'Все характеристики выбранного игрока заменяются случайными.',       needsConsent: true  },

  // ── Социальные ──────────────────────────────────────────
  { id: 'immunity_other',  name: 'Иммунитет игроку',  type: 'social', desc: 'Выбранный игрок не может быть выгнан в этом раунде.',               needsConsent: false },
  { id: 'immunity_self',   name: 'Иммунитет себе',     type: 'social', desc: 'Ты не можешь быть выгнан в этом раунде.',                          needsConsent: false },
  { id: 'instant_kick',    name: 'Выгнать без голосования', type: 'social', desc: 'Выбранный игрок сразу покидает игру. Требует согласия пати.',   needsConsent: true  },
  { id: 'return_player',   name: 'Вернуть игрока',     type: 'social', desc: 'Ранее изгнанный игрок возвращается в игру.',                       needsConsent: true  },
  { id: 'secret_union',    name: 'Тайный союз',        type: 'info',   desc: 'Ты и выбранный игрок договариваетесь голосовать вместе.',           needsConsent: true  },
  { id: 'forced_union',    name: 'Обязанный союз',     type: 'info',   desc: 'Выбранный игрок обязан поддержать тебя в этом раунде.',             needsConsent: true  },

  // ── Информация ──────────────────────────────────────────
  { id: 'peek_card',       name: 'Посмотреть карту',   type: 'info',   desc: 'Тайно смотришь одну скрытую характеристику любого игрока.',         needsConsent: false },
  { id: 'peek_health',     name: 'Узнать здоровье',    type: 'info',   desc: 'Тайно смотришь карту здоровья выбранного игрока.',                  needsConsent: false },
  { id: 'peek_profession', name: 'Узнать профессию',   type: 'info',   desc: 'Тайно смотришь профессию выбранного игрока.',                       needsConsent: false },
  { id: 'lie_detector',    name: 'Детектор лжи',       type: 'info',   desc: 'Выбранный игрок обязан честно ответить на один вопрос.',            needsConsent: false },
  { id: 'fact_check',      name: 'Проверка факта',     type: 'info',   desc: 'Можно уточнить у ведущего, правду ли сказал выбранный игрок.',      needsConsent: false },

  // ── Бункер и ресурсы ────────────────────────────────────
  { id: 'extra_seat',      name: 'Доп. место',         type: 'resource', desc: 'В бункере становится на одно место больше.',                     needsConsent: true  },
  { id: 'minus_seat',      name: 'Минус место',        type: 'resource', desc: 'Мест в бункере становится меньше на одно.',                      needsConsent: true  },
  { id: 'new_item',        name: 'Новый предмет',      type: 'resource', desc: 'В бункере появляется случайный полезный предмет.',               needsConsent: true  },
  { id: 'bunker_damage',   name: 'Поломка бункера',    type: 'resource', desc: 'Один ресурс бункера исчезает.',                                  needsConsent: true  },
  { id: 'bunker_upgrade',  name: 'Улучшение бункера',  type: 'resource', desc: 'Добавляется удобство, защита или ресурс.',                       needsConsent: true  },
  { id: 'disaster_worse',  name: 'Катастрофа хуже',    type: 'resource', desc: 'Условия снаружи ухудшаются — выжить сложнее.',                   needsConsent: true  },
  { id: 'disaster_better', name: 'Катастрофа мягче',   type: 'resource', desc: 'Условия снаружи немного улучшились.',                            needsConsent: true  },
];

// Цвет типа
export const ACTION_TYPE_COLOR = {
  swap:     '#3a6ea8',
  social:   '#c0392b',
  info:     '#4a9e5c',
  resource: '#c8a84b',
};

export const ACTION_TYPE_LABEL = {
  swap:     'ОБМЕН',
  social:   'СОЦИАЛЬНОЕ',
  info:     'ИНФОРМАЦИЯ',
  resource: 'РЕСУРС',
};
