"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import type {
  AnalysisInput,
  AnalysisType,
  SavedAnalysis,
} from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";
import { AnalysisResultCard } from "@/components/analysis-result-card";

type AiState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function AiAnalysisActions({
  input,
  actions,
}: {
  input: AnalysisInput;
  actions: AnalysisType[];
}) {
  const [state, setState] = useState<AiState>({ status: "idle" });
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);

  async function generate(type: AnalysisType) {
    setState({
      status: "loading",
      message: `${analysisTypeLabels[type]} 생성 중입니다.`,
    });

    const response = await fetch("/api/analysis/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, input }),
    });
    const payload = (await response.json()) as {
      analysis?: SavedAnalysis;
      error?: string;
    };

    if (!response.ok || !payload.analysis) {
      setState({
        status: "error",
        message: payload.error ?? "AI 분석 생성에 실패했습니다.",
      });
      return;
    }

    setAnalysis(payload.analysis);
    setState({
      status: "success",
      message: `${analysisTypeLabels[type]} 생성 및 저장 완료`,
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {actions.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => generate(type)}
            disabled={state.status === "loading"}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#222222] px-4 text-sm font-semibold text-white transition hover:bg-[#3f3f3f] disabled:cursor-not-allowed disabled:bg-[#929292]"
          >
            <BrainCircuit size={16} aria-hidden="true" />
            {analysisTypeLabels[type]}
          </button>
        ))}
      </div>

      {state.message ? (
        <p
          className={[
            "rounded-[14px] px-4 py-3 text-sm",
            state.status === "error"
              ? "bg-[#fff1ed] text-[#c13515]"
              : "bg-[#f7f7f7] text-[#3f3f3f]",
          ].join(" ")}
        >
          {state.message}
        </p>
      ) : null}

      {analysis ? <AnalysisResultCard analysis={analysis} /> : null}
    </div>
  );
}
