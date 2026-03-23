import { useRef, useState } from "react";
import { createPdf } from "./pdfUtils";
import { extractPdfText, parseTrainCheckerText, type ParsedSummary } from "./parser";

type LokType = {
  name: string;
  weightTons: number;
  brakeWeightP: number;
  brakeWeightG: number;
  lengthMeters: number;
};

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<"P" | "G">("P");
  const [selectedLok, setSelectedLok] = useState<"G1206" | "custom">("G1206");
  const [customLokOpen, setCustomLokOpen] = useState(false);

  const [minimumBrakePercentage, setMinimumBrakePercentage] = useState("");
  const [issuedByName, setIssuedByName] = useState("");
  const [timetableSpeed, setTimetableSpeed] = useState("");

  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [pdfStatusText, setPdfStatusText] = useState("Keine Wagenliste ausgewählt");

  const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null);

  const [warningOpen, setWarningOpen] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [pendingPdfState, setPendingPdfState] = useState<any | null>(null);

  const [customLokName, setCustomLokName] = useState("");
  const [customLokWeight, setCustomLokWeight] = useState("");
  const [customLokBrakeP, setCustomLokBrakeP] = useState("");
  const [customLokBrakeG, setCustomLokBrakeG] = useState("");
  const [customLokLength, setCustomLokLength] = useState("");

  const g1206: LokType = {
    name: "G1206",
    weightTons: 88,
    brakeWeightP: 88,
    brakeWeightG: 75,
    lengthMeters: 15,
  };

  const customLok: LokType = {
    name: customLokName || "Eigene Lok",
    weightTons: Number(customLokWeight) || 0,
    brakeWeightP: Number(customLokBrakeP) || 0,
    brakeWeightG: Number(customLokBrakeG) || 0,
    lengthMeters: Number(customLokLength) || 0,
  };

  const activeLok = selectedLok === "G1206" ? g1206 : customLok;

  function determineLocoBrakeWeight(
    lok: LokType,
    wagonWeight: number,
    timetableBrakeMode: "P" | "G"
  ): number {
    const useG = timetableBrakeMode === "G" || wagonWeight >= 801;

    if (useG) {
      return Math.floor(lok.brakeWeightG * 0.75);
    }

    return lok.brakeWeightP;
  }

  async function handlePdfSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedPdfName("");
      setPdfStatusText("Keine Wagenliste ausgewählt");
      setParsedSummary(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedPdfName("");
      setPdfStatusText("Bitte eine PDF-Datei auswählen");
      setParsedSummary(null);
      return;
    }

    try {
      setSelectedPdfName(file.name);
      setPdfStatusText("PDF wird eingelesen ...");

      const text = await extractPdfText(file);
      const parsed = parseTrainCheckerText(text);

      setParsedSummary(parsed);
      setPdfStatusText("PDF erfolgreich eingelesen");
    } catch (error: any) {
      console.error("PDF-Fehler:", error);
      setParsedSummary(null);
      setPdfStatusText(`PDF konnte nicht gelesen werden: ${error?.message || error}`);
    }
  }

  function buildStateForPdf() {
    if (!parsedSummary) return null;

    const locoBrakeWeight = determineLocoBrakeWeight(
      activeLok,
      parsedSummary.totalWeightTons,
      mode
    );

    const totalWeight = parsedSummary.totalWeightTons + activeLok.weightTons;
    const totalBrakeWeight = parsedSummary.totalBrakeWeightTons + locoBrakeWeight;
    const totalAxles = parsedSummary.totalAxles + 4;
    const totalLength = Math.ceil(parsedSummary.totalLengthMeters + activeLok.lengthMeters);

    const availableBrakePercentage =
      totalWeight > 0
        ? Math.floor((totalBrakeWeight / totalWeight) * 100).toString()
        : "0";

    const minimum = parseInt(minimumBrakePercentage || "0", 10) || 0;
    const available = parseInt(availableBrakePercentage, 10) || 0;
    const missingBrakePercentage =
      available < minimum ? String(minimum - available) : "";

    const timetable = parseInt(timetableSpeed || "", 10);
    const speedCheckNo =
      !Number.isNaN(timetable) &&
      parsedSummary.lowerSpeedKmh !== null &&
      parsedSummary.lowerSpeedKmh < timetable;

    return {
      date: new Date().toLocaleDateString("de-DE"),
      trainNumber: parsedSummary.trainNumber,
      departureStation: parsedSummary.departureStation,

      wagonWeightTons: String(parsedSummary.totalWeightTons),
      locoWeightTons: String(activeLok.weightTons),
      totalWeightTons: String(totalWeight),

      wagonBrakeWeightTons: String(parsedSummary.totalBrakeWeightTons),
      locoBrakeWeightTons: String(locoBrakeWeight),
      totalBrakeWeightTons: String(totalBrakeWeight),

      wagonAxles: String(parsedSummary.totalAxles),
      locoAxles: "4",
      totalAxles: String(totalAxles),

      minimumBrakePercentage,
      availableBrakePercentage,
      missingBrakePercentage,

      lastVehicleNumber: parsedSummary.lastVehicleNumber,

      multiReleaseBrakeCount: String(parsedSummary.multiReleaseBrakeCount),
      kLllBrakeCount: String(parsedSummary.kLllBrakeCount),

      wagonLengthMeters: String(Math.ceil(parsedSummary.totalLengthMeters)),
      locoLengthMeters: String(activeLok.lengthMeters),
      totalLengthMeters: String(totalLength),

      speedCheckNo,
      lowerVehicleSpeedKmh: speedCheckNo ? String(parsedSummary.lowerSpeedKmh ?? "") : "",

      dangerousGoodsPresent: parsedSummary.dangerousGoodsPresent,

      issuedByName,
    };
  }

  function handleGeneratePdf() {
    const state = buildStateForPdf();

    if (!state) {
      alert("Bitte zuerst eine Wagenliste als PDF einfügen.");
      return;
    }

    const missing = parseInt(state.missingBrakePercentage || "0", 10) || 0;
    const lowerSpeed = parseInt(state.lowerVehicleSpeedKmh || "0", 10) || 0;

    const warnings: string[] = [];

    if (missing > 0) {
      warnings.push(
        `Achtung! Mindestbremshundertstel nicht erreicht! Es fehlen ${missing} Bremshundertstel! Kontaktaufnahme mit BZ erforderlich!`
      );
    }

    if (state.speedCheckNo && lowerSpeed > 0) {
      warnings.push(
        `Achtung! Im Zug läuft ein Fahrzeug, das nur mit ${lowerSpeed} km/h verkehren darf! Kontaktaufnahme mit BZ erforderlich!`
      );
    }

    if (warnings.length > 0) {
      setWarningText(warnings.join("\n\n"));
      setPendingPdfState(state);
      setWarningOpen(true);
      return;
    }

    createPdf(state);
  }

  function confirmWarningAndOpenPdf() {
    setWarningOpen(false);

    if (pendingPdfState) {
      createPdf(pendingPdfState);
      setPendingPdfState(null);
    }
  }

  return (
    <>
      <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
        <h1>BREZEL-Master</h1>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfSelection}
          style={{ display: "none" }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 10,
            background: "#6E53B3",
            color: "white",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
          }}
        >
          Wagenliste als PDF einfügen
        </button>

        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "#f3f3f3",
            borderRadius: 12,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <strong>Status:</strong> {pdfStatusText}
          <br />
          <strong>Datei:</strong> {selectedPdfName || "-"}
        </div>

        <h3 style={{ marginTop: 24 }}>Lok wählen</h3>

        <button
          onClick={() => setSelectedLok("G1206")}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            background: selectedLok === "G1206" ? "#1976D2" : "#B0BEC5",
            color: "white",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
          }}
        >
          G1206
        </button>

        <button
          onClick={() => {
            setSelectedLok("custom");
            setCustomLokOpen(true);
          }}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            background: selectedLok === "custom" ? "#1976D2" : "#B0BEC5",
            color: "white",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
          }}
        >
          Eigene Lok
        </button>

        <h3 style={{ marginTop: 24 }}>Bremsstellung laut Fahrplan</h3>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setMode("P")}
            style={{
              flex: 1,
              padding: 12,
              background: mode === "P" ? "#1976D2" : "#B0BEC5",
              color: "white",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            P
          </button>

          <button
            onClick={() => setMode("G")}
            style={{
              flex: 1,
              padding: 12,
              background: mode === "G" ? "#1976D2" : "#B0BEC5",
              color: "white",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            G
          </button>
        </div>

        <input
          value={minimumBrakePercentage}
          onChange={(e) => setMinimumBrakePercentage(e.target.value)}
          placeholder="Mindestbremshundertstel"
          style={{ width: "100%", padding: 12, marginTop: 20, boxSizing: "border-box" }}
        />

        <input
          value={issuedByName}
          onChange={(e) => setIssuedByName(e.target.value)}
          placeholder="Name"
          style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box" }}
        />

        <input
          value={timetableSpeed}
          onChange={(e) => setTimetableSpeed(e.target.value)}
          placeholder="Fahrplangeschwindigkeit"
          style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box" }}
        />

        <button
          onClick={handleGeneratePdf}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 20,
            background: "#6E53B3",
            color: "white",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
          }}
        >
          Bremszettel generieren
        </button>

        <div
          style={{
            marginTop: 80,
            textAlign: "center",
            color: "gray",
            fontSize: 12,
          }}
        >
          BREZEL-Master | Web-Version | by Jonas Gießmann
        </div>
      </div>

      {customLokOpen && (
        <div
          onClick={() => setCustomLokOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "white",
              borderRadius: 20,
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Eigene Lok</h2>

            <input
              value={customLokName}
              onChange={(e) => setCustomLokName(e.target.value)}
              placeholder="Lokbezeichnung"
              style={{ width: "100%", padding: 12, marginTop: 8, boxSizing: "border-box" }}
            />

            <input
              value={customLokWeight}
              onChange={(e) => setCustomLokWeight(e.target.value)}
              placeholder="Gewicht [t]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box" }}
            />

            <input
              value={customLokBrakeP}
              onChange={(e) => setCustomLokBrakeP(e.target.value)}
              placeholder="Bremsgewicht P [t]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box" }}
            />

            <input
              value={customLokBrakeG}
              onChange={(e) => setCustomLokBrakeG(e.target.value)}
              placeholder="Bremsgewicht G [t]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box" }}
            />

            <input
              value={customLokLength}
              onChange={(e) => setCustomLokLength(e.target.value)}
              placeholder="Länge [m]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box" }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 16,
              }}
            >
              <button
                onClick={() => setCustomLokOpen(false)}
                style={{
                  padding: "10px 16px",
                  background: "#B0BEC5",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>

              <button
                onClick={() => {
                  setSelectedLok("custom");
                  setCustomLokOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  background: "#6E53B3",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {warningOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: 20,
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Achtung!</h2>

            <div style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
              {warningText}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={confirmWarningAndOpenPdf}
                style={{
                  padding: "10px 18px",
                  background: "#6E53B3",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;