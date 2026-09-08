export const LAB_GROUPS = ['电源组', '飞控组', '小车组', '其他'] as const;

export type LabGroup = (typeof LAB_GROUPS)[number];

export const DEFAULT_LAB_GROUP: LabGroup = '其他';

export function isLabGroup(value: string): value is LabGroup {
  return LAB_GROUPS.some((group) => group === value);
}
