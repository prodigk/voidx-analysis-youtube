# YouTube Channel Insight Analyzer

`잠들기전 교양이` 채널 전략 수립을 위한 유튜브 채널 인사이트 보드입니다.

## MVP Scope

- Next.js + TypeScript + Tailwind CSS + App Router
- Dashboard
- Category Explorer
- Channel List / Channel Detail
- Insight Board
- Strategy Generator
- Settings
- YouTube Data API v3 연동
- 채널 정보 / 구독자 수 / 총 조회수 / 영상 수 조회
- 최근 영상 / 인기 영상 조회
- 카테고리별 후보 채널 검색
- 채널 상세 데이터 새로고침
- OpenAI 기반 채널 분석 / 카테고리 인사이트 / 비교 분석 / 영상 아이디어
- 채널 저장 / 즐겨찾기
- 분석 결과 저장 / 태그 관리 / Markdown export / PDF export
- 영상 기획안 저장 / 제목 후보 비교 / 썸네일 방향성 메모

## Storage

Vercel 운영 배포에서는 Neon Postgres를 사용합니다. Vercel Marketplace에서
Neon을 연결하면 `DATABASE_URL`이 주입되고, 앱은 자동으로 Postgres에 저장합니다.

로컬 개발에서 `DATABASE_URL`이 없으면 `data/*.json` 파일을 fallback 저장소로
사용합니다. 이 fallback은 개발 편의용이며 운영 저장소가 아닙니다.

## Environment

Create `.env.local` in the project root:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
DATABASE_URL=postgresql://...
PDF_KOREAN_FONT_PATH=/path/to/korean-font.ttf
```

API keys and `DATABASE_URL` are read only by server Route Handlers and are not
exposed to the browser.

`PDF_KOREAN_FONT_PATH` is optional locally, but recommended on Vercel so Korean
PDF exports can embed a stable TTF/OTF font.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Vercel Verification

After deploying to Vercel, confirm Neon storage is active:

```bash
npx vercel curl /api/health/storage
```

Expected storage mode is `postgres`. If it returns `missing-database`, check that
the Neon Marketplace integration added `DATABASE_URL` to the deployment target.
