/**
 * Japanese Bushidō Phrase Collection
 * Kanji-based Bushidō phrases
 * Each entry includes large kanji display + meaning + context message
 */

import type { Language } from './i18n/translations';

export interface BushidoPhrase {
  kanji: string; // Large kanji character(s) to display
  romanji: string; // Romanized pronunciation
  meaning: string; // English translation
  meaningRu: string; // Russian translation
  message: string; // Contextual message in English
  messageRu: string; // Contextual message in Russian
  theme: 'focus' | 'discipline' | 'patience' | 'mindfulness' | 'strength' | 'simplicity';
}

export const JAPANESE_PHRASES: BushidoPhrase[] = [
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
    messageRu: 'Мужество — это не отсутствие отвлечений.\nЭто способность пройти миmo них, не дрогнув.',
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
    messageRu: 'Чти задачу, что перед тобой.\nОтвлечение — это forma неуважения.',
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
];

export interface BushidoQuote {
  text: string;
  textRu: string;
  author?: string;
}

export const JAPANESE_QUOTES: BushidoQuote[] = [
  { text: 'The obstacle is the path.', textRu: 'Препятствие и есть путь.' },
  { text: 'The journey of a thousand miles begins with a single step.', textRu: 'Путешествие в тысячу ли начинается с одного шага.' },
  { text: 'Fall down seven times, stand up eight.', textRu: 'Упади семь раз, встань восемь.' },
  { text: 'A smooth sea never made a skilled sailor.', textRu: 'Спокойное море не сделает маtroса искусным.' },
  { text: 'Wherever you are, be all there.', textRu: 'Где бы вы ни были, будьте там полностью.' },
  { text: 'The quieter you become, the more you can hear.', textRu: 'Чем тише вы становитесь, тем больше вы слышите.' },
  {
    text: 'Do not seek to follow in the footsteps of the wise. Seek what they sought.',
    textRu: 'Не пытайтесь идти по стопам мудрецов. Ищите то, что искали они.',
    author: 'Matsuo Bashō',
  },
  { text: 'The way out is through.', textRu: 'Выход — только через.' },
  { text: 'If you understand, things are just as they are. If you do not understand, things are just as they are.', textRu: 'Понимаете вы или нет, вещи такие, какие они есть.' },
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
  { text: 'It is not the mountain we conquer, but ourselves.', textRu: 'Мы покоряем не гору — мы покоряем себя.' },
  { text: 'When you have come to the end of all the light you know, faith is to step into the darkness.', textRu: 'Когда кончается свет, который ты знал, — вера это шаг во тьmu.' },
  {
    text: 'Do nothing which is of no use.',
    textRu: 'Не делай того, в чём нет пользы.',
    author: 'Miyamoto Musashi',
  },
];

// Phrase translations dictionary keyed by Kanji
const phraseTranslations: Record<string, Partial<Record<Language, { meaning: string; message: string }>>> = {
  '継続': {
    es: { meaning: 'Continuidad', message: 'Regresa a tu propósito.\nEsta distracción es solo una onda en el agua.' },
    de: { meaning: 'Kontinuität', message: 'Kehre zu deiner Absicht zurück.\nDiese Ablenkung ist nur eine Welle auf dem Wasser.' },
    fr: { meaning: 'Continuité', message: 'Retournez à votre but.\nCette distraction n\'est qu\'une ondulation sur l\'eau.' },
    ja: { meaning: '継続', message: '目的に立ち返りましょう。\nこの雑念は水面のさざ波に過ぎません。' },
    zh: { meaning: '连续性', message: '重归你的初心。\n这一分心不过是水面的一丝涟漪。' },
    pt: { meaning: 'Continuidade', message: 'Retorne ao seu propósito.\nEsta distração é apenas uma ondulação na água.' },
  },
  '没頭': {
    es: { meaning: 'Inmersión', message: 'Absorción completa en tu trabajo.\nDeja que las distracciones se desvanezcan como la niebla matutina.' },
    de: { meaning: 'Immersion', message: 'Vollständiges Aufgehen in deiner Arbeit.\nLass Ablenkungen wie Morgennebel verblassen.' },
    fr: { meaning: 'Immersion', message: 'Absorption totale dans votre travail.\nLaissez les distractions s\'estomper comme la brume matinale.' },
    ja: { meaning: '没頭', message: '仕事に完全に没頭しましょう。\n雑念を朝霧のように消し去りなさい。' },
    zh: { meaning: '沉浸', message: '全身心投入工作。\n让分心如晨雾般消散。' },
    pt: { meaning: 'Imersão', message: 'Absorção completa em seu trabalho.\nDeixe as distrações desaparecerem como a névoa da manhã.' },
  },
  '集中': {
    es: { meaning: 'Concentración', message: 'Una cosa a la vez.\nLa mente errante no encuentra paz.' },
    de: { meaning: 'Konzentration', message: 'Eine Sache nach der anderen.\nDer wandernde Geist findet keinen Frieden.' },
    fr: { meaning: 'Concentration', message: 'Une chose à la fois.\nL\'esprit errant ne trouve pas de paix.' },
    ja: { meaning: '集中', message: '一時に一事。\n彷徨う心に平穏はありません。' },
    zh: { meaning: '集中', message: '一次只做一件事。\n游离的心灵得不到安宁。' },
    pt: { meaning: 'Concentração', message: 'Uma coisa de cada vez.\nA mente errante não encontra paz.' },
  },
  '修行': {
    es: { meaning: 'Entrenamiento', message: 'Cada momento es práctica.\nCada resistencia construye disciplina.' },
    de: { meaning: 'Training', message: 'Jeder Moment ist Praxis.\nJeder Widerstand baut Disziplin auf.' },
    fr: { meaning: 'Entraînement', message: 'Chaque moment est une pratique.\nChaque résistance renforce la discipline.' },
    ja: { meaning: '修行', message: '日常のすべてが修行です。\n己に抗う力こそが規律を築きます。' },
    zh: { meaning: '修行', message: '每时每刻皆是修行。\n每一次抗争都在铸就自律。' },
    pt: { meaning: 'Treinamento', message: 'Cada momento é prática.\nCada resistência constrói disciplina.' },
  },
  '忍耐': {
    es: { meaning: 'Perseverancia', message: 'El bambú se dobla pero no se rompe.\nTu enfoque se fortalecerá a través de la resistencia.' },
    de: { meaning: 'Beharrlichkeit', message: 'Der Bambus biegt sich, aber er bricht nicht.\nDein Fokus wird sich durch Widerstand stärken.' },
    fr: { meaning: 'Persévérance', message: 'Le bambou plie mais ne rompt pas.\nVotre concentration se renforcera à travers la résistance.' },
    ja: { meaning: '忍耐', message: '竹は曲がれども折れず。\nあなたの集中もまた、抵抗を通じて強くなります。' },
    zh: { meaning: '坚韧', message: '竹可弯而不可折。\n你的专注将在抵抗中变得强大。' },
    pt: { meaning: 'Perseverança', message: 'O bambu dobra, mas não quebra.\nSeu foco se fortalecerá através da resistência.' },
  },
  '平静': {
    es: { meaning: 'Serenidad', message: 'El agua tranquila refleja la luna claramente.\nUna mente tranquila ve el camino a seguir.' },
    de: { meaning: 'Gelassenheit', message: 'Stilles Wasser reflektiert den Mond klar.\nEin ruhiger Geist sieht den Weg vor sich.' },
    fr: { meaning: 'Sérénité', message: 'L\'eau calme reflète clairement la lune.\nUn esprit calme voit le chemin à suivre.' },
    ja: { meaning: '平静', message: '静水は月を明鏡のように映します。\n穏やかな心にこそ、進むべき道が見えます。' },
    zh: { meaning: '平静', message: '静水能清澈地倒映明月。\n平静的心灵才能看清前行的道路。' },
    pt: { meaning: 'Serenidade', message: 'A água calma reflete a lua claramente.\nUma mente calma vê o caminho à frente.' },
  },
  '簡素': {
    es: { meaning: 'Simplicidad', message: 'Elimina lo innecesario.\nLo que queda es lo esencial.' },
    de: { meaning: 'Einfachheit', message: 'Entferne das Überflüssige.\nWas bleibt, ist das Wesentliche.' },
    fr: { meaning: 'Simplicité', message: 'Supprimez l\'inutile.\nCe qui reste est l\'essentiel.' },
    ja: { meaning: '簡素', message: '不要なものを取り除きなさい。\n最後に残るものこそが本質です。' },
    zh: { meaning: '简单', message: '摒除无用之物。\n留下的即是核心。' },
    pt: { meaning: 'Simplicidade', message: 'Remova o desnecessário.\nO que resta é essencial.' },
  },
  '今': {
    es: { meaning: 'Ahora', message: 'Este momento es todo lo que hay.\nEstás aquí, completamente presente.' },
    de: { meaning: 'Jetzt', message: 'Dieser Moment ist alles, was existiert.\nSei hier, vollkommen gegenwärtig.' },
    fr: { meaning: 'Maintenant', message: 'Ce moment est tout ce qui existe.\nSoyez ici, pleinement présent.' },
    ja: { meaning: '今', message: 'この瞬間こそがすべてです。\nここに在り、完全に集中しなさい。' },
    zh: { meaning: '当下', message: '此时此刻即是全部。\n留在此处，专注于当下。' },
    pt: { meaning: 'Agora', message: 'Este momento é tudo o que existe.\nEsteja aqui, totalmente presente.' },
  },
  '不動心': {
    es: { meaning: 'Mente Inamovible', message: 'Como una montaña en la tormenta.\nTu determinación permanece inquebrantable.' },
    de: { meaning: 'Unerschütterlicher Geist', message: 'Wie ein Berg im Sturm.\nDeine Entschlossenheit bleibt unerschüttert.' },
    fr: { meaning: 'Esprit Inébranlable', message: 'Comme une montagne dans la tempête.\nVotre détermination reste inébranlable.' },
    ja: { meaning: '不動心', message: '嵐の中の山のごとく。\nあなたの志は決して揺るぎません。' },
    zh: { meaning: '不动心', message: '如暴风雨中的高山。\n你的意志巍然不动。' },
    pt: { meaning: 'Mente Inabalável', message: 'Como uma montanha na tempestade.\nSua determinação permanece inabalável.' },
  },
  '一期一会': {
    es: { meaning: 'Una oportunidad, un encuentro', message: 'Este momento nunca volverá.\nTrátalo con respeto y total atención.' },
    de: { meaning: 'Einmalige Begegnung', message: 'Dieser Moment kommt nie wieder.\nBehandle ihn mit Respekt und voller Aufmerksamkeit.' },
    fr: { meaning: 'Rencontre unique', message: 'Ce moment ne se reproduira jamais.\nTraitez-le avec respect et une attention totale.' },
    ja: { meaning: '一期一会', message: 'この瞬間は二度と戻りません。\n敬意と全き注意力をもって臨みなさい。' },
    zh: { meaning: '一期一会', message: '此瞬间绝不重来。\n敬重它，倾注你全部的注意力。' },
    pt: { meaning: 'Encontro único', message: 'Este momento nunca mais voltará.\nTrate-o com respeito e total atenção.' },
  },
  '精進': {
    es: { meaning: 'Devoción', message: 'Dedicación sincera a tu oficio.\nEl esfuerzo a medias produce resultados a medias.' },
    de: { meaning: 'Hingabe', message: 'Aufrichtige Hingabe an dein Handwerk.\nHalbherzige Bemühungen bringen halbe Ergebnisse.' },
    fr: { meaning: 'Dévouement', message: 'Dévouement sincère à votre métier.\nUn effort à demi engagé donne des demi-résultats.' },
    ja: { meaning: '精進', message: '自らの生業へ、一心不乱に打ち込みなさい。\n中途半端な努力は、中途半端な結果しか生みません。' },
    zh: { meaning: '精进', message: '全心全意投身于你的事业。\n半心半意的努力只能换来减半的成果。' },
    pt: { meaning: 'Devotamento', message: 'Dedicação sincera ao seu ofício.\nO esforço pela metade traz resultados pela metade.' },
  },
  '無心': {
    es: { meaning: 'Mente Vacía', message: 'Actúa sin pensar demasiado.\nEl maestro se mueve sin vacilar.' },
    de: { meaning: 'Leerer Geist', message: 'Handle ohne langes Nachdenken.\nDer Meister bewegt sich ohne Zögern.' },
    fr: { meaning: 'Sans-esprit', message: 'Agissez sans trop réfléchir.\nLe maître se meut sans hésitation.' },
    ja: { meaning: '無心', message: '雑念なく行動しなさい。\n達人は迷うことなく動くものです。' },
    zh: { meaning: '无心', message: '行随心动，勿过度思虑。\n宗师出招，绝无迟疑。' },
    pt: { meaning: 'Mente Vazia', message: 'Aja sem pensar demais.\nO mestre move-se sem hesitação.' },
  },
  '義': {
    es: { meaning: 'Rectitud — la decisión correcta', message: 'Un samurái elige el camino correcto aunque sea difícil, no el fácil incorrecto.\nCierra esta pestaña. Vuelve a tu camino.' },
    de: { meaning: 'Gerechtigkeit — die richtige Entscheidung', message: 'Ein Samurai wählt das schwere Recht gegenüber dem leichten Unrecht.\nSchließe diesen Tab. Kehre auf deinen Weg zurück.' },
    fr: { meaning: 'Droiture — la décision juste', message: 'Un samouraï choisit le droit chemin difficile plutôt que le mauvais chemin facile.\nFermez cet onglet. Retournez sur votre chemin.' },
    ja: { meaning: '義', message: '武士は易き誤りより、難き正しきを選びます。\nこのタブを閉じ、己の道へ戻りなさい。' },
    zh: { meaning: '义 — 正确的抉择', message: '武士宁选艰难之对，不取易得之错。\n关闭此标签页。重回前行之路。' },
    pt: { meaning: 'Retidão — a decisão certa', message: 'Um samurai escolhe o caminho correto, mesmo difícil, em vez do erro fácil.\nFeche esta aba. Volte ao seu caminho.' },
  },
  '勇': {
    es: { meaning: 'Coraje — hacer lo que se teme', message: 'El coraje no es la ausencia de distracción.\nEs pasar de largo sin pestañear.' },
    de: { meaning: 'Mut — tun, was man fürchtet', message: 'Mut ist nicht die Abwesenheit von Ablenkung.\nEs ist, an ihr vorbeizugehen, ohne zu zucken.' },
    fr: { meaning: 'Courage — faire ce que l\'on craint', message: 'Le courage n\'est pas l\'absence de distraction.\nC\'est passer outre sans ciller.' },
    ja: { meaning: '勇', message: '勇気とは雑念なきことではなく。\n惑わされることなく通り抜けることです。' },
    zh: { meaning: '勇 — 直面恐惧', message: '勇气并非没有分心。\n而是目不斜视地跨过它。' },
    pt: { meaning: 'Coragem — fazer o que se teme', message: 'Coragem não é a ausência de distração.\nÉ passar por ela sem hesitar.' },
  },
  '仁': {
    es: { meaning: 'Benevolencia — con tu propio futuro', message: 'Sé misericordioso con la persona en la que te convertirás.\nNo robes horas del mañana.' },
    de: { meaning: 'Menschlichkeit — für deine eigene Zukunft', message: 'Sei barmherzig mit dem, der du werden wirst.\nStehle keine Stunden von morgen.' },
    fr: { meaning: 'Bienveillance — envers votre propre avenir', message: 'Soyez miséricordieux envers celui que vous deviendrez.\nNe volez pas d\'heures à demain.' },
    ja: { meaning: '仁', message: '未来の己に情けをかけなさい。\n明日という日から時間を盗むことなかれ。' },
    zh: { meaning: '仁 — 善待未来的你', message: '对未来的自己仁慈一些。\n勿偷走本属于明天的时光。' },
    pt: { meaning: 'Benevolência — para com seu próprio futuro', message: 'Seja misericordioso com quem você se tornará.\nNão roube horas do amanhã.' },
  },
  '礼': {
    es: { meaning: 'Respeto — por el trabajo', message: 'Honra la tarea que tienes ante ti.\nLa distracción es una forma de falta de respeto.' },
    de: { meaning: 'Höflichkeit — Respekt vor der Arbeit', message: 'Ehre die Aufgabe vor dir.\nAblenkung ist eine Form von Respektlosigkeit.' },
    fr: { meaning: 'Respect — pour le travail', message: 'Honorez la tâche devant vous.\nLa distraction est une forme de manque de respect.' },
    ja: { meaning: '礼', message: '目の前の務めを敬いなさい。\n雑念に囚われることは、不敬の表れです。' },
    zh: { meaning: '礼 — 尊重工作', message: '敬重你面前的任务。\n分心即是对工作的不敬。' },
    pt: { meaning: 'Respeito — pelo trabalho', message: 'Honre a tarefa diante de você.\nA distração é uma forma de desrespeito.' },
  },
  '誠': {
    es: { meaning: 'Sinceridad — hablar con acciones', message: 'Dijiste que te enfocarías.\nDeja que los hechos sean tus palabras.' },
    de: { meaning: 'Aufrichtigkeit — Taten sprechen lassen', message: 'Du hast gesagt, du würdest dich fokussieren.\nLass das Tun zum Wort werden.' },
    fr: { meaning: 'Sincérité — parler par des actes', message: 'Vous avez dit que vous vous concentreriez.\nLaissez l\'acte devenir parole.' },
    ja: { meaning: '誠', message: '集中すると心に決めたはず。\n行いをもって、その誓いを証明しなさい。' },
    zh: { meaning: '诚 — 言行一致', message: '你曾承诺过要专注。\n让行动成为你的诺言。' },
    pt: { meaning: 'Sinceridade — falar através de ações', message: 'Você disse que focaria.\nDeixe que a ação seja a sua palavra.' },
  },
  '名誉': {
    es: { meaning: 'Honor — el veredicto sobre uno mismo', message: 'Nadie te observa excepto tú.\nEsa es la única audiencia que importa.' },
    de: { meaning: 'Ehre — das eigene Urteil', message: 'Niemand sieht dir zu außer du selbst.\nDas ist das einzige Publikum, das zählt.' },
    fr: { meaning: 'Honneur — le verdict de soi', message: 'Personne ne regarde sauf vous.\nC\'est le seul public qui compte.' },
    ja: { meaning: '名誉', message: '見ているのは己のみ。\nそれこそが最も重い証人です。' },
    zh: { meaning: '名誉 — 自我裁决', message: '唯有你自己审视着你。\n这是唯一至关重要的观众。' },
    pt: { meaning: 'Honra — o veredicto sobre si mesmo', message: 'Ninguém observa você além de você mesmo.\nEsse é o único público que importa.' },
  },
  '忠義': {
    es: { meaning: 'Lealtad — a tu propósito', message: 'Un guerrero sirve a lo que ha elegido.\nVuelve al trabajo que juraste hacer.' },
    de: { meaning: 'Loyalität — zu deinem Zweck', message: 'Ein Krieger dient dem, was er gewählt hat.\nKehre zur Arbeit zurück, die du geschworen hast zu tun.' },
    fr: { meaning: 'Loyauté — envers votre but', message: 'Un guerrier sert ce qu\'il a choisi.\nRetournez au travail que vous avez juré d\'accomplir.' },
    ja: { meaning: '忠義', message: '武士は自ら選んだ主君に仕えます。\n果たすと誓った己の職務に戻りなさい。' },
    zh: { meaning: '忠义 — 忠于目标', message: '战士应当效忠于自己的抉择。\n重温誓言，返回未竟之业。' },
    pt: { meaning: 'Lealdade — ao seu propósito', message: 'Um guerreiro serve ao que escolheu.\nVolte ao trabalho que jurou realizar.' },
  },
  '克己': {
    es: { meaning: 'Autocontrol', message: 'El mayor oponente está sentado en este escritorio.\nDerrótalo con quietud.' },
    de: { meaning: 'Selbstbeherrschung', message: 'Der größte Gegner sitzt an diesem Schreibtisch.\nBesiege ihn mit Stille.' },
    fr: { meaning: 'Maîtrise de soi', message: 'Le plus grand adversaire est assis à ce bureau.\nVainquez-le par l\'immobilité.' },
    ja: { meaning: '克己', message: '最大の敵はこの机の前に座っています。\n静寂をもってその敵に打ち勝ちこえなさい。' },
    zh: { meaning: '克己', message: '最强大的对手正坐在这张桌前。\n以沉静击败他。' },
    pt: { meaning: 'Autodomínio', message: 'O maior oponente está sentado nesta mesa.\nDerrote-o com quietude.' },
  },
  '刀': {
    es: { meaning: 'La hoja — tu voluntad', message: 'Una hoja se desafila sin uso.\nUna mente se embota con el mal uso. Corta más profundo.' },
    de: { meaning: 'Die Klinge — dein Wille', message: 'Eine Klinge stumpft ab, wenn sie nicht benutzt wird.\nEin Geist stumpft durch Missbrauch ab. Schneide tiefer.' },
    fr: { meaning: 'La lame — votre volonté', message: 'Une lame s\'émousse sans usage.\nUn esprit s\'émousse par le mauvais usage. Tranchez plus profondément.' },
    ja: { meaning: '刀', message: '刃は使わねば鈍ります。\n心もまた、怠れば鈍るもの。より深く断ちなさい。' },
    zh: { meaning: '刀 — 你的意志', message: '刀剑不用则钝。\n心志用错方向则废。斩除杂念，切入核心。' },
    pt: { meaning: 'A lâmina — sua vontade', message: 'Uma lâmina fica cega sem uso.\nA mente enfraquece com o mau uso. Corte mais profundo.' },
  },
  '道': {
    es: { meaning: 'El Camino', message: 'No hay destino, solo el Camino.\nEsta pestaña no es el Camino.' },
    de: { meaning: 'Der Weg', message: 'Es gibt kein Ziel, nur den Weg.\nDieser Tab ist nicht der Weg.' },
    fr: { meaning: 'La Voie', message: 'Il n\'y a pas de destination, seulement la Voie.\nCet onglet n\'est pas la Voie.' },
    ja: { meaning: '道', message: '目的地などありません、ただ道があるのみ。\nこのタブは歩むべき道ではありません。' },
    zh: { meaning: '道', message: '没有终点，唯有一往无前之道。\n此标签页并非行道之所。' },
    pt: { meaning: 'O Caminho', message: 'Não há destino, apenas o Caminho.\nEsta aba não é o Caminho.' },
  },
};

// Quote translations dictionary keyed by index
const quoteTranslations: Record<number, Partial<Record<Language, { text: string }>>> = {
  0: {
    es: { text: 'El obstáculo es el camino.' },
    de: { text: 'Das Hindernis ist der Weg.' },
    fr: { text: 'L\'obstacle est le chemin.' },
    ja: { text: '障害そのものが道である。' },
    zh: { text: '障碍即是行道之处。' },
    pt: { text: 'O obstáculo é o caminho.' },
  },
  1: {
    es: { text: 'Un viaje de mil millas comienza con un solo paso.' },
    de: { text: 'Eine Reise von tausend Meilen beginnt mit einem einzigen Schritt.' },
    fr: { text: 'Un voyage de mille lieues commence par un seul pas.' },
    ja: { text: '千里の道も一歩から始まる。' },
    zh: { text: '千里之行，始于足下。' },
    pt: { text: 'Uma jornada de mil milhas começa com um único passo.' },
  },
  2: {
    es: { text: 'Cáete siete veces, levántate ocho.' },
    de: { text: 'Siebenmal hinfallen, achtmal aufstehen.' },
    fr: { text: 'Tomber sept fois, se relever huit.' },
    ja: { text: '七転び八起き。' },
    zh: { text: '七遭跌倒，八度崛起。' },
    pt: { text: 'Cair sete vezes, levantar oito.' },
  },
  3: {
    es: { text: 'Un mar en calma nunca hizo a un marinero experto.' },
    de: { text: 'Eine ruhige See hat noch nie einen geschickten Seemann hervorgebracht.' },
    fr: { text: 'Une mer calme n\'a jamais fait un marin qualifié.' },
    ja: { text: '穏やかな海は優れた船乗りを育てない。' },
    zh: { text: '平静的海洋练不出熟练的水手。' },
    pt: { text: 'Um mar calmo nunca fez um marinheiro experiente.' },
  },
  4: {
    es: { text: 'Dondequiera que estés, está allí por completo.' },
    de: { text: 'Wo immer du bist, sei ganz dort.' },
    fr: { text: 'Où que vous soyez, soyez-y tout entier.' },
    ja: { text: 'どこにいようとも、身も心もそこに在れ。' },
    zh: { text: '无论身处何地，皆当全心全意在场。' },
    pt: { text: 'Onde quer que você esteja, esteja lá por completo.' },
  },
  5: {
    es: { text: 'Cuanto más silencioso te vuelves, más puedes escuchar.' },
    de: { text: 'Je ruhiger du wirst, desto mehr kannst du hören.' },
    fr: { text: 'Plus vous devenez silencieux, plus vous pouvez entendre.' },
    ja: { text: '静かになればなるほど、多くのものが聞こえてくる。' },
    zh: { text: '越是沉静，所闻越多。' },
    pt: { text: 'Quanto mais silencioso você se torna, mais você consegue ouvir.' },
  },
  6: {
    es: { text: 'No busques seguir los pasos de los sabios. Busca lo que ellos buscaron.' },
    de: { text: 'Suche nicht den Fußspuren der Weisen zu folgen. Suche, was sie suchten.' },
    fr: { text: 'Ne cherchez pas à suivre les pas des sages. Cherchez ce qu\'ils ont cherché.' },
    ja: { text: '古人の跡を求めず、古人の求めたる所を求めよ。' },
    zh: { text: '不求追随贤哲之足迹，但求追寻贤哲之所求。' },
    pt: { text: 'Não queira seguir as pegadas dos sábios. Busque o que eles buscaram.' },
  },
  7: {
    es: { text: 'La salida es a través.' },
    de: { text: 'Der Ausweg führt hindurch.' },
    fr: { text: 'La sortie est à travers.' },
    ja: { text: '逃げ道は通り抜けることのみ。' },
    zh: { text: '突围之道，唯有穿行其中。' },
    pt: { text: 'A saída é através.' },
  },
  8: {
    es: { text: 'Si comprendes, las cosas son exactamente como son. Si no comprendes, las cosas son exactamente como son.' },
    de: { text: 'Wenn du verstehst, sind die Dinge genau so, wie sie sind. Wenn du nicht verstehst, sind die Dinge genau so, wie sie sind.' },
    fr: { text: 'Si vous comprenez, les choses sont telles qu\'elles sont. Si vous ne comprenez pas, les choses sont telles qu\'elles sont.' },
    ja: { text: '悟れば万事ありのまま。悟らねば万事ありのまま。' },
    zh: { text: '了悟与否，世间万物皆如其所是。' },
    pt: { text: 'Se você compreende, as coisas são exatamente como são. Se você não compreende, as coisas são exatamente como são.' },
  },
  9: {
    es: { text: 'Percibe aquello que no se puede ver con los ojos.' },
    de: { text: 'Nimm wahr, was mit dem Auge nicht gesehen werden kann.' },
    fr: { text: 'Percevez ce qui ne peut être vu par l\'œil.' },
    ja: { text: '目に見えぬところを悟るべし。' },
    zh: { text: '感知那些目所不能及的事物。' },
    pt: { text: 'Perceba aquilo que não se pode ver com os olhos.' },
  },
  10: {
    es: { text: 'El camino del guerrero es la aceptación resuelta de la muerte.' },
    de: { text: 'Der Weg des Kriegers ist das entschlossene Akzeptieren des Todes.' },
    fr: { text: 'La voie du guerrier est l\'acceptation résolue de la mort.' },
    ja: { text: '武士道と云ふは死ぬ事と見付けたり。' },
    zh: { text: '武士之道，即坚定地面对死亡。' },
    pt: { text: 'O caminho do guerreiro é a aceitação resoluta da morte.' },
  },
  11: {
    es: { text: 'No es a la montaña a la que conquistamos, sino a nosotros mismos.' },
    de: { text: 'Es ist nicht der Berg, den wir bezwingen, sondern wir selbst.' },
    fr: { text: 'Ce n\'est pas la montagne que nous conquérons, mais nous-mêmes.' },
    ja: { text: '征服すべきは山ではなく、己自身である。' },
    zh: { text: '我们征服的并非高山，而是自我。' },
    pt: { text: 'Não é a montanha que conquistamos, mas a nós mesmos.' },
  },
  12: {
    es: { text: 'Cuando has llegado al final de toda la luz que conoces, la fe es dar un paso hacia la oscuridad.' },
    de: { text: 'Wenn du am Ende all des Lichts angelangt bist, das du kennst, bedeutet Glaube, in die Dunkelheit zu treten.' },
    fr: { text: 'Lorsque vous êtes arrivé au bout de toute la lumière que vous connaissez, la foi consiste à faire un pas dans l\'obscurité.' },
    ja: { text: '知る限りの光が尽き果てたとき、闇へ踏み出すことこそが信念である。' },
    zh: { text: '当你走到了所知光芒的尽头，信念便是迈步踏入黑暗。' },
    pt: { text: 'Quando você chega ao fim de toda a luz que conhece, fé é dar um passo em direção à escuridão.' },
  },
  13: {
    es: { text: 'No hagas nada que no sirva para nada.' },
    de: { text: 'Tue nichts, was nutzlos ist.' },
    fr: { text: 'Ne faites rien qui soit inutile.' },
    ja: { text: '役に立たぬことをすることなかれ。' },
    zh: { text: '不作无用之事。' },
    pt: { text: 'Não faça nada que não tenha utilidade.' },
  },
};

/**
 * Get phrase meaning based on language
 */
export function getPhraseMeaning(phrase: BushidoPhrase, lang: Language): string {
  if (lang === 'ru') return phrase.meaningRu;
  const translation = phraseTranslations[phrase.kanji]?.[lang];
  return translation?.meaning || phrase.meaning;
}

/**
 * Get phrase message based on language
 */
export function getPhraseMessage(phrase: BushidoPhrase, lang: Language): string {
  if (lang === 'ru') return phrase.messageRu;
  const translation = phraseTranslations[phrase.kanji]?.[lang];
  return translation?.message || phrase.message;
}

/**
 * Get quote text based on language
 */
export function getQuoteText(quote: BushidoQuote, lang: Language): string {
  if (lang === 'ru') return quote.textRu;
  const index = JAPANESE_QUOTES.findIndex(q => q.text === quote.text);
  if (index !== -1) {
    const translation = quoteTranslations[index]?.[lang];
    if (translation?.text) return translation.text;
  }
  return quote.text;
}

/**
 * Get a random phrase
 */
export function getRandomBushidoPhrase(): BushidoPhrase {
  return JAPANESE_PHRASES[Math.floor(Math.random() * JAPANESE_PHRASES.length)];
}

/**
 * Get a random quote
 */
export function getRandomBushidoQuote(): BushidoQuote {
  return JAPANESE_QUOTES[Math.floor(Math.random() * JAPANESE_QUOTES.length)];
}

/**
 * Get phrase by theme
 */
export function getBushidoPhraseByTheme(theme: BushidoPhrase['theme']): BushidoPhrase {
  const filtered = JAPANESE_PHRASES.filter(p => p.theme === theme);
  return filtered[Math.floor(Math.random() * filtered.length)] || getRandomBushidoPhrase();
}
