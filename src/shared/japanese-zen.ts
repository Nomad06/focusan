/**
 * Japanese Zen Content Collection
 * Kanji-based zen phrases for the Japanese theme
 * Each entry includes large kanji display + meaning + context message
 */

export interface ZenPhrase {
  kanji: string // Large kanji character(s) to display
  romanji: string // Romanized pronunciation
  meaning: string // English translation
  meaningRu: string // Russian translation
  message: string // Contextual message in English
  messageRu: string // Contextual message in Russian
  theme: 'focus' | 'discipline' | 'patience' | 'mindfulness' | 'strength' | 'simplicity'
}

export const JAPANESE_ZEN_PHRASES: ZenPhrase[] = [
  {
    kanji: '継続',
    romanji: 'Keizoku',
    meaning: 'Continuity',
    meaningRu: 'Непрерывность',
    message: 'Return to your purpose.\nThis distraction is but a ripple on the water.',
    messageRu: 'Вернитесь к своей цели.\nЭто отвлечение — лишь рябь на воде.',
    theme: 'discipline',
  },
  {
    kanji: '没頭',
    romanji: 'Bottō',
    meaning: 'Immersion',
    meaningRu: 'Погружение',
    message: 'Complete absorption in your work.\nLet distractions fade like morning mist.',
    messageRu: 'Полное погружение в работу.\nПусть отвлечения исчезнут, как утренний туман.',
    theme: 'focus',
  },
  {
    kanji: '集中',
    romanji: 'Shūchū',
    meaning: 'Concentration',
    meaningRu: 'Концентрация',
    message: 'One thing at a time.\nThe wandering mind finds no peace.',
    messageRu: 'Одно дело за раз.\nБлуждающий ум не находит покоя.',
    theme: 'focus',
  },
  {
    kanji: '修行',
    romanji: 'Shugyō',
    meaning: 'Training',
    meaningRu: 'Обучение',
    message: 'Every moment is practice.\nEvery resistance builds discipline.',
    messageRu: 'Каждый момент — практика.\nКаждое сопротивление укрепляет дисциплину.',
    theme: 'discipline',
  },
  {
    kanji: '忍耐',
    romanji: 'Nintai',
    meaning: 'Perseverance',
    meaningRu: 'Настойчивость',
    message: 'The bamboo bends but does not break.\nYour focus will strengthen through resistance.',
    messageRu: 'Бамбук гнётся, но не ломается.\nВаш фокус укрепится через сопротивление.',
    theme: 'patience',
  },
  {
    kanji: '平静',
    romanji: 'Heisei',
    meaning: 'Serenity',
    meaningRu: 'Безмятежность',
    message: 'Still water reflects the moon clearly.\nA calm mind sees the path forward.',
    messageRu: 'Спокойная вода ясно отражает луну.\nСпокойный ум видит путь вперёд.',
    theme: 'mindfulness',
  },
  {
    kanji: '簡素',
    romanji: 'Kanso',
    meaning: 'Simplicity',
    meaningRu: 'Простота',
    message: 'Remove the unnecessary.\nWhat remains is essential.',
    messageRu: 'Уберите ненужное.\nОстанется главное.',
    theme: 'simplicity',
  },
  {
    kanji: '今',
    romanji: 'Ima',
    meaning: 'Now',
    meaningRu: 'Сейчас',
    message: 'This moment is all there is.\nBe here, fully present.',
    messageRu: 'Этот момент — всё, что есть.\nБудьте здесь, полностью присутствуя.',
    theme: 'mindfulness',
  },
  {
    kanji: '不動心',
    romanji: 'Fudōshin',
    meaning: 'Immovable Mind',
    meaningRu: 'Неподвижный ум',
    message: 'Like a mountain in the storm.\nYour resolve remains unshaken.',
    messageRu: 'Как гора в шторм.\nВаша решимость остаётся непоколебимой.',
    theme: 'strength',
  },
  {
    kanji: '一期一会',
    romanji: 'Ichi-go ichi-e',
    meaning: 'One time, one meeting',
    meaningRu: 'Один раз, одна встреча',
    message: 'This moment will never come again.\nTreat it with respect and full attention.',
    messageRu: 'Этот момент не повторится.\nОтнеситесь к нему с уважением и полным вниманием.',
    theme: 'mindfulness',
  },
  {
    kanji: '精進',
    romanji: 'Shōjin',
    meaning: 'Devotion',
    meaningRu: 'Преданность',
    message: 'Wholehearted dedication to your craft.\nHalf-hearted effort yields half-results.',
    messageRu: 'Полное посвящение своему делу.\nПолусердечные усилия дают половинчатые результаты.',
    theme: 'discipline',
  },
  {
    kanji: '無心',
    romanji: 'Mushin',
    meaning: 'No-mind',
    meaningRu: 'Безмыслие',
    message: 'Act without overthinking.\nThe master moves without hesitation.',
    messageRu: 'Действуйте без излишних размышлений.\nМастер движется без колебаний.',
    theme: 'focus',
  },

  // ─── 武士道 — The Seven Virtues of Bushidō ───
  {
    kanji: '義',
    romanji: 'Gi',
    meaning: 'Rectitude — the right decision',
    meaningRu: 'Праведность — верное решение',
    message: 'A samurai chooses the harder right over the easier wrong.\nClose this tab. Return to your path.',
    messageRu: 'Самурай выбирает трудное правое, а не лёгкое неправое.\nЗакройте вкладку. Вернитесь на свой путь.',
    theme: 'discipline',
  },
  {
    kanji: '勇',
    romanji: 'Yū',
    meaning: 'Courage — to do what is feared',
    meaningRu: 'Мужество — делать то, чего боишься',
    message: 'Courage is not absence of distraction.\nIt is moving past it without flinching.',
    messageRu: 'Мужество — это не отсутствие отвлечений.\nЭто способность пройти мимо них, не дрогнув.',
    theme: 'strength',
  },
  {
    kanji: '仁',
    romanji: 'Jin',
    meaning: 'Benevolence — to your own future',
    meaningRu: 'Благосклонность — к своему будущему',
    message: 'Be merciful to the one you will become.\nDo not steal hours from tomorrow.',
    messageRu: 'Будь милосерден к тому, кем ты станешь.\nНе кради часы у завтра.',
    theme: 'mindfulness',
  },
  {
    kanji: '礼',
    romanji: 'Rei',
    meaning: 'Respect — for the work',
    meaningRu: 'Уважение — к делу',
    message: 'Honor the task before you.\nDistraction is a form of disrespect.',
    messageRu: 'Чти задачу, что перед тобой.\nОтвлечение — это форма неуважения.',
    theme: 'discipline',
  },
  {
    kanji: '誠',
    romanji: 'Makoto',
    meaning: 'Sincerity — speak with action',
    meaningRu: 'Искренность — говори делами',
    message: 'You said you would focus.\nLet the doing become the word.',
    messageRu: 'Ты сказал, что будешь сосредоточен.\nПусть дело станет словом.',
    theme: 'discipline',
  },
  {
    kanji: '名誉',
    romanji: 'Meiyo',
    meaning: 'Honor — the verdict of self',
    meaningRu: 'Честь — приговор себе',
    message: 'No one watches but you.\nThat is the only audience that matters.',
    messageRu: 'Никто не смотрит, кроме тебя.\nЭто единственный зритель, что имеет значение.',
    theme: 'strength',
  },
  {
    kanji: '忠義',
    romanji: 'Chūgi',
    meaning: 'Loyalty — to your purpose',
    meaningRu: 'Верность — своей цели',
    message: 'A warrior serves what they have chosen.\nReturn to the work you swore to do.',
    messageRu: 'Воин служит тому, что он избрал.\nВернись к делу, которому ты дал клятву.',
    theme: 'discipline',
  },
  {
    kanji: '克己',
    romanji: 'Kokki',
    meaning: 'Self-mastery',
    meaningRu: 'Самообладание',
    message: 'The greatest opponent sits at this desk.\nDefeat them with stillness.',
    messageRu: 'Величайший противник сидит за этим столом.\nПобеди его тишиной.',
    theme: 'discipline',
  },
  {
    kanji: '刀',
    romanji: 'Katana',
    meaning: 'The blade — your will',
    meaningRu: 'Клинок — твоя воля',
    message: 'A blade dulls without use.\nA mind dulls with misuse. Cut deeper.',
    messageRu: 'Клинок тупеет без дела.\nУм тупеет от дурного дела. Руби глубже.',
    theme: 'focus',
  },
  {
    kanji: '道',
    romanji: 'Dō',
    meaning: 'The Way',
    meaningRu: 'Путь',
    message: 'There is no destination, only the Way.\nThis tab is not the Way.',
    messageRu: 'Нет цели — есть лишь Путь.\nЭта вкладка — не Путь.',
    theme: 'mindfulness',
  },
]

/**
 * Bottom quotes for Japanese theme - displayed at page bottom
 */
export interface ZenQuote {
  text: string
  textRu: string
  author?: string
}

export const JAPANESE_ZEN_QUOTES: ZenQuote[] = [
  {
    text: 'The obstacle is the path.',
    textRu: 'Препятствие и есть путь.',
  },
  {
    text: 'The journey of a thousand miles begins with a single step.',
    textRu: 'Путешествие в тысячу ли начинается с одного шага.',
  },
  {
    text: 'Fall down seven times, stand up eight.',
    textRu: 'Упади семь раз, встань восемь.',
  },
  {
    text: 'A smooth sea never made a skilled sailor.',
    textRu: 'Спокойное море не сделает матроса искусным.',
  },
  {
    text: 'Wherever you are, be all there.',
    textRu: 'Где бы вы ни были, будьте там полностью.',
  },
  {
    text: 'The quieter you become, the more you can hear.',
    textRu: 'Чем тише вы становитесь, тем больше вы слышите.',
  },
  {
    text: 'Do not seek to follow in the footsteps of the wise. Seek what they sought.',
    textRu: 'Не пытайтесь идти по стопам мудрецов. Ищите то, что искали они.',
    author: 'Matsuo Bashō',
  },
  {
    text: 'The way out is through.',
    textRu: 'Выход — только через.',
  },
  {
    text: 'If you understand, things are just as they are. If you do not understand, things are just as they are.',
    textRu: 'Понимаете вы или нет, вещи такие, какие они есть.',
  },
  {
    text: 'Perceive that which cannot be seen with the eye.',
    textRu: 'Воспринимай то, чего не увидеть глазом.',
    author: 'Miyamoto Musashi',
  },
  {
    text: 'The way of the warrior is resolute acceptance of death.',
    textRu: 'Путь воина — решительное принятие смерти.',
    author: 'Yamamoto Tsunetomo',
  },
  {
    text: 'It is not the mountain we conquer, but ourselves.',
    textRu: 'Мы покоряем не гору — мы покоряем себя.',
  },
  {
    text: 'When you have come to the end of all the light you know, faith is to step into the darkness.',
    textRu: 'Когда кончается свет, который ты знал, — вера это шаг во тьму.',
  },
  {
    text: 'Do nothing which is of no use.',
    textRu: 'Не делай того, в чём нет пользы.',
    author: 'Miyamoto Musashi',
  },
]

/**
 * Get a random zen phrase
 */
export function getRandomZenPhrase(): ZenPhrase {
  return JAPANESE_ZEN_PHRASES[Math.floor(Math.random() * JAPANESE_ZEN_PHRASES.length)]
}

/**
 * Get a random zen quote
 */
export function getRandomZenQuote(): ZenQuote {
  return JAPANESE_ZEN_QUOTES[Math.floor(Math.random() * JAPANESE_ZEN_QUOTES.length)]
}

/**
 * Get zen phrase by theme
 */
export function getZenPhraseByTheme(theme: ZenPhrase['theme']): ZenPhrase {
  const filtered = JAPANESE_ZEN_PHRASES.filter(p => p.theme === theme)
  return filtered[Math.floor(Math.random() * filtered.length)] || getRandomZenPhrase()
}
