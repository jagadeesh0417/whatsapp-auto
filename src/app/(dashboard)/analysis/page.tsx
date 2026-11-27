import { getStore } from "@/lib/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAIProvider } from "@/lib/ai/provider";
import Link from "next/link";

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const sp = await searchParams;
  const store = getStore();
  const businesses = store.listBusinesses();
  const selectedId = sp.business || businesses[0]?.id;
  const selected = selectedId ? store.getBusiness(selectedId) : null;
  const analysis = selectedId ? store.getAnalysis(selectedId) : null;

  async function runAnalysis(formData: FormData) {
    "use server";
    const id = String(formData.get("business_id"));
    const s = getStore();
    const b = s.getBusiness(id);
    if (!b) return;
    const provider = getAIProvider();
    const result = await provider.analyzeBusiness({ business: b as unknown as Record<string, unknown> });
    s.upsertAnalysis({
      organization_id: b.organization_id,
      business_id: b.id,
      analysis_status: "completed",
      website_status: (result.website_status as "reachable" | "unreachable" | "not_provided" | "unknown") || (b.website_url ? "unknown" : "not_provided"),
      findings: (result.verified_findings as string[]) || [],
      evidence: (result.evidence as Record<string, unknown>) || {},
      suggested_services: (result.suggested_services as string[]) || [],
      confidence: (result.confidence as number) || 0.5,
    });
    // store extra in evidence for display
    s.getAnalysis(b.id)!.evidence = { ...s.getAnalysis(b.id)!.evidence, ai_suggestions: result.ai_suggestions, unverified_assumptions: result.unverified_assumptions, business_summary: result.business_summary, industry: result.industry, potential_requirements: result.potential_requirements, recommended_next_action: result.recommended_next_action };
    s.logActivity("analyze_business", "business_analysis", b.id, {}, undefined);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Business Analysis</h2>
      <div className="flex gap-2 flex-wrap">
        {businesses.map((b) => (
          <Link key={b.id} href={`/analysis?business=${b.id}`}>
            <Button variant={b.id === selectedId ? "default" : "outline"} size="sm">{b.business_name}</Button>
          </Link>
        ))}
      </div>
      {selected && (
        <Card>
          <CardHeader><CardTitle className="text-base">{selected.business_name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <form action={runAnalysis}>
              <input type="hidden" name="business_id" value={selected.id} />
              <Button type="submit">Run / Refresh analysis</Button>
            </form>
            {analysis ? (
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Status:</span> {analysis.analysis_status}</div>
                <div><span className="text-muted-foreground">Website status:</span> {analysis.website_status}</div>
                <div><span className="text-muted-foreground">Confidence:</span> {analysis.confidence}</div>
                <div><span className="text-muted-foreground">Verified findings:</span> {analysis.findings.join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">AI suggestions:</span> {(analysis.evidence?.ai_suggestions as string[] | undefined)?.join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">Unverified assumptions:</span> {(analysis.evidence?.unverified_assumptions as string[] | undefined)?.join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">Suggested services:</span> {analysis.suggested_services.join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">Potential requirements:</span> {(analysis.evidence?.potential_requirements as string[] | undefined)?.join(", ") || "—"}</div>
                <div><span className="text-muted-foreground">Recommended next action:</span> {(analysis.evidence?.recommended_next_action as string) || "—"}</div>
                <div><span className="text-muted-foreground">Business summary:</span> {(analysis.evidence?.business_summary as string) || "—"}</div>
              </div>
            ) : <p className="text-muted-foreground text-sm">No analysis yet. Run analysis.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
