export type Category = {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  competition: "낮음" | "보통" | "높음" | "매우 높음";
  opportunity: string;
  sleepCultureFocus: string;
};

export const categories: Category[] = [
  {
    id: "books",
    name: "책 / 독서",
    description:
      "책 요약, 독서 습관, 인문 교양 큐레이션 채널을 검색하고 비교합니다.",
    keywords: ["책요약", "독서", "북튜브", "고전", "교양"],
    competition: "높음",
    opportunity: "한 권 요약보다 여러 관점을 엮는 주제형 교양 콘텐츠",
    sleepCultureFocus: "잠들기 전 듣기 좋은 차분한 큐레이션과 책 간 연결 구조",
  },
  {
    id: "humanities",
    name: "인문학 / 교양",
    description: "역사, 문화, 사회, 사상 콘텐츠 채널을 검색합니다.",
    keywords: ["인문학", "교양", "역사", "문화", "문해력"],
    competition: "보통",
    opportunity: "시사성보다 오래 남는 질문 중심의 에피소드",
    sleepCultureFocus: "짧은 지식 전달보다 하루를 정리하는 사유형 스크립트",
  },
  {
    id: "philosophy",
    name: "철학",
    description: "철학자, 사상, 삶의 질문을 다루는 채널을 검색합니다.",
    keywords: ["철학", "니체", "스토아", "삶의 태도", "사유"],
    competition: "보통",
    opportunity: "철학 개념을 현대인의 감정과 일상 문제로 번역",
    sleepCultureFocus: "자기계발 문법을 덜어낸 조용한 삶의 질문",
  },
  {
    id: "psychology",
    name: "심리학",
    description: "관계, 감정, 습관, 자기 이해 콘텐츠 채널을 검색합니다.",
    keywords: ["심리", "관계", "감정", "습관", "자기이해"],
    competition: "매우 높음",
    opportunity: "자극적 관계론 대신 책과 연구를 묶은 신뢰형 콘텐츠",
    sleepCultureFocus: "불안을 자극하지 않는 안정적 톤의 심리 해석",
  },
  {
    id: "self-growth",
    name: "자기계발",
    description: "성장, 생산성, 동기부여 콘텐츠 채널을 검색합니다.",
    keywords: ["자기계발", "습관", "생산성", "성장", "루틴"],
    competition: "매우 높음",
    opportunity: "성과 압박보다 삶의 기준을 세우는 교양형 자기계발",
    sleepCultureFocus: "자기비난 없는 회복형 성장 메시지",
  },
  {
    id: "career",
    name: "커리어",
    description: "직무, 이직, 일하는 방식, 커리어 전환 채널을 검색합니다.",
    keywords: ["커리어", "이직", "직장인", "일잘러", "생산성"],
    competition: "보통",
    opportunity: "책과 사례를 연결한 깊이 있는 직장인 교양",
    sleepCultureFocus: "일의 의미와 회복을 다루는 차분한 커리어 에세이",
  },
  {
    id: "tech",
    name: "IT / 테크",
    description: "기술 트렌드, AI, 생산성 도구 채널을 검색합니다.",
    keywords: ["AI", "테크", "생산성 도구", "트렌드", "미래"],
    competition: "높음",
    opportunity: "기술 뉴스가 아니라 삶과 일의 변화로 읽어내는 해설",
    sleepCultureFocus: "테크를 불안 대신 이해 가능한 교양으로 번역",
  },
  {
    id: "business",
    name: "경제 / 비즈니스",
    description: "시장, 브랜드, 기업 사례 콘텐츠 채널을 검색합니다.",
    keywords: ["경제", "비즈니스", "브랜드", "기업", "시장"],
    competition: "높음",
    opportunity: "숫자보다 사람과 선택의 구조를 보여주는 비즈니스 인문학",
    sleepCultureFocus: "경제 이슈를 과열 없이 오래 보는 관점으로 정리",
  },
  {
    id: "curation",
    name: "지식 큐레이션",
    description: "여러 자료를 한 주제로 엮는 큐레이션 채널을 검색합니다.",
    keywords: ["큐레이션", "지식", "트렌드", "해설", "관점"],
    competition: "보통",
    opportunity: "잠들기 전 듣는 큐레이션이라는 시간대 포지셔닝",
    sleepCultureFocus: "주제형 묶음, 낮은 자극, 반복 가능한 시리즈명",
  },
];
