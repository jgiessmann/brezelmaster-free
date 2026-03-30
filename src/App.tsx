import { useEffect, useRef, useState } from "react";
import { createPdf } from "./pdfUtils";
import { extractPdfText, parseTrainCheckerText, type ParsedSummary } from "./parser";


type LokType = {
  name: string;
  weightTons: number;
  brakeWeightP: number;
  brakeWeightG: number;
  lengthMeters: number;
  vmax: number;
  axles: number;
};

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [zugStart, setZugStart] = useState(true);
  const [mode, setMode] = useState<"P" | "G">("P");
  const [selectedLok, setSelectedLok] = useState<"list" | "custom">("list");
  const [selectedLokName, setSelectedLokName] = useState("G1206");
  const [lokSelectOpen, setLokSelectOpen] = useState(false);
  const [customLokOpen, setCustomLokOpen] = useState(false);

  const [minimumBrakePercentage, setMinimumBrakePercentage] = useState("");
  const [issuedByName, setIssuedByName] = useState("");
  const [timetableSpeed, setTimetableSpeed] = useState("");
  const [mainErrors, setMainErrors] = useState({
  minimumBrakePercentage: false,
  issuedByName: false,
  timetableSpeed: false,
  });

  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [pdfStatusText, setPdfStatusText] = useState("Keine Wagenliste ausgewählt");
  const isLoaded = selectedPdfName !== "";

  const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null);

  const [warningOpen, setWarningOpen] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [pendingPdfState, setPendingPdfState] = useState<any | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [customLokName, setCustomLokName] = useState("");
  const [customLokWeight, setCustomLokWeight] = useState("");
  const [customLokAxles, setCustomLokAxles] = useState("");
  const [customLokBrakeP, setCustomLokBrakeP] = useState("");
  const [customLokBrakeG, setCustomLokBrakeG] = useState("");
  const [customLokLength, setCustomLokLength] = useState("");
  const [customLokVmax, setCustomLokVmax] = useState("");
  const [customErrors, setCustomErrors] = useState({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});

  const [directionChange, setDirectionChange] = useState(false);
  const [showDirectionChangeModal, setShowDirectionChangeModal] = useState(false);
  const [directionChangeStation, setDirectionChangeStation] = useState("");

  const locomotives: LokType[] = [
    {
      name: "G1206",
      weightTons: 88,
      brakeWeightP: 88,
      brakeWeightG: 75,
      lengthMeters: 15,
      vmax: 100,
      axles: 4,
    },
    {
      name: "G1203",
      weightTons: 72,
      brakeWeightP: 66,
      brakeWeightG: 53,
      lengthMeters: 13,
      vmax: 60,
      axles: 4,
    },
    {
      name: "V100",
      weightTons: 62,
      brakeWeightP: 65,
      brakeWeightG: 57,
      lengthMeters: 13,
      vmax: 100,
      axles: 4,
    },
    {
      name: "DE18",
      weightTons: 90,
      brakeWeightP: 106,
      brakeWeightG: 86,
      lengthMeters: 17,
      vmax: 120,
      axles: 4,
    },
  ];

  const customLok: LokType = {
    name: customLokName || "Eigene Lok",
    weightTons: Number(customLokWeight) || 0,
    brakeWeightP: Number(customLokBrakeP) || 0,
    brakeWeightG: Number(customLokBrakeG) || 0,
    lengthMeters: Number(customLokLength) || 0,
    vmax: Number(customLokVmax) || 0,
    axles: Number(customLokAxles) || 0,
  };

  const selectedListLok =
  locomotives.find((lok) => lok.name === selectedLokName) || locomotives[0];

  const activeLok = selectedLok === "custom" ? customLok : selectedListLok;

  function determineLocoBrakeWeight(
  lok: LokType,
  wagonWeight: number,
  wagonLength: number,
  timetableBrakeMode: "P" | "G"
): number {
  if (timetableBrakeMode === "P") {
    if (wagonWeight <= 800) {
      if (wagonLength <= 500) {
        return lok.brakeWeightP;
      }

      if (wagonLength <= 600) {
        return Math.floor(lok.brakeWeightP * 0.95);
      }

      if (wagonLength <= 700) {
        return Math.floor(lok.brakeWeightP * 0.9);
      }

      return Math.floor(lok.brakeWeightP * 0.81);
    }

    if (wagonLength <= 700) {
      return Math.floor(lok.brakeWeightG * 0.75);
    }

    return Math.floor(lok.brakeWeightG * 0.7);
  }

  if (wagonLength > 700) {
    return Math.floor(lok.brakeWeightG * 0.95);
  }

  return lok.brakeWeightG;
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
      const message = error?.message ||
      String(error);
      const stack = error?.stack || "";

      setPdfStatusText(`PDF Fehler: ${message} |
      ${stack}`);
    }
  }

  function buildStateForPdf() {
    if (!parsedSummary) return null;

    const locoBrakeWeight = determineLocoBrakeWeight(
  activeLok,
  parsedSummary.totalWeightTons,
  parsedSummary.totalLengthMeters,
  mode
);

    const totalWeight = parsedSummary.totalWeightTons + activeLok.weightTons;
    const totalBrakeWeight = parsedSummary.totalBrakeWeightTons + locoBrakeWeight;
    const totalAxles = parsedSummary.totalAxles + activeLok.axles;
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
      zugStart,
      directionChange,
      directionChangeStation,
      firstVehicleNumber:
      parsedSummary.firstVehicleNumber,
      firstBrakeWeight:
      parsedSummary.firstBrakeWeight,
      lokVmax: activeLok.vmax,
      fahrplanVmax: parseInt(timetableSpeed || "0", 10),
  
      wagonWeightTons: String(parsedSummary.totalWeightTons),
      locoWeightTons: String(activeLok.weightTons),
      totalWeightTons: String(totalWeight),

      wagonBrakeWeightTons: String(parsedSummary.totalBrakeWeightTons),
      locoBrakeWeightTons: String(locoBrakeWeight),
      totalBrakeWeightTons: String(totalBrakeWeight),

      wagonAxles: String(parsedSummary.totalAxles),
      locoAxles: String(activeLok.axles),
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
      lowerSpeedKmh: speedCheckNo ? String(parsedSummary.lowerSpeedKmh ?? "") : "",

      dangerousGoodsPresent: parsedSummary.dangerousGoodsPresent,

      issuedByName,
    };
  }

  async function handleGeneratePdf() {
    const errors = {
    minimumBrakePercentage: minimumBrakePercentage.trim() === "",
    issuedByName: issuedByName.trim() === "",
    timetableSpeed: timetableSpeed.trim() === "",
  };

  setMainErrors(errors);

  const hasMainError = Object.values(errors).some((e) => e);
  if (hasMainError) return;

    const state = buildStateForPdf();

    if (!state) {
      alert("Bitte zuerst eine Wagenliste als PDF einfügen.");
      return;
    }

      setIsGeneratingPdf(true);


    if (state.directionChange && state.directionChangeStation.trim() !== "") {
  const wagonWeight = parseInt(state.wagonWeightTons || "0", 10);

  if (wagonWeight >= 1200) {
    setWarningText(
      "Achtung! Richtungswechsel nicht zulässig! Wagenzuggewicht liegt bei mehr als 1200 Tonnen! Neue Wagenliste erforderlich!"
    );
    setPendingPdfState(null);
    setWarningOpen(true);
    return;
  }

  if ((state.firstBrakeWeight || 0) === 0) {
    setWarningText(
      "Achtung! Richtungswechsel nicht zulässig! Nach dem Richtungswechsel hat der letzte Wagen keine wirkende Druckluftbremse! Neue Wagenliste erforderlich!"
    );
    setPendingPdfState(null);
    setWarningOpen(true);
    return;
  }
}

    const missing = parseInt(state.missingBrakePercentage || "0", 10) || 0;
    const lowerSpeed = parseInt(state.lowerSpeedKmh || "0", 10) || 0;

    const warnings: string[] = [];

    const fahrplanVmax = parseInt(timetableSpeed || "0", 10);

const lokVmax = activeLok.vmax;

if (!Number.isNaN(fahrplanVmax) && lokVmax < fahrplanVmax) {
  warnings.push(
    `Achtung! Eines der arbeitenden Triebfahrzeuge darf nur mit ${lokVmax} km/h fahren! Kontaktaufnahme mit BZ erforderlich!`
  );
}

if (missing > 0) {
  warnings.push(
    `Achtung! Mindestbremshundertstel nicht erreicht! Es fehlen ${missing} Bremshundertstel! Kontaktaufnahme mit BZ erforderlich!`
  );
}

if (state.speedCheckNo && lowerSpeed > 0) {
  warnings.push(
    `Achtung! Im Wagenzug läuft ein Fahrzeug, das nur mit ${lowerSpeed} km/h verkehren darf! Kontaktaufnahme mit BZ erforderlich!`
  );
}

    if (warnings.length > 0) {
  setWarningText(warnings.join("\n\n"));
  setPendingPdfState(state);
  setWarningOpen(true);
  setIsGeneratingPdf(false);
  return;
}

    if (state.directionChange && state.directionChangeStation.trim() !== "") {
  const reversedState = {
    ...state,
    lastVehicleNumber: state.firstVehicleNumber,
    departureStation: state.directionChangeStation,
  };

  await createPdf(state, reversedState);
  setIsGeneratingPdf(false);
} else {
  await createPdf(state);
  setIsGeneratingPdf(false);
}
  }

  async function confirmWarningAndOpenPdf() {
  setWarningOpen(false);
  setIsGeneratingPdf(true);


  if (pendingPdfState) {
    if (
      pendingPdfState.directionChange &&
      pendingPdfState.directionChangeStation.trim() !== ""
    ) {
      const reversedState = {
        ...pendingPdfState,
        lastVehicleNumber: pendingPdfState.firstVehicleNumber,
        departureStation: pendingPdfState.directionChangeStation,
      };

            await createPdf(pendingPdfState, reversedState);
    } else {
      await createPdf(pendingPdfState);
    }

    setPendingPdfState(null);
    setIsGeneratingPdf(false);
  }  else {
    setIsGeneratingPdf(false);
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
            fontSize: 18,
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
            background:
  pdfStatusText === "PDF wird eingelesen ..."
    ? "#fff3cd"
    : isLoaded
    ? "#d4edda"
    : "#f8d7da",

color:
  pdfStatusText === "PDF wird eingelesen ..."
    ? "#856404"
    : isLoaded
    ? "#1d8335"
    : "#e24b5a",
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
        onClick={() => {
        setSelectedLok("list");
        setLokSelectOpen(true);
        }}
        style={{
        width: "100%",
        padding: 12,
        fontSize: 18,
        marginTop: 8,
        background: selectedLok === "list" ? "#1976D2" : "#B0BEC5",
        color: "white",
        border: "none",
        borderRadius: 20,
        cursor: "pointer",
        }}
        >
        Lok aus Liste wählen ({selectedListLok.name})
        </button>

        <button
          onClick={() => {
          setSelectedLok("custom");
          setCustomLokOpen(true);
          }}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 18,
            marginTop: 8,
            background: selectedLok === "custom" ? "#1976D2" : "#B0BEC5",
            color: "white",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
          }}
        >
          Eigene Lok{" "}
          {selectedLok === "custom" && customLokName.trim() !== ""
          ? `(${customLokName})`
          : ""}
        </button>
        
        

  <h3 style={{ marginTop: 24 }}>Zuganfangsbahnhof?</h3>

<div style={{ display: "flex", gap: 10, width: "100%" }}>
  <button
    type="button"
    onClick={() => setZugStart(true)}
    style={{
      flex: 1,
      padding: "14px 0",
      fontSize: 18,
      background: zugStart ? "#1976D2" : "#CFD8DC",
      color: "white",
      border: "none",
      borderRadius: 20,
      cursor: "pointer",
    }}
  >
    Ja
  </button>

  <button
    type="button"
    onClick={() => setZugStart(false)}
    style={{
      flex: 1,
      padding: "14px 0",
      fontSize: 18,
      background: !zugStart ? "#1976D2" : "#CFD8DC",
      color: "white",
      border: "none",
      borderRadius: 20,
      cursor: "pointer",
    }}
  >
    Nein
  </button>
</div>

<h3 style={{ marginTop: 24 }}>Richtungswechsel auf Laufweg?</h3>

<div style={{ display: "flex", gap: 10, width: "100%" }}>
  <button
    type="button"
    onClick={() => {
      setDirectionChange(false);
      setShowDirectionChangeModal(false);
      setDirectionChangeStation("");
    }}
    style={{
      flex: 1,
      padding: "14px 0",
      fontSize: 18,
      background: !directionChange ? "#1976D2" : "#CFD8DC",
      color: "white",
      border: "none",
      borderRadius: 20,
      cursor: "pointer",
    }}
  >
    Nein
  </button>

  <button
    type="button"
    onClick={() => {
      setDirectionChange(true);
      setShowDirectionChangeModal(true);
    }}
    style={{
      flex: 1,
      padding: "14px 0",
      fontSize: 18,
      background: directionChange ? "#1976D2" : "#CFD8DC",
      color: "white",
      border: "none",
      borderRadius: 20,
      cursor: "pointer",
    }}
  >
    Ja
  </button>
</div>

        <h3 style={{ marginTop: 24 }}>Bremsstellung laut Fahrplan</h3>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setMode("P")}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 18,
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
              fontSize: 18,
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
        type="number"
        value={minimumBrakePercentage}
        onChange={(e) => setMinimumBrakePercentage(e.target.value)}
        placeholder="Mindestbremshundertstel"
        style={{
        width: "100%",
        padding: 12,
        marginTop: 20,
        boxSizing: "border-box",
        border: mainErrors.minimumBrakePercentage ? "2px solid red" : "1px solid #ccc",
        }}
        />

        <input
        value={issuedByName}
        onChange={(e) => setIssuedByName(e.target.value)}
        placeholder="Name"
        style={{
        width: "100%",
        padding: 12,
        marginTop: 10,
        boxSizing: "border-box",
        border: mainErrors.issuedByName ? "2px solid red" : "1px solid #ccc",
        }}
        />

        <input
        type="number"
        value={timetableSpeed}
        onChange={(e) => setTimetableSpeed(e.target.value)}
        placeholder="Fahrplangeschwindigkeit"
        style={{
        width: "100%",
        padding: 12,
        marginTop: 10,
        boxSizing: "border-box",
        border: mainErrors.timetableSpeed ? "2px solid red" : "1px solid #ccc",
        }}
        />

        <button
        onClick={handleGeneratePdf}
        disabled={isGeneratingPdf}
        style={{
        width: "100%",
        padding: 14,
        fontSize: 18,
        marginTop: 20,
        background: "#6E53B3",
        color: "white",
        border: "none",
        borderRadius: 20,
        cursor: isGeneratingPdf ? "default" : "pointer",
        opacity: isGeneratingPdf ? 0.8 : 1,
  }}
>
  {isGeneratingPdf ? "Bremszettel wird erzeugt ..." : "Bremszettel generieren"}
</button>

        <div
          style={{
            marginTop: 80,
            textAlign: "center",
            color: "gray",
            fontSize: 12,
          }}
        >
          BREZEL-Master | Web-Version 2.2 | by Jonas Gießmann
        </div>

        </div>

        {lokSelectOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
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
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Lok auswählen</h2>

            <div
              style={{
                marginTop: 12,
                overflowY: "auto",
                border: "1px solid #D0D7DE",
                borderRadius: 12,
                padding: 8,
                maxHeight: "40vh",
              }}
            >
              {locomotives.map((lok) => (
                <button
                  key={lok.name}
                  type="button"
                  onClick={() => {
                    setSelectedLok("list");
                    setSelectedLokName(lok.name);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    marginBottom: 8,
                    background: selectedLokName === lok.name ? "#1976D2" : "#ECEFF1",
                    color: selectedLokName === lok.name ? "white" : "black",
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                >
                  {lok.name}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                onClick={() => setLokSelectOpen(false)}
                style={{
                  padding: "10px 16px",
                  background: "#6E53B3",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

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
              style={{ width: "100%", padding: 12, marginTop: 8, boxSizing: "border-box",
              border: customErrors.name ? "2px solid red" : "1px solid #ccc", 
              }}
            />

            <input
              type="number"
              value={customLokWeight}
              onChange={(e) => setCustomLokWeight(e.target.value)}
              placeholder="Gewicht [t]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box", 
              border: customErrors.weight ? "2px solid red" : "1px solid #ccc",
              }}
            />

            <input
              type="number"
              value={customLokBrakeP}
              onChange={(e) => setCustomLokBrakeP(e.target.value)}
              placeholder="Bremsgewicht P [t]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box",
              border: customErrors.brakeP ? "2px solid red" : "1px solid #ccc",
              }}
            />

            <input
              type="number"
              value={customLokBrakeG}
              onChange={(e) => setCustomLokBrakeG(e.target.value)}
              placeholder="Bremsgewicht G [t]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box",
              border: customErrors.brakeG ? "2px solid red" : "1px solid #ccc",
               }}
            />

            <input
              type="number"
              value={customLokLength}
              onChange={(e) => setCustomLokLength(e.target.value)}
              placeholder="Länge [m]"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box",
              border: customErrors.length ? "2px solid red" : "1px solid #ccc",
              }}
              />

              <input
              type="number"
              value={customLokAxles}
              onChange={(e) => setCustomLokAxles(e.target.value)}
              placeholder="Achsenzahl"
              style={{ width: "100%", padding: 12, marginTop: 10, boxSizing: "border-box",
              border: customErrors.axles ? "2px solid red" : "1px solid #ccc",
              
               }}
              />

            <input
              type="number"
              value={customLokVmax}
              onChange={(e) => setCustomLokVmax(e.target.value)}
              placeholder="Zul. Höchstgeschwindigkeit (km/h)"
              style={{ width: "100%", padding: 12, marginTop: 8, boxSizing: "border-box",
              border: customErrors.vmax ? "2px solid red" : "1px solid #ccc",
              }}
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
    const errors = {
      name: customLokName.trim() === "",
      weight: Number(customLokWeight) <= 0,
      brakeP: Number(customLokBrakeP) <= 0,
      brakeG: Number(customLokBrakeG) <= 0,
      length: Number(customLokLength) <= 0,
      vmax: Number(customLokVmax) <= 0,
      axles: Number(customLokAxles) <= 0,
    };

    setCustomErrors(errors);

    const hasError = Object.values(errors).some((e) => e);
    if (hasError) return;

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

      {showDirectionChangeModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 16,
        width: "90%",
        maxWidth: 420,
      }}
    >
      <h3>Betriebsstelle des Richtungswechsels</h3>

      <input
        value={directionChangeStation}
        onChange={(e) => setDirectionChangeStation(e.target.value)}
        placeholder="z.B. Bruchsal"
        style={{
          width: "100%",
          padding: 12,
          marginTop: 10,
          boxSizing: "border-box",
        }}
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
          onClick={() => {
            setDirectionChange(false);
            setShowDirectionChangeModal(false);
            setDirectionChangeStation("");
          }}
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
            setShowDirectionChangeModal(false);
          }}
          style={{
            padding: "10px 16px",
            background: "#1976D2",
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