/**
 * The public sample result behind "See a sample result" (Landing.dc.html → Results.dc.html?sample=1).
 * Content is the design's own illustrative result (IA-0142, band 6.5) and is always labelled "Sample"
 * on the page — it is never mixed with a learner's data.
 */
import type { FullResult } from './results-view';

const RD: Array<[number, string, string, string, string, string, string, string]> = [
  [1, 'Urban orchards were common in European cities before the 1960s.', 'tfng', 'TRUE', 'TRUE', 'A', 'a practice largely abandoned in the 1960s', '“Abandoned in the 1960s” means the practice existed before then.'],
  [2, 'Malmö has published the full cost of its orchard programme.', 'tfng', 'NOT GIVEN', 'FALSE', 'A', 'although no full budget has been published', 'The passage says directly that no full budget has been published, so the statement contradicts it.'],
  [3, 'Fruit could be picked freely at any time in fifteenth-century Ghent.', 'tfng', 'FALSE', 'FALSE', 'B', 'fines for picking fruit before the official harvest day', 'Fines for early picking show it was not free at any time.'],
  [4, 'Most volunteers surveyed had previously belonged to a community group.', 'tfng', 'FALSE', 'FALSE', 'C', 'just under half had never joined a community group before', 'Just under half had never joined, so just over half had: this is “most”. Watch the direction of the statement.'],
  [5, 'Volunteers in Malmö are paid for pruning work.', 'tfng', 'FALSE', 'NOT GIVEN', 'C', 'Most said they were drawn by the chance to learn pruning and grafting.', 'Pay is never mentioned. If the text says nothing either way, the answer is NOT GIVEN.'],
  [6, 'Vandalism has caused less damage than planners expected.', 'tfng', 'TRUE', 'TRUE', 'D', 'losses have been lower than predicted', 'Lower than predicted matches “less than expected”.'],
  [7, 'Twentieth-century parks were designed mainly to be…', 'mcq_single', 'B', 'B', 'B', 'places to look at rather than to use', 'Paragraph B contrasts looking with using.'],
  [8, 'What attracted most volunteers?', 'mcq_single', 'C', 'C', 'C', 'the chance to learn pruning and grafting', 'Pruning and grafting are practical skills.'],
  [9, 'Researchers link the low level of vandalism to…', 'mcq_single', 'C', 'B', 'D', 'residents help plant the trees themselves', 'The cause is shared ownership from planting. Fines appear in paragraph B and are about Ghent.'],
  [10, 'Some ecologists are concerned that fruit trees…', 'mcq_single', 'C', 'C', 'E', 'offer less to local insects than native hedgerow species', 'Fewer benefits for local insects.'],
  [11, 'Records from Ghent mention ______ for picking fruit early.', 'sentence_completion', 'fines', 'fines', 'B', 'fines for picking fruit', 'Word taken directly from the passage.'],
  [12, 'Volunteers wanted to learn pruning and ______.', 'sentence_completion', 'grafting trees', 'grafting', 'C', 'learn pruning and grafting', 'Only “grafting” fits; “trees” is not in that phrase, so the answer changes the meaning and is marked wrong.'],
  [13, 'Uncollected fruit can attract wasps and ______.', 'sentence_completion', 'rats', 'rats', 'E', 'attract wasps and rats', 'Exact word from paragraph E.'],
];
const LS: Array<[number, string, string, string]> = [
  [1, 'Name: Sarah ______', 'Thornton', 'Thornton'], [2, 'Membership type', 'family', 'family'], [3, 'Preferred start date', '3 March', '3 March'], [4, 'Visits per week', '4', 'three'],
  [5, 'Main activity', 'swimming', 'swimming'], [6, 'Current fitness level', 'average', 'average'], [7, 'Postcode', 'BR7 4LN', 'BR7 4LN'], [8, 'Heard about the centre from', 'a newspaper', 'a leaflet'],
  [9, 'Monthly fee', '£42', '£42'], [10, 'Free extra', 'one yoga session', 'one yoga session'],
];

const review = [
  ...LS.map(([n, q, yours, correct]) => ({
    questionId: `l${n}`, sectionKey: 'listening', no: n, type: 'form_completion', yours, correct: [correct], isCorrect: yours === correct, points: yours === correct ? 1 : 0,
    explanation: yours === correct ? 'Matches the recording.' : `The speaker first says “${yours}” and then corrects it to “${correct}”. In form completion, the last version given is the answer.`, passageAnchor: null,
  })),
  ...RD.map(([n, , type, yours, correct, , , why]) => ({
    questionId: `r${n}`, sectionKey: 'reading', no: n, type, yours, correct: [correct], isCorrect: yours === correct, points: yours === correct ? 1 : 0, explanation: why, passageAnchor: null,
  })),
];
const reviewExtra: FullResult['mock']['reviewExtra'] = {};
for (const [n, q] of LS) reviewExtra[`l${n}`] = { prompt: q, typeLabelKey: 'form_completion', evidence: null };
for (const [n, q, type, , , para, ev] of RD) reviewExtra[`r${n}`] = { prompt: q, typeLabelKey: type, evidence: { paragraph: para, text: ev } };

export const SAMPLE_RESULT = {
  attemptId: 'sample', examCode: 'IELTS_ACADEMIC', mode: 'full', status: 'FINAL', sections: [], overall: null, certificate: null,
  reviewAvailableAt: '2026-10-12T10:00:00.000Z', review, ai: [],
  overallBand: { value: 6.5, label: '6.5', level: 'B2', basis: ['listening', 'reading', 'writing'], missing: ['speaking'], pending: false },
  serverNow: '2026-10-12T10:00:00.000Z',
  mock: {
    exam: 'ielts', testCode: 'IA-0142', mode: 'full', sectionKey: null, finishedAt: '2026-10-12', cefr: 'B2',
    target: { value: 7, gap: 0.5 },
    sectionCards: [
      { key: 'listening', score: 7, label: '7.0', correct: 32, total: 40, aiGraded: false, status: 'READY' },
      { key: 'reading', score: 6.5, label: '6.5', correct: 28, total: 40, aiGraded: false, status: 'READY' },
      { key: 'writing', score: 6, label: '6.0', correct: null, total: null, aiGraded: true, status: 'READY' },
    ],
    accuracyByType: ([['sentence_completion', 15, 17], ['form_completion', 9, 10], ['mcq_single', 11, 14], ['map_labelling', 7, 10], ['matching_headings', 4, 7], ['tfng', 8, 13]] as const)
      .map(([type, c, tot]) => ({ section: 'reading' as const, type, correct: c, total: tot, pct: Math.round((c / tot) * 100) })),
    strongest: ['sentence_completion'], weakest: ['tfng'],
    nextSteps: [{ code: 'practice_type', params: { type: 'tfng' } }, { code: 'practice_type', params: { type: 'matching_headings' } }, { code: 'writing_criterion', params: { criterion: 'TR', task: 'task2' } }],
    writing: [
      {
        taskKey: 'task1', status: 'READY', prompt: 'Task 1 · Car ownership in three countries, 1990–2020', words: 176, band: 6, feedbackLang: 'en',
        essay: 'The line graph compares the proportion of households that owned at least one car in Germany, Poland and Turkey over a thirty-year period from 1990.\n\nOverall, car ownership rose in all three countries, although Germany remained far ahead throughout.\n\nIn 1990 around 70% of German households had a car, compared with roughly 35% in Poland and only 15% in Turkey. Germany increased slowly to about 80% by 2020. Poland grew the fastest, more than doubling to 72%, so the gap with Germany became very small.\n\nTurkey also increased, but it stayed the lowest, reaching about 40% at the end of the period.',
        criteria: [
          { code: 'TA', score: 6, max: 9, feedback: 'Clear overview and key figures. Some data is listed rather than compared; group Poland and Turkey as the fast risers.' },
          { code: 'CC', score: 6.5, max: 9, feedback: 'Logical paragraphing. Linking is accurate but repetitive (“also”, “but”).' },
          { code: 'LR', score: 6, max: 9, feedback: 'Adequate range for trends. Try “a steady climb”, “narrowed the gap”, “trailed behind”.' },
          { code: 'GRA', score: 6, max: 9, feedback: 'Mostly accurate simple and compound sentences; few complex structures.' },
        ],
        strengths: ['A clear overview sentence in the second paragraph.', 'Figures are accurate and taken from the chart.'],
        nextSteps: ['Compare countries in the same sentence instead of describing each one in turn.', 'Use one relative clause per paragraph to show range.'],
      },
      {
        taskKey: 'task2', status: 'READY', prompt: 'Task 2 · Parks or roads?', words: 268, band: 6, feedbackLang: 'en',
        essay: 'Many cities face a choice between building new roads and creating more public parks. In my opinion, parks should usually come first, although some road investment is still necessary.\n\nThe main reason is health. When people have green space near their homes, they walk more and feel less stressed. In Tashkent, for example, the new parks along the canals are full of families every evening.\n\nOn the other hand, roads are important for the economy. Goods must be delivered and people must get to work. If traffic is very bad, businesses lose money.\n\nHowever, building more roads often creates more traffic, not less. A better solution is to improve public transport and keep the money for parks.\n\nIn conclusion, I believe parks bring more long-term benefits than new roads, so cities should invest in them first.',
        criteria: [
          { code: 'TR', score: 6, max: 9, feedback: 'Position is clear and kept throughout. The roads argument needs a concrete example to be fully developed.' },
          { code: 'CC', score: 6, max: 9, feedback: 'Each paragraph has one idea. Paragraph 4 starts with “However” but continues the same side as paragraph 2; signal the turn more clearly.' },
          { code: 'LR', score: 6, max: 9, feedback: 'Topic words are used correctly. Several words repeat (“roads” ×9); vary with “infrastructure”, “motorways”.' },
          { code: 'GRA', score: 6.5, max: 9, feedback: 'Good control of conditionals. A few longer sentences would show more range.' },
        ],
        strengths: ['A clear opinion in the introduction, repeated in the conclusion.', 'A specific local example from Tashkent.'],
        nextSteps: ['Add one example to the roads paragraph so both sides are developed.', 'Plan the essay in two minutes: opinion, two reasons, one counter-argument.'],
      },
    ],
    reviewExtra, share: null, pdfAvailable: false,
  },
} as unknown as FullResult;

/*
 * The sample's AI Writing feedback in the page language (AI feedback follows the interface language,
 * README "Language switcher"). Essays and prompts stay English. Order: task1 [TA, CC, LR, GRA],
 * strengths, nextSteps; task2 [TR, CC, LR, GRA], strengths, nextSteps.
 */
type WFb = { criteria: [string, string, string, string]; strengths: [string, string]; nextSteps: [string, string] };
const SAMPLE_FB: Record<'uz' | 'ru', [WFb, WFb]> = {
  uz: [
    {
      criteria: [
        'Umumiy xulosa va asosiy raqamlar aniq. Ba’zi ma’lumotlar solishtirilmay, sanab o‘tilgan; Polsha va Turkiyani tez o‘sganlar sifatida birga guruhlang.',
        'Xatboshilar mantiqiy. Bog‘lovchilar to‘g‘ri, lekin takrorlanadi (“also”, “but”).',
        'Tendensiyalar uchun so‘z boyligi yetarli. “a steady climb”, “narrowed the gap”, “trailed behind” kabi iboralarni sinab ko‘ring.',
        'Sodda va qo‘shma gaplar asosan to‘g‘ri; murakkab tuzilmalar kam.',
      ],
      strengths: ['Ikkinchi xatboshida aniq umumiy xulosa gapi bor.', 'Raqamlar to‘g‘ri va grafikdan olingan.'],
      nextSteps: ['Mamlakatlarni birma-bir tasvirlash o‘rniga bir gapda solishtiring.', 'Har xatboshida bitta nisbiy ergash gap ishlatib, xilma-xillikni ko‘rsating.'],
    },
    {
      criteria: [
        'Pozitsiya aniq va oxirigacha saqlangan. Yo‘llar haqidagi dalil to‘liq ochilishi uchun aniq misol kerak.',
        'Har xatboshida bitta fikr. 4-xatboshi “However” bilan boshlanadi, lekin 2-xatboshidagi tomonni davom ettiradi; burilishni aniqroq ko‘rsating.',
        'Mavzu so‘zlari to‘g‘ri ishlatilgan. Ba’zi so‘zlar takrorlanadi (“roads” ×9); “infrastructure”, “motorways” bilan almashtiring.',
        'Shart gaplar yaxshi boshqarilgan. Bir nechta uzunroq gap ko‘proq xilma-xillikni ko‘rsatadi.',
      ],
      strengths: ['Kirishda aniq fikr bor va xulosada takrorlangan.', 'Toshkentdan aniq mahalliy misol.'],
      nextSteps: ['Ikkala tomon ham ochilishi uchun yo‘llar haqidagi xatboshiga bitta misol qo‘shing.', 'Inshoni ikki daqiqada rejalang: fikr, ikki sabab, bitta qarshi dalil.'],
    },
  ],
  ru: [
    {
      criteria: [
        'Ясный обзор и ключевые цифры. Часть данных перечислена, а не сопоставлена; объедините Польшу и Турцию как быстро растущие страны.',
        'Логичное деление на абзацы. Связки точные, но повторяются («also», «but»).',
        'Словарного запаса для описания тенденций достаточно. Попробуйте «a steady climb», «narrowed the gap», «trailed behind».',
        'Простые и сложносочинённые предложения в основном точны; сложных конструкций мало.',
      ],
      strengths: ['Чёткое обобщающее предложение во втором абзаце.', 'Цифры точные и взяты из графика.'],
      nextSteps: ['Сравнивайте страны в одном предложении, а не описывайте каждую по очереди.', 'Используйте одно придаточное определительное в каждом абзаце, чтобы показать разнообразие.'],
    },
    {
      criteria: [
        'Позиция ясна и выдержана до конца. Аргументу о дорогах нужен конкретный пример, чтобы он был раскрыт полностью.',
        'В каждом абзаце одна мысль. Абзац 4 начинается с «However», но продолжает ту же сторону, что и абзац 2; обозначьте поворот яснее.',
        'Тематическая лексика использована верно. Некоторые слова повторяются («roads» ×9); варьируйте с «infrastructure», «motorways».',
        'Хорошее владение условными предложениями. Несколько длинных предложений показали бы больше разнообразия.',
      ],
      strengths: ['Ясное мнение во введении, повторённое в заключении.', 'Конкретный местный пример из Ташкента.'],
      nextSteps: ['Добавьте пример в абзац о дорогах, чтобы обе стороны были раскрыты.', 'Планируйте эссе две минуты: мнение, две причины, один контраргумент.'],
    },
  ],
};

/** SAMPLE_RESULT with the Writing feedback in `lang` (en/uz/ru; other languages keep English). */
export function sampleResultFor(lang: string): FullResult {
  if (lang !== 'uz' && lang !== 'ru') return SAMPLE_RESULT;
  const fb = SAMPLE_FB[lang];
  const writing = SAMPLE_RESULT.mock.writing.map((w, i) => ({
    ...w,
    feedbackLang: lang,
    criteria: (w.criteria ?? []).map((c, j) => ({ ...c, feedback: fb[i].criteria[j] ?? c.feedback })),
    strengths: fb[i].strengths,
    nextSteps: fb[i].nextSteps,
  }));
  return { ...SAMPLE_RESULT, mock: { ...SAMPLE_RESULT.mock, writing } } as FullResult;
}
