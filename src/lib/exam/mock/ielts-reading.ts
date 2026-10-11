/** Mock IELTS Academic Reading — original Eduvo demo passages (short). */
import type { MockPart } from './build';

const L = (k: string, t: string) => ({ key: k, text: t });

export function ieltsReading(): MockPart[] {
  return [
    { part: 1, title: 'The quiet return of urban rivers', instructions: 'Questions 1–7', passage: [
      ['A', 'For most of the twentieth century, cities treated small rivers as a problem to be engineered away. Streams were straightened, lined with concrete and often buried beneath roads. By 1970, more than half of the original waterways in several European capitals had disappeared from view.'],
      ['B', 'The practice of reopening these channels, known as daylighting, began as a small experiment in Zurich in the 1980s. Engineers found that open water handled heavy rainfall better than pipes, which often overflowed during storms.'],
      ['C', 'Seoul’s Cheonggyecheon project made the idea famous. A highway was removed and the stream restored, producing a corridor several degrees cooler than nearby streets in summer. Critics noted that much of the water is pumped in from elsewhere.'],
      ['D', 'Ecologists remain cautious. Fish and insects do return, but often in fewer species than planners predict.'],
    ], groups: [
      { layout: 'pills', instructions: 'Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', qs: [
        { no: 1, type: 'tfng', content: { prompt: 'Several European capitals had lost most of their original waterways by 1970.' }, key: ['TRUE'], anchor: 'A|more than half of the original waterways', why: 'Paragraph A: “more than half of the original waterways … had disappeared”.' },
        { no: 2, type: 'tfng', content: { prompt: 'Daylighting was first tested in Seoul.' }, key: ['FALSE'], anchor: 'B|began as a small experiment in Zurich', why: 'Paragraph B: it began in Zurich.' },
        { no: 3, type: 'tfng', content: { prompt: 'Open channels coped with storms better than underground pipes.' }, key: ['TRUE'], anchor: 'B|open water handled heavy rainfall better than pipes' },
        { no: 4, type: 'tfng', content: { prompt: 'Cheonggyecheon attracts more tourists than any other site in Seoul.' }, key: ['NOT GIVEN'] },
      ] },
      { layout: 'table', instructions: 'Complete the table. Choose ONE WORD ONLY from the passage for each answer.', content: {
        template: 'Place | Change | Result\nZurich | channels reopened | better handling of heavy {{5}}\nSeoul | highway removed | corridor several degrees {{6}}\nGeneral | species return | fewer than planners {{7}}' },
        qs: [
          { no: 5, type: 'gap_fill', content: { wordLimit: 1 }, key: ['rainfall'], anchor: 'B|heavy rainfall' },
          { no: 6, type: 'gap_fill', content: { wordLimit: 1 }, key: ['cooler'], anchor: 'C|several degrees cooler' },
          { no: 7, type: 'gap_fill', content: { wordLimit: 1 }, key: ['predict'], anchor: 'D|fewer species than planners predict' },
        ] },
    ] },
    { part: 2, title: 'Sleep and memory', instructions: 'Questions 8–12', passage: [
      ['A', 'During deep sleep, the brain replays patterns of activity recorded during the day. Researchers believe this replay moves memories from short-term to long-term storage.'],
      ['B', 'Students who slept after learning a word list recalled 20 per cent more words the next morning than those who stayed awake for the same period.'],
      ['C', 'Not all sleep is equal. Short naps help with facts, while the dreaming stage appears to support creative problem-solving.'],
    ], groups: [
      { layout: 'matching', instructions: 'The passage has three paragraphs, A–C. Choose the correct heading for each paragraph from the list of headings below.', content: {
        bankTitle: 'List of Headings', bankKind: 'headings', bankPosition: 'side', uniqueOptions: true,
        options: [L('i', 'Different stages, different benefits'), L('ii', 'A nightly rehearsal'), L('iii', 'Why students avoid sleep'), L('iv', 'Evidence from a word test'), L('v', 'The cost of poor sleep')] },
        qs: [
          { no: 8, type: 'matching_headings', content: { prompt: 'Paragraph A' }, key: ['ii'] },
          { no: 9, type: 'matching_headings', content: { prompt: 'Paragraph B' }, key: ['iv'] },
          { no: 10, type: 'matching_headings', content: { prompt: 'Paragraph C' }, key: ['i'] },
        ] },
      { layout: 'summary', instructions: 'Complete the summary. Choose NO MORE THAN TWO WORDS from the passage for each answer.', content: {
        template: 'In deep sleep the brain {{11}} the activity of the day. Students who slept recalled more words than those who stayed {{12}}.' },
        qs: [
          { no: 11, type: 'gap_fill', content: { wordLimit: 2 }, key: ['replays'], anchor: 'A|the brain replays patterns of activity' },
          { no: 12, type: 'gap_fill', content: { wordLimit: 2 }, key: ['awake'], anchor: 'B|those who stayed awake' },
        ] },
    ] },
    { part: 3, title: 'The economics of attention', instructions: 'Questions 13–16', passage: [
      ['A', 'When information is abundant, attention becomes scarce. Companies now compete less for customers’ money than for their time.'],
      ['B', 'Some economists argue that free services are paid for with attention, which is then sold to advertisers. Others say this view ignores the real value users receive.'],
    ], groups: [
      { layout: 'rows', instructions: 'Choose the correct letter, A, B, C or D.', qs: [
        { no: 13, type: 'mcq_single', content: { prompt: 'According to the writer, what has become scarce?', options: [L('A', 'information'), L('B', 'money'), L('C', 'attention'), L('D', 'advertising')] }, key: ['C'], anchor: 'A|attention becomes scarce' },
        { no: 14, type: 'mcq_single', content: { prompt: 'What do the two groups of economists disagree about?', options: [L('A', 'whether services are free'), L('B', 'how attention is measured'), L('C', 'the size of the advertising market'), L('D', 'the value users get from free services')] }, key: ['D'] },
      ] },
      { layout: 'pills', instructions: 'Do the following statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.', qs: [
        { no: 15, type: 'ynng', content: { prompt: 'Companies care more about customers’ time than before.' }, key: ['YES'] },
        { no: 16, type: 'ynng', content: { prompt: 'Advertising will soon disappear from free services.' }, key: ['NOT GIVEN'] },
      ] },
    ] },
  ];
}
