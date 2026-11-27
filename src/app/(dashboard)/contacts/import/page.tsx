"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExcelJS from "exceljs";
import Papa from "papaparse";

interface Row { business_name: string; contact_person?: string; phone_number?: string; email?: string; business_category?: string; city?: string; state?: string; website_url?: string; notes?: string; consent_status?: string; consent_source?: string; consent_evidence?: string; }

export default function ImportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  function parseFile(file: File) {
    setErrors([]);
    setSummary(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse<Record<string, unknown>>(file, { header: true, skipEmptyLines: true, complete: (res) => {
        const data = (res.data || []).map(normalizeRow);
        setRows(data);
        validateRows(data);
      } });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(e.target?.result as ArrayBuffer);
        const ws = wb.worksheets[0];
        const json: Record<string, unknown>[] = [];
        const header: string[] = [];
        ws.getRow(1).eachCell((cell, colNumber) => { header[colNumber] = String(cell.value || ""); });
        ws.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const obj: Record<string, unknown> = {};
          row.eachCell((cell, colNumber) => { obj[header[colNumber]] = cell.value; });
          json.push(obj);
        });
        const data = json.map(normalizeRow);
        setRows(data);
        validateRows(data);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrors(["Unsupported file type. Use .csv or .xlsx"]);
    }
  }

  function normalizeRow(r: Record<string, unknown>): Row {
    const g = (k: string) => r[k];
    return {
      business_name: String(g("business_name") || g("Business Name") || g("name") || ""),
      contact_person: String(g("contact_person") || g("Contact Person") || ""),
      phone_number: String(g("phone_number") || g("Phone") || g("phone") || ""),
      email: String(g("email") || g("Email") || ""),
      business_category: String(g("business_category") || g("Category") || g("category") || ""),
      city: String(g("city") || g("City") || ""),
      state: String(g("state") || g("State") || ""),
      website_url: String(g("website_url") || g("Website") || ""),
      notes: String(g("notes") || g("Notes") || ""),
      consent_status: String(g("consent_status") || g("Consent Status") || "pending"),
      consent_source: String(g("consent_source") || g("Consent Source") || "imported"),
      consent_evidence: String(g("consent_evidence") || g("Consent Evidence") || ""),
    };
  }

  function validateRows(data: Row[]) {
    const errs: string[] = [];
    data.forEach((r, i) => {
      if (!r.business_name) errs.push(`Row ${i + 2}: missing business name`);
      if (r.phone_number && !/^\+?\d{10,15}$/.test(r.phone_number.replace(/\D/g, ""))) errs.push(`Row ${i + 2}: invalid phone`);
    });
    setErrors(errs);
  }

  async function doImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/contacts/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
      const j = await res.json();
      setSummary(`Imported ${j.imported} contacts. Errors: ${j.errors?.length || 0}`);
      if (j.errors?.length) setErrors(j.errors);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Import failed"]);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Import contacts</h2>
      <Card>
        <CardHeader><CardTitle>Upload file</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />
          <p className="text-xs text-muted-foreground">Supported: .csv, .xlsx. Expected columns: business_name, contact_person, phone_number, email, business_category, city, state, website_url, notes, consent_status, consent_source, consent_evidence.</p>
        </CardContent>
      </Card>
      {errors.length > 0 && (
        <Card><CardContent className="p-4"><ul className="text-sm text-red-500 space-y-1">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></CardContent></Card>
      )}
      {rows.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Preview ({rows.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-80">
              <table className="text-xs w-full">
                <thead><tr>{Object.keys(rows[0]).map((k: any) => <th key={k} className="p-2 text-left border-b">{k}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 20).map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="p-2 border-b">{String(v || "")}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={doImport} disabled={importing || errors.length > 0}>{importing ? "Importing..." : "Import"}</Button>
              <Button variant="outline" onClick={() => router.push("/contacts")}>Cancel</Button>
            </div>
            {summary && <p className="text-sm mt-2">{summary}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
