export type Language = 'ko' | 'en';
const LANGUAGE_KEY = 'odyssey-atlas-language';

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'ko' || saved === 'en') return saved;
  } catch { /* Browsing still works when storage is unavailable. */ }
  if (typeof navigator === 'undefined') return 'ko';
  const preferred = navigator.languages?.[0] || navigator.language;
  return preferred && !preferred.toLowerCase().startsWith('ko') ? 'en' : 'ko';
}

export function saveLanguage(language: Language): void {
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Keep the in-memory choice. */ }
}

export const englishMessages = {
  '확대': 'Zoom in',
  '축소': 'Zoom out',
  '시점 왼쪽 회전': 'Rotate view left',
  '시점 오른쪽 회전': 'Rotate view right',
  '전체 지도': 'Full map',
  '이야기로 이동': 'Skip to story',
  'ODYSSEY 전체 지도': 'ODYSSEY full map',
  '귀환의 항해': 'The Voyage Home',
  '열다섯 개의 장, 하나의 귀환': 'Fifteen chapters. One homecoming.',
  '여정 목록': 'Chapters',
  '설정': 'Settings',
  '입체 세계 탐색': 'Explore the 3D world',
  '호메로스의 세계': 'THE WORLD OF HOMER',
  '바다에 새겨진, 집으로 가는 길': 'A journey home, written on the sea',
  '스토리 모드': 'Story mode',
  '자유 탐색': 'Free exploration',
  '북': 'N',
  '항해 시작': 'Begin voyage',
  '항해 따라가기': 'Follow the voyage',
  '이동 건너뛰기': 'Skip transition',
  '지도 조작': 'Map controls',
  '드래그로 이동': 'Drag to pan',
  '휠로 확대': 'Scroll to zoom',
  'Shift + 드래그로 회전': 'Shift + drag to rotate',
  '드래그로 이동 · 두 손가락으로 확대': 'Drag to pan · Pinch to zoom',
  '현재 장 이야기': 'Current chapter story',
  '이야기 접기': 'Collapse story',
  '이야기 펼치기': 'Expand story',
  '원작 기반': 'Based on the epic',
  '장면 속 발견': 'Discover the scene',
  '탐색 설명 닫기': 'Close discovery details',
  '장면의 순간': 'Scene moment',
  '장면 진행': 'Scene progress',
  '선택과 결과': 'Choices and consequences',
  '이전 사건에서': 'What came before',
  '선택과 갈등': 'Choice and conflict',
  '남겨진 결과': 'The consequences',
  '다음 항해': 'The next voyage',
  '같은 세계, 또 다른 여정': 'Another journey in the same world',
  '이타카의 기다림': 'Waiting in Ithaca',
  '아버지를 찾는 길': 'In Search of a Father',
  '원작·연출 구분': 'Sources and interpretation',
  '이전 장': 'Previous chapter',
  '이전': 'Previous',
  '귀환의 완성': 'Home at last',
  '다음 장': 'Next chapter',
  '귀환의 여정': 'The journey home',
  '시간순 재구성': 'In chronological order',
  '처음부터': 'Restart',
  '재생': 'Play',
  '일시정지': 'Pause',
  '움직임 재생': 'Resume animation',
  '모든 움직임 일시정지': 'Pause all animation',
  '전체 15개 장 타임라인': 'Timeline of all 15 chapters',
  '시험과 재회': 'Trial & reunion',
  '원작 기반의 상징적 항로 · 실제 지리적 위치를 확정한 지도가 아님': 'A symbolic route inspired by the epic · Not a map of verified locations',
  'SVG 입체 세계': 'SVG 3D world',
  '항해 설정': 'Voyage settings',
  '모션 축소': 'Reduce motion',
  '운영체제의 모션 축소 설정 적용 중': 'Your system’s reduced motion preference is active',
  '카메라 이동과 반복 애니메이션 없이 탐색': 'Explore without camera transitions or looping animations',
  '자동 항해': 'Automatic voyage',
  '각 장을 살펴본 뒤 다음 장으로 이동': 'Advance to the next chapter after a short stay',
  '화면 품질': 'Display quality',
  '자동 설정은 렌더링 부하에 따라 세부도를 조절': 'Auto adjusts detail to match rendering performance',
  '자동': 'Auto',
  '고품질': 'High',
  '가벼운 화면': 'Low',
  '조작 방법': 'How to explore',
  '드래그로 지도 이동 · 휠과 두 손가락으로 확대': 'Drag to pan · Scroll or pinch to zoom',
  'Shift + 드래그 또는 회전 버튼으로 시점 조절': 'Shift + drag or use the rotation buttons to change the view',
  '← → 이전·다음 장 · Space 재생·정지 · Esc 닫기': '← → Previous / next chapter · Space Play / pause · Esc Close',
  '현재 장과 표시 설정은 이 브라우저에만 저장됩니다. 자동 항해는 새로 열 때 시작하지 않습니다.': 'Your chapter and display preferences are saved only in this browser. Automatic voyage stays off when you reopen the app.',
  '이 환경에서는 기록을 저장할 수 없습니다. 현재 탐색은 정상 작동하며 새로고침하면 기록이 초기화됩니다.': 'This browser cannot save your progress. You can still explore, but your progress will reset on reload.',
  '열다섯 개의 장': 'Fifteen chapters',
  '장소를 선택하면 해당 사건으로 이동합니다. 원작의 서술 순서가 아닌 귀환 여정의 시간순 재구성입니다.': 'Choose a place to visit its chapter. The journey follows chronological order, rather than the order in which the epic is told.',
  '원작과 시각적 해석': 'The epic and its visual interpretation',
  '호메로스의 《오디세이아》를 출발점으로': 'Beginning with Homer’s Odyssey',
  '장 구성과 서사 핵심은 제공된 기획 문서를 기준으로 작성했습니다. 설명과 짧은 서술은 새로 쓴 각색이며, 원문의 직접 인용이나 특정 번역본의 대사가 아닙니다.': 'The chapters and main narrative follow the supplied project brief. Descriptions and short passages are original adaptations, not direct quotations from the epic or any particular translation.',
  '시각적 해석': 'Visual interpretation',
  '항로, 지형과 장면의 순간': 'Routes, landscapes and moments',
  '섬의 형태, 궁전 구조, 인물 실루엣, 날씨와 색감은 웹앱을 위한 창작입니다. 지도는 실제 지리적 위치를 확정하지 않으며, 슬라이더는 원작의 결과를 변경하지 않습니다.': 'Island shapes, palace structures, silhouettes, weather and colors were created for this app. The map does not establish real geographical locations, and the slider does not change the outcome of the epic.',
  '영화와의 관계': 'Relationship to film',
  '영화의 확인되지 않은 장면·대사·배우 외형을 사용하지 않았습니다. 이 앱의 15개 장은 영화에 등장한다고 확정한 목록이 아닙니다.': 'No unverified film scenes, dialogue or actors’ likenesses are used. These 15 chapters are not a confirmed list of scenes in any film.',
  '원전의 절·행 단위 대조 주석 및 영화별 검증 자료는 포함하지 않았습니다.': 'Verse-by-verse annotations and film-specific verification are not included.',
  '보조 서사 · 항해의 개별 사건과 정확히 같은 시각에 일어났다고 연결하지 않습니다.': 'A companion story. Its events are not presented as occurring at exactly the same time as individual episodes of the voyage.',
  '항해를 처음부터 시작할까요?': 'Start the voyage again?',
  '현재 장과 발견한 장소 기록을 초기화합니다. 모션 축소와 화면 품질 설정은 유지됩니다.': 'Reset your current chapter and visited places. Your language, reduced motion and display quality preferences will be kept.',
  '취소': 'Cancel',
  '초기화': 'Reset voyage',
  '닫기': 'Close',
  '입체 직조기': 'A 3D loom',
  '텔레마코스의 탐색을 상징하는 입체 선박': 'A 3D ship symbolizing Telemachus’s search',
  'SVG 입체 항해 지도. 장소를 선택하거나 드래그하여 이동. 확대와 시점 회전 버튼으로 조작.': 'Interactive SVG 3D voyage map. Select a place or drag to pan. Use the zoom and rotation buttons to adjust the view.',
  '오디세우스의 귀환을 탐색하는 15장 SVG 입체 신화 아틀라스': 'Explore Odysseus’s journey home in a 15-chapter interactive SVG 3D atlas.'
} as const;

export type MessageKey = keyof typeof englishMessages;
export const translate = (language: Language, key: MessageKey): string => language === 'en' ? englishMessages[key] : key;
export const chapterLabel = (language: Language, order: number | string): string => language === 'en' ? `Chapter ${order}` : `제${order}장`;
export const discoveryCount = (language: Language, count: number): string => language === 'en' ? `${count} discoveries` : `${count}개의 탐색 지점`;
