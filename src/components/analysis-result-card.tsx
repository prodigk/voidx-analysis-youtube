import type { AnalysisResult, SavedAnalysis } from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";
import { AnalysisCardActions } from "@/components/analysis-card-actions";

export function AnalysisResultCard({
  analysis,
  result,
}: {
  analysis?: SavedAnalysis;
  result?: AnalysisResult;
}) {
  const data = result ?? analysis?.result;

  if (!data) {
    return null;
  }

  return (
    <article className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
      {analysis ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-full bg-[#ff385c]/10 px-3 text-xs font-semibold text-[#c13515]">
            {analysisTypeLabels[analysis.type]}
          </span>
          <span className="text-xs font-semibold text-[#6a6a6a]">
            {analysis.sourceLabel}
          </span>
          {analysis.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-7 items-center rounded-full border border-[#dddddd] px-2.5 text-xs font-semibold text-[#3f3f3f]"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <h3 className="text-lg font-semibold leading-7 text-[#222222]">
        {data.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#3f3f3f]">{data.summary}</p>

      {data.sections.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[14px] bg-[#f7f7f7] p-4"
            >
              <h4 className="text-sm font-semibold text-[#222222]">
                {section.title}
              </h4>
              <ul className="mt-3 grid gap-2">
                {section.points.map((point) => (
                  <li key={point} className="text-sm leading-6 text-[#3f3f3f]">
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      <ListBlock title="추천 전략" items={data.recommendations} />
      <ListBlock
        title="잠들기전 교양이 적용"
        items={data.sleepCultureApplications}
      />

      {data.videoIdeas.length > 0 ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-[#222222]">영상 아이디어</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {data.videoIdeas.map((idea) => (
              <section
                key={idea.title}
                className="rounded-[14px] border border-[#ebebeb] p-4"
              >
                <p className="text-sm font-semibold leading-6 text-[#222222]">
                  {idea.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#3f3f3f]">
                  {idea.hook}
                </p>
                <ol className="mt-3 grid gap-1 text-xs text-[#6a6a6a]">
                  {idea.outline.map((step, index) => (
                    <li key={step}>
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      ) : null}

      <ListBlock title="다음 액션" items={data.nextActions} />

      {analysis ? (
        <AnalysisCardActions
          analysisId={analysis.id}
          initialTags={analysis.tags ?? []}
        />
      ) : null}
    </article>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-5">
      <h4 className="text-sm font-semibold text-[#222222]">{title}</h4>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-[#3f3f3f]">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ff385c]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
