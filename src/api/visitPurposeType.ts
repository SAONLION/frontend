// 백엔드가 검증하는 purposeType enum (89번 참고표 문서가 없어 실서버에 직접 질의해 확인한 값).
const VISIT_PURPOSE_TYPE_BY_LABEL: Record<string, string> = {
  여행: 'TRAVEL',
  선물: 'GIFT',
  구경: 'BROWSING',
  기타: 'OTHER',
}

export function toVisitPurposeType(label: string): string {
  return VISIT_PURPOSE_TYPE_BY_LABEL[label] ?? 'OTHER'
}
