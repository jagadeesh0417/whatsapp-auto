"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [range, setRange] = useState("30");

  useEffect(() => {
    fetch("/api/reports/summary").then((r) => r.json()).then(setSummary);
  }, []);

  async function exportCSV() {
    const businesses = summary?.businesses || [];
    const rows = businesses.map((b: any) => ({
      business_name: b.business_name,
      contact_person: b.contact_person || "",
      phone_number: b.phone_number || "",
      email: b.email || "",
      business_category: b.business_category || "",
      city: b.city || "",
      pipeline_status: b.pipeline_status,
      lead_score: b.lead_score,
    }));
    const safe = rows.map((r: any) => {
      const out: Record<string, string> = {};
      for (const k in r) {
        let v = String((r as Record<string, unknown>)[k]);
        if (/^[=+\-@]/.test(v)) v = "'" + v;
        out[k] = v;
      }
      return out;
    });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Contacts");
    if (safe.length) {
      ws.columns = Object.keys(safe[0]).map((k: any) => ({ header: k, key: k }));
      safe.forEach((r: any) => ws.addRow(r));
    }
    const buf = await wb.csv.writeBuffer();
    const blob = new Blob([buf], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "akradhi-report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportXLSX() {
    const businesses = summary?.businesses || [];
    const rows = businesses.map((b: any) => ({
      business_name: b.business_name,
      contact_person: b.contact_person || "",
      phone_number: b.phone_number || "",
      email: b.email || "",
      business_category: b.business_category || "",
      city: b.city || "",
      pipeline_status: b.pipeline_status,
    }));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Contacts");
    if (rows.length) {
      ws.columns = Object.keys(rows[0]).map((k: any) => ({ header: k, key: k }));
      rows.forEach((r: any) => ws.addRow(r));
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "akradhi-report.xlsx"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Reports</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Export</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={exportXLSX} variant="outline">Export Excel</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>Total businesses: {summary?.total ?? 0}</div>
          <div>Converted: {summary?.converted ?? 0}</div>
          <div>Conversion rate: {summary?.conversionRate ?? 0}%</div>
          <div>Conversations: {summary?.conversations ?? 0}</div>
          <div>Follow-ups pending: {summary?.followUpsPending ?? 0}</div>
          <div>AI usage calls: {summary?.aiUsage ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
