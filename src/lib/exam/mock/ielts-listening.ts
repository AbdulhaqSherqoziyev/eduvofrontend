/** Mock IELTS Listening — original Eduvo demo content (not Cambridge material). */
import type { MockPart } from './build';
import { svgData } from './build';

const L = (k: string, t: string) => ({ key: k, text: t });

export const MAP_SVG = svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="sans-serif">
<rect width="480" height="300" fill="#f4f7f2"/><rect x="20" y="20" width="440" height="260" rx="14" fill="#e3eedd" stroke="#9cb38f"/>
<path d="M20 160 H460" stroke="#cfd8c8" stroke-width="22"/><path d="M240 20 V280" stroke="#cfd8c8" stroke-width="18"/>
<text x="232" y="296" font-size="12" fill="#4a586c">Main gate</text>
<g font-size="15" font-weight="700" fill="#1e2a3a">
<circle cx="90" cy="80" r="15" fill="#fff" stroke="#1e2a3a"/><text x="85" y="85">A</text>
<circle cx="190" cy="100" r="15" fill="#fff" stroke="#1e2a3a"/><text x="185" y="105">B</text>
<circle cx="330" cy="70" r="15" fill="#fff" stroke="#1e2a3a"/><text x="325" y="75">C</text>
<circle cx="400" cy="220" r="15" fill="#fff" stroke="#1e2a3a"/><text x="395" y="225">D</text>
<circle cx="300" cy="230" r="15" fill="#fff" stroke="#1e2a3a"/><text x="295" y="235">E</text>
<circle cx="110" cy="225" r="15" fill="#fff" stroke="#1e2a3a"/><text x="106" y="230">F</text></g>
<text x="30" y="40" font-size="11" fill="#6b7a5f">North</text></svg>`);

export function ieltsListening(audioSec: number): MockPart[] {
  return [
    { part: 1, title: 'Part 1', audioSec, instructions: 'Questions 1–4', groups: [
      { layout: 'form', instructions: 'Write ONE WORD AND/OR A NUMBER for each answer.', content: {
        heading: 'Riverside Community Garden: membership',
        template: 'Opening day: {{1}}\nYearly fee: £{{2}}\nMembers must bring their own {{3}}\nMeet at the {{4}} beside the café' },
        qs: [
          { no: 1, type: 'gap_fill', content: { wordLimit: 1 }, key: ['Saturday'], why: 'The speaker says the garden opens on Saturday.' },
          { no: 2, type: 'gap_fill', content: { wordLimit: 1, allowNumber: true }, key: ['25', 'twenty-five'] },
          { no: 3, type: 'gap_fill', content: { wordLimit: 1 }, key: ['gloves'] },
          { no: 4, type: 'gap_fill', content: { wordLimit: 1 }, key: ['gate'] },
        ] },
    ] },
    { part: 2, title: 'Part 2', audioSec, instructions: 'Questions 5–10', groups: [
      { layout: 'rows', instructions: 'Choose the correct letter, A, B or C.', qs: [
        { no: 5, type: 'mcq_single', content: { prompt: 'The garden first opened in', options: [L('A', '1998'), L('B', '2004'), L('C', '2011')] }, key: ['B'] },
        { no: 6, type: 'mcq_single', content: { prompt: 'Most of the volunteers are', options: [L('A', 'retired residents'), L('B', 'university students'), L('C', 'local teachers')] }, key: ['A'] },
        { no: 7, type: 'mcq_single', content: { prompt: 'What will change in the spring?', options: [L('A', 'the opening hours'), L('B', 'the entrance fee'), L('C', 'the location of the tool shed')] }, key: ['C'] },
      ] },
      { layout: 'map', instructions: 'Label the plan below. Choose the correct letter, A–F.', content: {
        imageAssetId: 'img-map-1', imageAlt: 'Plan of the community garden with places marked A to F', mapMode: 'options',
        options: ['A', 'B', 'C', 'D', 'E', 'F'].map((k) => L(k, k)) },
        qs: [
          { no: 8, type: 'map_labelling', content: { label: 'Tool shed' }, key: ['C'] },
          { no: 9, type: 'map_labelling', content: { label: 'Children’s area' }, key: ['F'] },
          { no: 10, type: 'map_labelling', content: { label: 'Compost bins' }, key: ['D'] },
        ] },
    ] },
    { part: 3, title: 'Part 3', audioSec, instructions: 'Questions 11–15', groups: [
      { layout: 'rows', multiGroup: true, instructions: 'Choose TWO letters, A–E.', content: {
        prompt: 'Which TWO things will the students include in their presentation?', maxSelect: 2,
        options: [L('A', 'a survey of residents'), L('B', 'photographs of the site'), L('C', 'a cost comparison'), L('D', 'interviews with planners'), L('E', 'a short video')] },
        qs: [
          { no: 11, type: 'mcq_multi', key: ['B', 'D'] },
          { no: 12, type: 'mcq_multi', key: ['B', 'D'] },
        ] },
      { layout: 'matching', instructions: 'What does the tutor say about each part of the project? Choose the correct letter, A–D.', content: {
        bankTitle: 'Comments', bankPosition: 'top',
        options: [L('A', 'needs more detail'), L('B', 'is well organised'), L('C', 'should be shorter'), L('D', 'is not necessary')] },
        qs: [
          { no: 13, type: 'matching', content: { prompt: 'the introduction' }, key: ['C'] },
          { no: 14, type: 'matching', content: { prompt: 'the data section' }, key: ['A'] },
          { no: 15, type: 'matching', content: { prompt: 'the conclusion' }, key: ['B'] },
        ] },
    ] },
    { part: 4, title: 'Part 4', audioSec, instructions: 'Questions 16–20', groups: [
      { layout: 'note', instructions: 'Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', content: {
        heading: 'Coral reefs',
        template: 'Reefs cover less than 1% of the {{16}} floor\nMain threat: rising water {{17}}\nRecovery can take up to {{18}} years' },
        qs: [
          { no: 16, type: 'gap_fill', content: { wordLimit: 1 }, key: ['ocean', 'sea'] },
          { no: 17, type: 'gap_fill', content: { wordLimit: 1 }, key: ['temperature', 'temperatures'] },
          { no: 18, type: 'gap_fill', content: { wordLimit: 1, allowNumber: true }, key: ['10', 'ten'] },
        ] },
      { layout: 'short_answer', instructions: 'Answer the questions. Write NO MORE THAN TWO WORDS for each answer.', qs: [
        { no: 19, type: 'gap_fill', content: { prompt: 'Which animal helps keep reefs clean?', wordLimit: 2 }, key: ['parrotfish', 'parrot fish'] },
        { no: 20, type: 'gap_fill', content: { prompt: 'What do divers often damage by accident?', wordLimit: 2 }, key: ['branches', 'coral branches'] },
      ] },
    ] },
  ];
}
