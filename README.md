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

Vercel production에서 만든 인사이트 리포트를 로컬에서 그대로 테스트하려면
먼저 Vercel API에서 분석 결과를 로컬 fallback JSON으로 동기화합니다.

```bash
npm run sync:vercel-analyses
npm run dev
```

이 명령은 `data/analysis-results.local.json`을 만들고, 로컬 앱은 이 파일이
있을 때 기본 `data/analysis-results.json`보다 우선해서 읽습니다.

Vercel DB 접속 정보가 읽기 가능한 환경이면 DB 환경변수를 로컬로 동기화해
운영 DB를 직접 바라보게 할 수도 있습니다.

```bash
npm run sync:vercel-env
npm run db:status
npm run dev
```

`sync:vercel-env`는 Vercel production env를 받아오되, 로컬 실행에 필요한
`DATABASE_URL`, Postgres, OpenAI, YouTube 키만 `.env.local`에 병합합니다.
`VERCEL=true` 같은 배포 런타임 변수는 로컬 파일에 넣지 않습니다.
민감 변수로 설정된 DB 값이 Vercel CLI에서 빈 값으로 내려오면, 이 명령은
로컬 JSON fallback 사용을 방해하지 않도록 빈 DB 키를 저장하지 않습니다.

Preview나 Development 환경을 보고 싶을 때는 다음처럼 실행할 수 있습니다.

```bash
node scripts/sync-vercel-env.mjs --preview
node scripts/sync-vercel-env.mjs --development
```

## Environment

Create `.env.local` in the project root:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
DATABASE_URL=postgresql://...
ADMIN_EMAIL=owner@example.com
PDF_KOREAN_FONT_PATH=/path/to/korean-font.ttf
```

API keys, `DATABASE_URL`, and `ADMIN_EMAIL` are read only by server Route
Handlers and are not exposed to the browser.

When member auth is enabled, create the first Admin account at
`/signup/admin`. After that, new users must join through Admin-generated invite
links.

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
