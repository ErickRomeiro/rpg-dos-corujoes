// Parser mínimo de leitura de .xlsx para inspecionar a planilha de origem.
// Uso: node scripts/inspect-xlsx.mjs <caminho-xlsx> "<sheetName>" [maxRows]
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const XLSX = process.argv[2] ?? "./ficha.xlsx";
const sheetName = process.argv[2];
const maxRows = Number(process.argv[3] ?? 15);

// Extrai uma entrada do zip via PowerShell (sem dependências externas).
function readEntry(entry) {
  const out = join(tmpdir(), "xlsx_entry_" + Math.abs(hash(entry)) + ".xml");
  const ps = `Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[System.IO.Compression.ZipFile]::OpenRead('${XLSX}'); $e=$z.Entries | Where-Object { $_.FullName -eq '${entry}' }; $r=New-Object System.IO.StreamReader($e.Open()); [System.IO.File]::WriteAllText('${out.replace(/\\/g, "\\\\")}', $r.ReadToEnd(), [System.Text.Encoding]::UTF8); $r.Close(); $z.Dispose()`;
  execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: "ignore" });
  return readFileSync(out, "utf8");
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// 1) Mapeia nome da aba -> arquivo xml
const wb = readEntry("xl/workbook.xml");
const rels = readEntry("xl/_rels/workbook.xml.rels");
const relMap = {};
for (const m of rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)) {
  relMap[m[1]] = m[2];
}
const sheets = {};
for (const m of wb.matchAll(/<sheet name="([^"]+)"[^>]*r:id="(rId\d+)"/g)) {
  const name = m[1].replace(/&amp;/g, "&");
  sheets[name] = "xl/" + relMap[m[2]].replace(/^\//, "");
}

if (!sheetName) {
  console.log("Abas disponíveis:");
  for (const n of Object.keys(sheets)) console.log("  -", n, "=>", sheets[n]);
  process.exit(0);
}

// 2) sharedStrings
const ssXml = readEntry("xl/sharedStrings.xml");
const shared = [];
for (const m of ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
  const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]);
  shared.push(
    texts
      .join("")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#10;/g, " "),
  );
}

// 3) Lê células da aba alvo
const file = sheets[sheetName];
if (!file) {
  console.error("Aba não encontrada:", sheetName);
  process.exit(1);
}
const sheetXml = readEntry(file);
const rows = {};
for (const r of sheetXml.matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
  const attrs = r[1];
  const inner = r[2] ?? "";
  const ref = attrs.match(/r="([A-Z]+)(\d+)"/);
  if (!ref) continue;
  const col = ref[1];
  const row = Number(ref[2]);
  const type = (attrs.match(/t="([^"]+)"/) ?? [])[1];
  const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
  let val = "";
  if (vm) {
    val = type === "s" ? shared[Number(vm[1])] : vm[1];
  } else {
    const im = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/);
    if (im) val = im[1];
  }
  if (val == null || val === "") continue;
  (rows[row] ??= {})[col] = String(val).slice(0, 40);
}

const rowNums = Object.keys(rows).map(Number).sort((a, b) => a - b).slice(0, maxRows);
for (const rn of rowNums) {
  const cells = rows[rn];
  const cols = Object.keys(cells).sort();
  console.log(
    `R${rn}: ` + cols.map((c) => `${c}=${cells[c]}`).join(" | "),
  );
}
console.log(`\n(total shared strings: ${shared.length})`);
