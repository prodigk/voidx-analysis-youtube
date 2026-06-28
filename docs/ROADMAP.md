# ROADMAP — YouTube Channel Insight Analyzer

## 1. Roadmap Overview

이 프로젝트는 빠르게 사용할 수 있는 개인용 도구에서 시작해, 점진적으로 YouTube API 연동, AI 분석, 전략 생성, export 기능을 추가하는 방식으로 개발한다.

핵심 원칙은 다음과 같다.

1. 먼저 화면과 데이터 구조를 만든다.
2. 그 다음 YouTube 데이터를 연결한다.
3. 이후 AI 분석을 붙인다.
4. 마지막으로 실사용 편의 기능을 고도화한다.

---

## 2. Phase 0 — Project Setup

목표: 프로젝트 기본 구조와 문서 기반을 만든다.

### Tasks

- Next.js 프로젝트 생성
- TypeScript 설정
- Tailwind CSS 설정
- shadcn/ui 사용 가능 구조 설정
- 기본 폴더 구조 생성
- `/docs` 폴더 생성
- `/prompts` 폴더 생성
- `/data` 폴더 생성
- 기본 문서 파일 추가
- 기본 mock data 파일 추가

### Deliverables

- 작동 가능한 로컬 프로젝트
- 기본 폴더 구조
- 프로젝트 문서
- 초기 mock data

### Acceptance Criteria

- `npm run dev`로 로컬 실행 가능
- 기본 라우트 접속 가능
- 문서와 mock data가 프로젝트 내에 포함됨

---

## 3. Phase 1 — MVP UI Prototype

목표: API 없이 mock data 기반으로 전체 서비스 흐름을 확인한다.

### Scope

- Dashboard
- Category Explorer
- Channel List
- Channel Detail
- Insight Board
- Strategy Generator
- Settings

### Tasks

#### 3.1 Layout

- AppShell 구성
- Sidebar 또는 Top Navigation 구성
- 페이지 공통 헤더 구성
- 반응형 기본 레이아웃 적용

#### 3.2 Dashboard

- 전체 분석 현황 카드
- 카테고리별 인사이트 요약
- 최근 분석 채널
- “잠들기전 교양이 적용 포인트” 카드

#### 3.3 Category Explorer

- 카테고리 선택 UI
- 카테고리별 Top 10 채널 테이블
- 정렬 / 필터 UI
- 카테고리 요약 카드

#### 3.4 Channel Detail

- 채널 기본 정보
- 콘텐츠 포맷 분석
- 제목 패턴 분석
- 썸네일 패턴 분석
- 업로드 패턴 분석
- 성공 요인
- 신규 채널 참고 포인트
- “잠들기전 교양이 적용 포인트”

#### 3.5 Insight Board

- 공통 성공 패턴
- 채널 비교 매트릭스
- 기회 영역
- 전략 카드

#### 3.6 Strategy Generator

- 입력 폼
- mock 결과 출력
- 제목 후보 리스트
- 영상 구성안 카드
- 썸네일 방향 카드

#### 3.7 Settings

- 카테고리 관리 UI
- 채널 수동 추가 UI
- API Key 입력 placeholder
- 프롬프트 관리 placeholder

### Deliverables

- mock data 기반 전체 화면
- 기본 네비게이션
- 재사용 가능한 컴포넌트

### Acceptance Criteria

- 모든 주요 페이지가 이동 가능해야 한다.
- mock data를 통해 실제 사용 흐름이 보여야 한다.
- “잠들기전 교양이” 적용 포인트가 주요 화면에 포함되어야 한다.

---

## 4. Phase 2 — Data Model & Local Persistence

목표: mock data를 실제 저장 구조로 전환할 준비를 한다.

### Recommended Stack

- Prisma
- SQLite

### Tasks

- Prisma 설치
- SQLite 설정
- Category 모델 생성
- Channel 모델 생성
- Video 모델 생성
- ChannelAnalysis 모델 생성
- CategoryInsight 모델 생성
- StrategyIdea 모델 생성
- Seed script 작성
- mock data를 DB seed로 전환

### Deliverables

- Prisma schema
- SQLite DB
- Seed data
- DB 기반 페이지 조회

### Acceptance Criteria

- mock JSON 없이 DB에서 카테고리와 채널을 조회할 수 있다.
- Seed script로 초기 데이터를 재생성할 수 있다.

---

## 5. Phase 3 — YouTube API Integration

목표: YouTube Data API v3를 연결하여 채널과 영상 데이터를 가져온다.

### Tasks

- `.env`에 YouTube API Key 설정
- 채널 ID 기반 정보 조회
- 채널명 검색 기반 정보 조회
- 최근 영상 조회
- 인기 영상 조회
- 구독자 수 / 총 조회수 / 영상 수 업데이트
- 영상별 조회수 / 좋아요 / 댓글 수 조회
- 데이터 새로고침 버튼 추가

### Data to Fetch

Channel:

- title
- description
- customUrl
- thumbnails
- subscriberCount
- viewCount
- videoCount
- publishedAt

Video:

- title
- description
- thumbnails
- publishedAt
- duration
- viewCount
- likeCount
- commentCount

### Acceptance Criteria

- 채널 URL 또는 채널 ID로 데이터를 가져올 수 있다.
- 가져온 데이터를 DB에 저장할 수 있다.
- 최근 영상과 인기 영상이 Channel Detail에 표시된다.

---

## 6. Phase 4 — AI Analysis Integration

목표: 저장된 채널과 영상 데이터를 바탕으로 분석 결과를 생성한다.

### Tasks

- AI provider interface 생성
- channel-analysis prompt 연결
- category-insight prompt 연결
- strategy-generator prompt 연결
- 분석 실행 버튼 추가
- 분석 결과 저장
- 분석 결과 재생성 기능 추가

### Prompt Files

- `/prompts/system-prompt.md`
- `/prompts/channel-analysis.md`
- `/prompts/category-insight.md`
- `/prompts/strategy-generator.md`

### Output Format

분석 결과는 가능하면 JSON 구조로 저장한다.

```json
{
  "positioning": "",
  "targetAudience": "",
  "contentFormats": [],
  "titlePatterns": [],
  "thumbnailPatterns": [],
  "uploadPatterns": "",
  "successFactors": [],
  "differentiationPoints": [],
  "risks": [],
  "applicableInsights": [],
  "sleepCultureSuggestions": []
}
```

### Acceptance Criteria

- 개별 채널 분석을 생성할 수 있다.
- 카테고리별 종합 인사이트를 생성할 수 있다.
- “잠들기전 교양이” 적용 전략이 별도 항목으로 출력된다.

---

## 7. Phase 5 — Strategy Generator Enhancement

목표: 분석 결과를 기반으로 실제 영상 기획안을 생성한다.

### Tasks

- 책 제목 입력
- 주제 입력
- 참고 채널 선택
- 카테고리 선택
- 톤 선택
- 영상 길이 선택
- 제목 후보 생성
- 영상 구성안 생성
- 썸네일 방향 생성
- 차별화 포인트 생성
- 기획안 저장

### Output

- 영상 콘셉트
- 제목 후보 5~10개
- 오프닝 훅
- 5~7단계 영상 구성
- 썸네일 방향
- 참고한 레퍼런스 패턴
- 차별화 포인트
- 리스크
- 다음 액션

### Acceptance Criteria

- 분석된 채널 패턴을 활용해 영상 기획안이 생성된다.
- 결과를 저장하고 다시 볼 수 있다.

---

## 8. Phase 6 — Export & Workflow Features

목표: 생성된 분석과 기획안을 실제 작업에 활용하기 쉽게 만든다.

### Tasks

- Markdown export
- PDF export
- 분석 리포트 저장
- 전략 기획안 저장
- 즐겨찾기 채널
- 인사이트 태그
- 제목 후보 비교
- 썸네일 메모
- 영상 제작 체크리스트

### Acceptance Criteria

- 분석 결과를 Markdown으로 다운로드할 수 있다.
- 영상 기획안을 별도 파일로 저장할 수 있다.
- 실제 콘텐츠 제작 프로세스에 연결된다.

---

## 9. Suggested Development Order

1. 프로젝트 생성
2. 폴더 구조 생성
3. 문서 작성
4. mock data 작성
5. 공통 레이아웃 구현
6. Dashboard 구현
7. Category Explorer 구현
8. Channel Detail 구현
9. Insight Board 구현
10. Strategy Generator 구현
11. Settings 구현
12. Prisma 도입
13. YouTube API 연동
14. AI 분석 연동
15. export 기능 추가

---

## 10. Technical Milestones

### Milestone 1

Mock UI가 완성되어 서비스 흐름을 확인할 수 있다.

### Milestone 2

DB 기반으로 카테고리, 채널, 영상 데이터를 관리할 수 있다.

### Milestone 3

YouTube API로 실제 데이터를 가져올 수 있다.

### Milestone 4

AI 분석 결과를 생성하고 저장할 수 있다.

### Milestone 5

영상 기획안 생성과 export가 가능하다.

---

## 11. Product Risks

### Risk 1. YouTube API 검색 한계

YouTube API만으로 카테고리별 정확한 Top 10 채널을 자동 추출하기 어려울 수 있다.

대응:

- 수동 등록 기능 유지
- 검색 키워드 기반 후보 수집
- 사용자가 직접 채널을 큐레이션하는 구조 허용

### Risk 2. 분석 결과가 일반론에 머무를 가능성

AI 분석이 너무 추상적이면 실제 전략에 도움이 되지 않는다.

대응:

- 출력 포맷을 구조화
- “근거 데이터”와 “적용 포인트”를 분리
- 제목, 썸네일, 포맷 등 구체 항목 중심 분석

### Risk 3. UI가 단순 데이터 테이블에 머물 가능성

목적은 순위 조회가 아니라 인사이트 도출이다.

대응:

- 모든 화면에 Insight Card 포함
- “왜 잘되는가?”와 “어떻게 적용할 것인가?”를 핵심 구조로 유지

---

## 12. Immediate Next Action

Codex는 다음 순서로 시작한다.

1. 프로젝트 폴더 구조를 만든다.
2. `docs/`, `prompts/`, `data/` 폴더를 만든다.
3. 문서 파일을 배치한다.
4. mock data를 만든다.
5. Next.js 기본 레이아웃을 구성한다.
6. Dashboard부터 구현한다.
