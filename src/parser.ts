import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

export type ParsedSummary = {
  trainNumber: string;
  departureStation: string;
  destinationStation: string;
  lastVehicleNumber: string;
  totalAxles: number;
  totalLengthMeters: number;
  totalWeightTons: number;
  totalBrakeWeightTons: number;
  multiReleaseBrakeCount: number;
  kLllBrakeCount: number;
  dBrakeCount: number;
  dangerousGoodsPresent: boolean;
  lowerSpeedKmh: number | null;
  allInGMode: boolean;
};

type WagonRow = {
  wagonNumber: string;
  sole: string;
  brakeP: number;
  brakeG: number;
  dangerousGoods: boolean;
  vmax: number | null;
};

type Summary = {
  axles: number;
  lengthMeters: number;
  weightTons: number;
  brakeP: number;
  brakeG: number;
};

export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await (page as any).getTextContent({
      normalizeWhitespace: true,
    });
    

    const items = (textContent.items as any[])
      .filter((item) => typeof item?.str === "string" && item.str.trim() !== "")
      .map((item) => ({
        str: String(item.str),
        x: Number(item.transform?.[4] ?? 0),
        y: Number(item.transform?.[5] ?? 0),
      }));

    // Erst nach y, dann nach x
    items.sort((a, b) => {
      const yDiff = Math.abs(b.y - a.y);
      if (yDiff > 2) return b.y - a.y;
      return a.x - b.x;
    });

    const lines: { y: number; parts: { x: number; str: string }[] }[] = [];
    const tolerance = 2;

    for (const item of items) {
      const existingLine = lines.find((line) => Math.abs(line.y - item.y) <= tolerance);

      if (existingLine) {
        existingLine.parts.push({ x: item.x, str: item.str });
      } else {
        lines.push({
          y: item.y,
          parts: [{ x: item.x, str: item.str }],
        });
      }
    }

    lines.sort((a, b) => b.y - a.y);

    const pageText = lines
      .map((line) =>
        line.parts
          .sort((a, b) => a.x - b.x)
          .map((part) => part.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter((line) => line.length > 0)
      .join("\n");

    fullText += pageText + "\n";
  }

  return fullText;
}

export function parseTrainCheckerText(text: string): ParsedSummary {
  const normalized = normalize(text);

  const trainNumber = findFirstGroup(
    normalized,
    "Zugnummer\\s+(\\d+)",
    "Zugnummer\\(n\\)\\s+(\\d+)"
  );

  const departureStation = findDepartureStation(normalized);

  const rows = parseRows(normalized);
  const lastVehicle = rows.length > 0 ? rows[rows.length - 1].wagonNumber : "";

  const activeRows = rows.filter((row) => row.brakeP > 0 || row.brakeG > 0);

  const multiRelease = activeRows.length;
  const kLll = activeRows.filter((row) =>
    ["K", "L", "LL"].includes(row.sole)
  ).length;
  const dCount = activeRows.filter((row) => row.sole === "D").length;

  const vmaxValues = rows
    .map((r) => r.vmax)
    .filter((v): v is number => v != null);

  const lowestVmax = vmaxValues.length > 0 ? Math.min(...vmaxValues) : null;
  const dangerousGoodsPresent = rows.some((r) => r.dangerousGoods);

  const sum = parseSummary(normalized);

  const allInGMode =
    activeRows.length > 0 &&
    activeRows.every((r) => r.brakeP === 0 && r.brakeG > 0);

  const finalBrakeFromDeduction = findGermanInt(
    normalized,
    "Bremsgewicht\\s+R\\/P\\s+\\(DE\\)\\s+([\\d.]+)",
    "Bremsgewicht\\s+R\\/P\\s+\\(DE\\)\\s*([\\d.]+)"
  );

  const finalBrake =
    finalBrakeFromDeduction != null
      ? finalBrakeFromDeduction
      : allInGMode
      ? sum.brakeG
      : sum.brakeP;

  return {
    trainNumber,
    departureStation,
    destinationStation: "",
    lastVehicleNumber: lastVehicle,
    totalAxles: sum.axles,
    totalLengthMeters: sum.lengthMeters,
    totalWeightTons: sum.weightTons,
    totalBrakeWeightTons: finalBrake,
    multiReleaseBrakeCount: multiRelease,
    kLllBrakeCount: kLll,
    dBrakeCount: dCount,
    dangerousGoodsPresent,
    lowerSpeedKmh: lowestVmax,
    allInGMode,
  };
}

function normalize(input: string): string {
  return input
    .replace(/\u00A0/g, " ")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\r/g, "")
    .replace(/Triebfahr􀀀zeuge/g, "Triebfahrzeuge")
    .replace(/[ ]{2,}/g, " ");
}

function findDepartureStation(text: string): string {
  const raw = findFirstGroup(
    text,
    "Ab Bhf\\.\\s+(.+?)\\s+\\(DE\\)",
    "Ab Bhf\\.\\s+(.+?)\\s+Wagen und nicht arbeitende Triebfahrzeuge",
    "Ab Bhf\\.\\s+(.+?)\\s+Abfahrtsdatum"
  );

  return raw.split("(")[0].trim();
}

function parseSummary(text: string): Summary {
  const sumLine =
    text
      .split("\n")
      .find((line) => line.trim().startsWith("Summe ")) ?? "";

  const nums: string[] = sumLine.match(/[\d.,]+/g) || [];

  // Typischer TrainChecker-Fall:
  // Summe 80 240,80 1.131.955 1.575.415 873 294 135
  //        0    1        2         3     4   5   6
  if (nums.length >= 7) {
    return {
      axles: parseIntSafe(nums[0]),
      lengthMeters: parseGermanDouble(nums[1]),
      weightTons: Math.round(parseGermanIntWithDots(nums[3]) / 1000),
      brakeP: parseIntSafe(nums[4]),
      brakeG: parseIntSafe(nums[5]),
    };
  }

  // Fallbacks für andere Layouts
  if (nums.length === 6) {
    return {
      axles: parseIntSafe(nums[0]),
      lengthMeters: parseGermanDouble(nums[1]),
      weightTons: Math.round(parseGermanIntWithDots(nums[3]) / 1000),
      brakeP: parseIntSafe(nums[4]),
      brakeG: parseIntSafe(nums[5]),
    };
  }

  if (nums.length === 5) {
    return {
      axles: parseIntSafe(nums[0]),
      lengthMeters: parseGermanDouble(nums[1]),
      weightTons: Math.round(parseGermanIntWithDots(nums[2]) / 1000),
      brakeP: parseIntSafe(nums[3]),
      brakeG: parseIntSafe(nums[4]),
    };
  }

  return {
    axles: 0,
    lengthMeters: 0,
    weightTons: 0,
    brakeP: 0,
    brakeG: 0,
  };
}

function parseRows(text: string): WagonRow[] {
  const lines = text.split("\n");

  const wagonRegex = /\b\d{2}\s\d{2}\s\d{4}\s\d{3}-\d\b/;
  const soleRegex = /\b(K|L|LL|D|F|R|P|G)\b/i;
  const vmaxRegex = /\b(40|50|60|70|80|90|100|120|140|160)\b(?=\s+[A-Z]\d\b|\s*$)/;

  const rows: WagonRow[] = [];

  for (const line of lines) {
    const wagonMatch = line.match(wagonRegex);
    if (!wagonMatch) continue;

    const wagon = wagonMatch[0];

    const soleMatch = line.match(soleRegex);
    const sole = soleMatch ? soleMatch[0].toUpperCase() : "";

    const afterSole = soleMatch
      ? line.substring(line.indexOf(soleMatch[0]) + soleMatch[0].length).trim()
      : line;

    // Erste Zahlen nach der Sohle sind die relevanten Bremszahlen.
    // Für die Zähl-Logik reicht: wenn P oder G > 0, dann aktiv.
    const numberTokens = (afterSole.match(/\b\d{1,3}\b/g) || [])
      .map((m) => parseIntSafe(m));

    const brakeP = numberTokens[0] ?? 0;
    const brakeG = numberTokens[1] ?? 0;

    const dangerousGoods =
      /\b\d{4}\b\s+\b\d(?:[.,]\d)?(?:\?\:\s*,\s*\d(?:[.,]\d)?)?\b/.test(line) ||
      /\bUN\b/i.test(line);

    const vmaxMatch = line.match(vmaxRegex);
    const vmax = vmaxMatch ? parseIntSafe(vmaxMatch[0]) : null;

    rows.push({
      wagonNumber: wagon,
      sole,
      brakeP,
      brakeG,
      dangerousGoods,
      vmax,
    });
  }

  return rows;
}

function findFirstGroup(text: string, ...patterns: string[]): string {
  for (const pattern of patterns) {
    const re = new RegExp(pattern, "i");
    const match = text.match(re);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function findGermanInt(text: string, ...patterns: string[]): number | null {
  const raw = findFirstGroup(text, ...patterns);
  if (!raw) return null;
  return parseGermanIntWithDots(raw);
}

function parseIntSafe(value: string): number {
  const n = parseInt(String(value).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseGermanDouble(value: string): number {
  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function parseGermanIntWithDots(value: string): number {
  const normalized = String(value).replace(/\./g, "").replace(",", "");
  const n = parseInt(normalized, 10);
  return Number.isFinite(n) ? n : 0;
}