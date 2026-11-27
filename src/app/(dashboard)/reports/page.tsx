"use client";
import { useState } from "react";
import { getStore } from "@/lib/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";

export default function ReportsPage() {
  const store = getStore();
  const [range, setRange] = useState("30");

  async function exportCSV() {
    const businesses = store.listBusinesses();
    const rows = businesses.map((b) => ({
      business_name: b.business_name,
      contact_person: b.contact_person || "",
      phone_number: b.phone_number || "",
      email: b.email || "",
      business_category: b.business_category || "",
      city: b.city || "",
      pipeline_status: b.pipeline_status,
      lead_score: b.lead_score,
    }));
    // prevent formula injection: prefix dangerous chars
    const safe = rows.map((r) => {
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
      ws.columns = Object.keys(safe[0]).map((k) => ({ header: k, key: k }));
      safe.forEach((r) => ws.addRow(r));
    }
    const buf = await wb.csv.writeBuffer();
    const blob = new Blob([buf], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "akradhi-report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportXLSX() {
    const businesses = store.listBusinesses();
    const rows = businesses.map((b) => ({
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
      ws.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k }));
      rows.forEach((r) => ws.addRow(r));
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "akradhi-report.xlsx"; a.click();
    URL.revokeObjectURL(url);
  }

  const businesses = store.listBusinesses();
  const converted = businesses.filter((b) => b.pipeline_status === "converted").length;
  const conversionRate = businesses.length ? Math.round((converted / businesses.length) * 100) : 0;

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
          <div>Total businesses: {businesses.length}</div>
          <div>Converted: {converted}</div>
          <div>Conversion rate: {conversionRate}%</div>
          <div>Conversations: {store.listConversations().length}</div>
          <div>Messages: {store.messages.length}</div>
          <div>Follow-ups pending: {store.listFollowUps("pending").length}</div>
          <div>AI usage calls: {store.listAIUsage().length}</div>
        </CardContent>
      </Card>
    </div>
  );
}
