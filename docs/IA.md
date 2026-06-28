# IA — YouTube Channel Insight Analyzer

## 1. Information Architecture Overview

이 서비스의 정보 구조는 “탐색 → 분석 → 비교 → 전략화” 흐름을 기준으로 구성한다.

사용자는 먼저 카테고리를 선택하고, 해당 카테고리의 주요 채널을 확인한 뒤, 개별 채널 상세 분석을 보고, 여러 채널의 공통 패턴을 비교한다. 마지막으로 분석 결과를 바탕으로 신규 영상 기획 전략을 생성한다.

---

## 2. Top-Level Navigation

주요 네비게이션은 다음과 같이 구성한다.

1. Dashboard
2. Category Explorer
3. Channels
4. Insight Board
5. Strategy Generator
6. Settings

---

## 3. Sitemap

```txt
/
├── Dashboard
│   ├── 분석 현황 요약
│   ├── 카테고리별 주요 인사이트
│   ├── 최근 분석 채널
│   └── 잠들기전 교양이 적용 포인트
│
├── Category Explorer
│   ├── 카테고리 선택
│   ├── Top 10 채널 리스트
│   ├── 정렬 / 필터
│   └── 채널 상세 진입
│
├── Channels
│   ├── 전체 채널 리스트
│   ├── 채널 검색
│   ├── 채널 추가
│   └── Channel Detail
│       ├── 기본 정보
│       ├── 대표 영상
│       ├── 인기 영상
│       ├── 제목 패턴
│       ├── 썸네일 패턴
│       ├── 콘텐츠 포맷
│       ├── 업로드 패턴
│       ├── 성공 요인
│       ├── 차별화 포인트
│       └── 잠들기전 교양이 적용 포인트
│
├── Insight Board
│   ├── 카테고리 공통 패턴
│   ├── 채널 비교 매트릭스
│   ├── 제목 패턴 맵
│   ├── 썸네일 패턴 맵
│   ├── 콘텐츠 포맷 맵
│   ├── 기회 영역
│   └── 신규 채널 전략 제안
│
├── Strategy Generator
│   ├── 카테고리 선택
│   ├── 참고 채널 선택
│   ├── 책 / 주제 입력
│   ├── 영상 기획안 생성
│   └── 결과 저장
│
└── Settings
    ├── 카테고리 관리
    ├── API Key 설정
    ├── 분석 프롬프트 관리
    └── Export 설정
```

---

## 4. Page Structure

## 4.1 Dashboard

목적: 전체 분석 현황과 핵심 인사이트를 한눈에 보여준다.

### 주요 섹션

1. Overview Cards
   - 등록된 카테고리 수
   - 등록된 채널 수
   - 분석 완료 채널 수
   - 저장된 전략 아이디어 수

2. Featured Category Insight
   - 현재 선택된 주요 카테고리
   - 공통 성공 패턴 요약
   - 기회 영역 요약

3. Top Channels Snapshot
   - 카테고리별 주요 채널 미리보기
   - 구독자 수 / 평균 조회수 / 업로드 빈도

4. Sleep Culture Channel Suggestions
   - “잠들기전 교양이”에 적용 가능한 포인트
   - 추천 콘텐츠 포맷
   - 주의할 포맷

5. Recent Analysis
   - 최근 분석한 채널
   - 최근 생성한 전략 기획안

---

## 4.2 Category Explorer

목적: 카테고리별 주요 채널을 탐색하고 비교한다.

### 주요 섹션

1. Category Selector
   - 카테고리 선택 드롭다운
   - 카테고리 설명
   - 관련 키워드

2. Top 10 Channel Table
   - 순위
   - 채널명
   - 구독자 수
   - 총 조회수
   - 영상 수
   - 최근 업로드일
   - 대표 콘텐츠 유형
   - 상세 보기 버튼

3. Filter / Sort Bar
   - 구독자 수순
   - 평균 조회수순
   - 최근 업로드순
   - 영상 수순

4. Category Summary
   - 이 카테고리의 주요 특징
   - 경쟁 강도
   - 신규 채널 기회

---

## 4.3 Channel Detail

목적: 개별 채널의 성공 요인과 참고 포인트를 상세히 분석한다.

### 주요 섹션

1. Channel Header
   - 채널명
   - 채널 썸네일
   - 채널 URL
   - 구독자 수
   - 총 조회수
   - 영상 수
   - 최근 업로드일

2. Positioning Card
   - 채널 한 줄 정의
   - 타겟 시청자
   - 핵심 가치 제안

3. Content Format Analysis
   - 주요 콘텐츠 포맷
   - 반복되는 영상 구조
   - 시리즈 운영 여부

4. Title Pattern Analysis
   - 자주 쓰는 제목 구조
   - 키워드 패턴
   - 후킹 방식
   - 숫자 / 질문 / 감정 표현 사용 여부

5. Thumbnail Pattern Analysis
   - 색상 톤
   - 텍스트 양
   - 인물 / 책 / 그래픽 사용 여부
   - 레이아웃 반복성

6. Video Pattern
   - 인기 영상 리스트
   - 최근 영상 리스트
   - 영상 길이
   - 조회수 패턴

7. Success Factors
   - 잘되는 이유
   - 차별화 포인트
   - 알고리즘 친화 요소

8. Lessons for New Channel
   - 참고할 요소
   - 피해야 할 요소
   - 적용 난이도

9. Application for “잠들기전 교양이”
   - 적용 가능한 요소
   - 변형해서 사용할 방식
   - 차별화 아이디어

---

## 4.4 Insight Board

목적: 여러 채널의 분석 결과를 종합하여 전략적 인사이트를 제공한다.

### 주요 섹션

1. Category Pattern Summary
   - 공통 성공 패턴
   - 주요 콘텐츠 포맷
   - 제목 패턴
   - 썸네일 패턴

2. Channel Comparison Matrix
   - 채널명
   - 포지셔닝
   - 타겟
   - 포맷
   - 강점
   - 약점
   - 참고 가능성

3. Opportunity Areas
   - 덜 다뤄진 주제
   - 과포화된 포맷
   - 신규 진입 가능 영역
   - 차별화 가능한 관점

4. Strategy Cards
   - 콘텐츠 포맷 전략
   - 제목 전략
   - 썸네일 전략
   - 업로드 전략
   - 시리즈 전략

5. Application Board
   - “잠들기전 교양이”에 바로 적용할 수 있는 항목
   - 단기 실험 아이디어
   - 장기 운영 방향

---

## 4.5 Strategy Generator

목적: 분석 결과를 바탕으로 신규 영상 기획안을 만든다.

### 입력 영역

- 카테고리
- 참고 채널
- 책 제목
- 주제
- 타겟 시청자
- 원하는 톤
- 영상 길이

### 출력 영역

1. Video Concept
2. Title Candidates
3. Thumbnail Direction
4. Opening Hook
5. Video Structure
6. Key Message
7. Reference Pattern Used
8. Differentiation Point
9. Risks to Avoid
10. Next Action

---

## 4.6 Settings

목적: 프로젝트 운영에 필요한 기본 설정을 관리한다.

### 주요 섹션

- 카테고리 관리
- 채널 수동 추가
- API Key 설정
- 분석 프롬프트 관리
- Export 설정
- 데이터 초기화

---

## 5. Recommended Component Structure

```txt
components/
├── layout/
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── PageTitle.tsx
│
├── dashboard/
│   ├── OverviewCard.tsx
│   ├── RecentAnalysisList.tsx
│   └── SleepCultureSuggestionCard.tsx
│
├── categories/
│   ├── CategorySelector.tsx
│   ├── CategorySummary.tsx
│   └── CategoryKeywordTags.tsx
│
├── channels/
│   ├── ChannelRankingTable.tsx
│   ├── ChannelSummaryCard.tsx
│   ├── ChannelHeader.tsx
│   ├── ChannelAnalysisSection.tsx
│   ├── VideoList.tsx
│   └── PatternTagList.tsx
│
├── insights/
│   ├── InsightCard.tsx
│   ├── ComparisonMatrix.tsx
│   ├── OpportunityAreaCard.tsx
│   └── StrategyCard.tsx
│
├── strategy/
│   ├── StrategyInputForm.tsx
│   ├── StrategyOutputCard.tsx
│   └── TitleCandidateList.tsx
│
└── ui/
    └── shadcn components
```

---

## 6. Navigation Principle

서비스의 모든 화면은 다음 질문으로 연결되어야 한다.

- 이 채널은 왜 잘되는가?
- 이 패턴은 반복 가능한가?
- 우리 채널에 적용할 수 있는가?
- 그대로 따라 하면 위험한가?
- “잠들기전 교양이”는 어떤 방식으로 변형해야 하는가?

---

## 7. Initial Route Plan

```txt
/                       → Dashboard
/categories             → Category Explorer
/channels               → Channel List
/channels/[channelId]   → Channel Detail
/insights               → Insight Board
/strategy-generator     → Strategy Generator
/settings               → Settings
```
