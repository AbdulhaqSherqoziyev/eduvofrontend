/** Message namespaces — one JSON file each in messages/{locale}/. */
export const NAMESPACES = ['common', 'landing', 'pricing', 'exams'] as const;
export type Namespace = (typeof NAMESPACES)[number];
