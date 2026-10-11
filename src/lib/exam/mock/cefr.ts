/** Mock CEFR multilevel (English) — original Eduvo demo content, not UZBMB material. */
import type { MockPart } from './build';

const L = (k: string, t: string) => ({ key: k, text: t });

export function cefrListening(audioSec: number): MockPart[] {
  return [
    { part: 1, title: 'Part 1', audioSec, instructions: 'Questions 1–4', groups: [
      { layout: 'rows', instructions: 'You will hear short conversations. Choose the correct answer, A, B or C.', qs: [
        { no: 1, type: 'mcq_single', content: { prompt: 'Where are the speakers?', options: [L('A', 'at a bank'), L('B', 'in a library'), L('C', 'at a train station')] }, key: ['C'] },
        { no: 2, type: 'mcq_single', content: { prompt: 'What time does the lesson start?', options: [L('A', '9:15'), L('B', '9:30'), L('C', '9:50')] }, key: ['B'] },
        { no: 3, type: 'mcq_single', content: { prompt: 'Why is the woman calling?', options: [L('A', 'to cancel a booking'), L('B', 'to change a date'), L('C', 'to ask for a refund')] }, key: ['B'] },
        { no: 4, type: 'mcq_single', content: { prompt: 'What will the man buy?', options: [L('A', 'a map'), L('B', 'a ticket'), L('C', 'an umbrella')] }, key: ['A'] },
      ] },
    ] },
    { part: 2, title: 'Part 2', audioSec, instructions: 'Questions 5–8', groups: [
      { layout: 'note', instructions: 'Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', content: {
        heading: 'City museum tour',
        template: 'The tour begins in the main {{5}}\nVisitors cannot use camera {{6}} in the gallery\nTickets for students cost {{7}} so’m\nThe museum closes at {{8}} on Mondays' },
        qs: [
          { no: 5, type: 'gap_fill', content: { wordLimit: 1 }, key: ['hall'] },
          { no: 6, type: 'gap_fill', content: { wordLimit: 1 }, key: ['flash'] },
          { no: 7, type: 'gap_fill', content: { wordLimit: 1, allowNumber: true }, key: ['20000', '20,000', '20 000'] },
          { no: 8, type: 'gap_fill', content: { wordLimit: 1, allowNumber: true }, key: ['4', 'four', '4pm', '16:00'] },
        ] },
    ] },
  ];
}

export function cefrReading(): MockPart[] {
  return [
    { part: 1, title: 'Notices', instructions: 'Questions 1–3', passage: [
      ['A', 'Library closed on Friday for staff training. Returns box open.'],
      ['B', 'Swimming pool: children under 10 must be with an adult.'],
      ['C', 'Free Wi-Fi in the café. Ask staff for the password.'],
      ['D', 'Car park full after 9 a.m. Please use the bus.'],
    ], groups: [
      { layout: 'matching', instructions: 'Which notice says this? Choose the correct letter, A–D. You can use each letter once.', content: {
        uniqueOptions: true, bankPosition: 'top', bankTitle: 'Notices',
        options: [L('A', 'Notice A'), L('B', 'Notice B'), L('C', 'Notice C'), L('D', 'Notice D')] },
        qs: [
          { no: 1, type: 'matching', content: { prompt: 'You can give back books when the building is closed.' }, key: ['A'], anchor: 'A|Returns box open' },
          { no: 2, type: 'matching', content: { prompt: 'Young children cannot be alone here.' }, key: ['B'] },
          { no: 3, type: 'matching', content: { prompt: 'You need to ask someone to get online.' }, key: ['C'] },
        ] },
    ] },
    { part: 2, title: 'Working from home', instructions: 'Questions 4–9', passage: [
      ['P1', 'Since 2020, many companies in Tashkent have let staff work from home two days a week. A survey of 800 workers found that most felt more productive, although younger employees missed contact with colleagues.'],
      ['P2', 'Few companies plan to return to full office work. Managers say that meetings are now shorter and better prepared.'],
    ], groups: [
      { layout: 'pills', instructions: 'Choose True, False or No information.', qs: [
        { no: 4, type: 'tf3', content: { prompt: 'Some workers can stay at home for part of the week.' }, key: ['True'], anchor: 'P1|work from home two days a week' },
        { no: 5, type: 'tf3', content: { prompt: 'Younger employees preferred working from home.' }, key: ['False'] },
        { no: 6, type: 'tf3', content: { prompt: 'The survey was paid for by the government.' }, key: ['No information'] },
      ] },
      { layout: 'sentence', instructions: 'Complete the sentences. Write ONE WORD from the text for each answer.', qs: [
        { no: 7, type: 'gap_fill', content: { pre: 'Most workers in the survey felt more', post: '.', wordLimit: 1 }, key: ['productive'] },
        { no: 8, type: 'gap_fill', content: { pre: 'Younger staff missed contact with', post: '.', wordLimit: 1 }, key: ['colleagues'] },
        { no: 9, type: 'gap_fill', content: { pre: 'Managers say meetings are now', post: 'and better prepared.', wordLimit: 1 }, key: ['shorter'] },
      ] },
    ] },
  ];
}
