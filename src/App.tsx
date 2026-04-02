import { useEffect, useRef, useState } from "react";
import { createPdf } from "./pdfUtils";
import { extractPdfText, parseTrainCheckerText, type ParsedSummary } from "./parser";

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [zugStart, setZugStart] = useState(true);
  const [directionChange, setDirectionChange] = useState(false);
  const [mode, setMode] = useState<"P" | "G">("P");
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success">("idle");
  const [selectedLokName, setSelectedLokName] = useState("G1206");
  const [lokSelectOpen, setLokSelectOpen] = useState(false);
  const locomotives = [
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
const [customLokOpen, setCustomLokOpen] = useState(false);

const [customLokName, setCustomLokName] = useState("");
const [customLokWeight, setCustomLokWeight] = useState("");
const [customLokBrakeP, setCustomLokBrakeP] = useState("");
const [customLokBrakeG, setCustomLokBrakeG] = useState("");
const [customLokLength, setCustomLokLength] = useState("");
const [customLokVmax, setCustomLokVmax] = useState("");
const [customLokAxles, setCustomLokAxles] = useState("");
const [directionModalOpen, setDirectionModalOpen] = useState(false);

const [directionStation, setDirectionStation] = useState("");
const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null);

const [minimumBrakePercentageInput, setMinimumBrakePercentageInput] = useState("");
const [timetableSpeedInput, setTimetableSpeedInput] = useState("");
const [issuedByName, setIssuedByName] = useState("");
useEffect(() => {
  const savedName = localStorage.getItem("issuedByName");
  if (savedName) {
    setIssuedByName(savedName);
  }
}, []);

const [warningOpen, setWarningOpen] = useState(false);
const [pendingPdfState, setPendingPdfState] = useState<any | null>(null);

const [customErrors, setCustomErrors] = useState({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});

const [mainErrors, setMainErrors] = useState({
  minimumBrakePercentage: false,
  timetableSpeed: false,
  issuedByName: false,
});

const [warningCanContinue, setWarningCanContinue] = useState(true);
const [warningItems, setWarningItems] = useState<string[]>([]);

const [isGenerating, setIsGenerating] = useState(false);

const [directionError, setDirectionError] = useState(false);

function determineLocoBrakeWeight(
  lok: {
    brakeWeightP: number;
    brakeWeightG: number;
  },
  wagonWeight: number,
  wagonLength: number,
  selectedMode: "P" | "G"
): number {
  if (selectedMode === "P") {
    if (wagonWeight <= 800) {
      if (wagonLength <= 500) {
        return lok.brakeWeightP;
      }

      if (wagonLength <= 600) {
        return Math.floor(lok.brakeWeightP * 0.95);
      }

      if (wagonLength <= 700) {
        return Math.floor(lok.brakeWeightP * 0.90);
      }

      return Math.floor(lok.brakeWeightP * 0.81);
    }

    if (wagonLength <= 700) {
      return Math.floor(lok.brakeWeightG * 0.75);
    }

    return Math.floor(lok.brakeWeightG * 0.70);
  }

  if (wagonLength <= 700) {
    return lok.brakeWeightG;
  }

  return Math.floor(lok.brakeWeightG * 0.95);
}

  async function handlePdfSelection(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) {
    setSelectedPdfName("");
    setPdfStatus("idle");
    setParsedSummary(null);
    return;
  }

  if (file.type !== "application/pdf") {
    setSelectedPdfName("");
    setPdfStatus("idle");
    setParsedSummary(null);
    alert("Bitte eine PDF-Datei auswählen.");
    return;
  }

  try {
    setSelectedPdfName(file.name);
    setPdfStatus("loading");

    const text = await extractPdfText(file);
    const parsed = parseTrainCheckerText(text);

    setParsedSummary(parsed);
    setPdfStatus("success");
  } catch (error) {
    console.error(error);
    setSelectedPdfName("");
    setPdfStatus("idle");
    setParsedSummary(null);
    alert("Fehler beim Einlesen der Wagenliste.");
  }
}

  const [selectedLok, setSelectedLok] = useState<"list" | "custom">("list");

  const selectedListLok =
  locomotives.find((lok) => lok.name === selectedLokName) || locomotives[0];

const activeLok =
  selectedLok === "custom"
    ? {
        name: customLokName || "Eigene Lok",
        weightTons: Number(customLokWeight) || 0,
        brakeWeightP: Number(customLokBrakeP) || 0,
        brakeWeightG: Number(customLokBrakeG) || 0,
        lengthMeters: Number(customLokLength) || 0,
        vmax: Number(customLokVmax) || 0,
        axles: Number(customLokAxles) || 0,
      }
    : selectedListLok;

  async function handleGeneratePdf() {
    setIsGenerating(true);



    const errors = {
  minimumBrakePercentage: minimumBrakePercentageInput.trim() === "",
  timetableSpeed: timetableSpeedInput.trim() === "",
  issuedByName: issuedByName.trim() === "",
};

setMainErrors(errors);

const hasMainError = Object.values(errors).some((value) => value);

if (hasMainError) {
  setIsGenerating(false);
  return;
}
  if (!parsedSummary) {
    alert("Bitte zuerst eine Wagenliste hochladen.");
    setIsGenerating(false);
    return;
  }

  const locoBrakeWeight = determineLocoBrakeWeight(
  activeLok,
  parsedSummary.totalWeightTons,
  parsedSummary.totalLengthMeters,
  mode
);

const totalWeight =
  parsedSummary.totalWeightTons + activeLok.weightTons;

const totalBrakeWeight =
  parsedSummary.totalBrakeWeightTons + locoBrakeWeight;

const totalAxles =
  parsedSummary.totalAxles + activeLok.axles;

const totalLength =
  Math.ceil(parsedSummary.totalLengthMeters + activeLok.lengthMeters);

  const availableBrakePercentage =
  totalWeight > 0
    ? Math.floor((totalBrakeWeight * 100) / totalWeight)
    : 0;

    const minimum = Number(minimumBrakePercentageInput) || 0;

    const missingBrakePercentage =
  availableBrakePercentage < minimum
    ? minimum - availableBrakePercentage
    : 0;

    const timetableSpeed = Number(timetableSpeedInput) || 0;

const lokTooSlow =
  timetableSpeed > 0 && activeLok.vmax < timetableSpeed;

  const wagonTooSlow =
  timetableSpeed > 0 &&
  parsedSummary.lowerSpeedKmh !== null &&
  parsedSummary.lowerSpeedKmh < timetableSpeed;

  const state = {
    date: new Date().toLocaleDateString("de-DE"),
    trainNumber: parsedSummary.trainNumber,
    departureStation: parsedSummary.departureStation,
    zugStart,
    directionChange,
    directionChangeStation: directionStation,
    firstVehicleNumber: parsedSummary.firstVehicleNumber,
    firstBrakeWeight: parsedSummary.firstBrakeWeight,
    lokVmax: activeLok.vmax,
    fahrplanVmax: Number(timetableSpeedInput) || 0,

    wagonWeightTons: String(parsedSummary.totalWeightTons),
    locoWeightTons: String(activeLok.weightTons),
    totalWeightTons: String(totalWeight),

    wagonBrakeWeightTons: String(parsedSummary.totalBrakeWeightTons),
    locoBrakeWeightTons: String(locoBrakeWeight),
    totalBrakeWeightTons: String(totalBrakeWeight),

    wagonAxles: String(parsedSummary.totalAxles),
    locoAxles: String(activeLok.axles),
    totalAxles: String(totalAxles),

    minimumBrakePercentage: String(minimum),
    availableBrakePercentage: String(availableBrakePercentage),
    missingBrakePercentage: missingBrakePercentage > 0 ? String(missingBrakePercentage) : "",

    lastVehicleNumber: parsedSummary.lastVehicleNumber,
    multiReleaseBrakeCount: String(parsedSummary.multiReleaseBrakeCount),
    kLllBrakeCount: String(parsedSummary.kLllBrakeCount),

    wagonLengthMeters: String(Math.ceil(parsedSummary.totalLengthMeters)),
    locoLengthMeters: String(activeLok.lengthMeters),
    totalLengthMeters: String(totalLength),

    speedCheckNo: wagonTooSlow,
    lowerSpeedKmh: wagonTooSlow ? String(parsedSummary.lowerSpeedKmh ?? "") : "",

    dangerousGoodsPresent: parsedSummary.dangerousGoodsPresent,
    issuedByName,
  };

  // ❗ Richtungswechsel-Block
if (directionChange && directionStation.trim() !== "") {
  const wagonWeight = parsedSummary.totalWeightTons;

  if (wagonWeight >= 1200) {
    setWarningItems([
      "Achtung! Richtungswechsel unzulässig! Wagenzuggewicht größer 1200T. Neue Wagenliste erforderlich!"
    ]);
    setPendingPdfState(null);
    setWarningCanContinue(false);
    setWarningOpen(true);
    setIsGenerating(false);
    return;
  }

  if ((parsedSummary.firstBrakeWeight || 0) === 0) {
    setWarningItems([
      "Richtungswechsel nicht zulässig: erster Wagen hat keine wirkende Druckluftbremse. Somit hätte das letzte Fahrzeug nach dem Richtungswechsel keine wirkende Druckluftbremse!"
    ]);
    setPendingPdfState(null);
    setWarningCanContinue(false);
    setWarningOpen(true);
    setIsGenerating(false);
    return;
  }
}
  
  const warnings: string[] = [];

if (missingBrakePercentage > 0) {
  warnings.push(
    `Achtung! Mindestbremshundertstel nicht erreicht. Es fehlen ${missingBrakePercentage} Bremshundertstel. Kontaktaufnahme mit betriebsleitender Stelle erforderlich!`
  );
}

if (lokTooSlow) {
  warnings.push(
    `Achtung! Die gewählte Lok darf nur ${activeLok.vmax} km/h fahren. Die Fahrplangeschwindigkeit beträgt jedoch ${timetableSpeed} km/h. Kontaktaufnahme mit betriebsleitender Stelle erforderlich!`
  );
}

if (wagonTooSlow) {
  warnings.push(
    `Achtung! Im Wagenzug läuft ein Fahrzeug, das nur mit ${parsedSummary.lowerSpeedKmh} km/h verkehren darf. Kontaktaufnahme mit betriebsleitender Stelle erforderlich!`
  );
}

if (warnings.length > 0) {
  setWarningItems(warnings);
  setPendingPdfState(state);
  setWarningCanContinue(true);
  setWarningOpen(true);
  setIsGenerating(false);
  return;
}

  if (directionChange && directionStation.trim() !== "") {
    const reversedState = {
      ...state,
      departureStation: directionStation,
      lastVehicleNumber: state.firstVehicleNumber,
    };

    await createPdf(state, reversedState);
    setIsGenerating(false);
  } else {
    await createPdf(state);
    setIsGenerating(false);
  }
}

async function confirmWarningAndGeneratePdf() {
  setWarningOpen(false);

  if (!pendingPdfState) return;

  if (
  pendingPdfState.directionChange &&
  pendingPdfState.directionChangeStation.trim() !== ""
) {
  const reversedState = {
    ...pendingPdfState,
    departureStation: pendingPdfState.directionChangeStation,
    lastVehicleNumber: pendingPdfState.firstVehicleNumber,
  };

    await createPdf(pendingPdfState, reversedState);
  } else {
    await createPdf(pendingPdfState);
  }

  setPendingPdfState(null);
  setWarningItems([]);
}
  return (
    <div className="app">
      <div className="header-card">
        <div className="header-row">
          <img src="/header-icon.png" className="header-icon" />
          <div className="header-text">
            <h1>BREZEL-Master</h1>
            <p>by Jonas Gießmann | Version 3.0</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span className="icon">📄</span>
          Wagenliste hochladen
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfSelection}
          style={{ display: "none" }}
        />

        <button
  className="primary"
  onClick={() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedPdfName("");
    setPdfStatus("idle");
    fileInputRef.current?.click();
  }}
>
  Wagenliste hochladen
</button>

        <div
  className={`status ${
    pdfStatus === "success"
      ? "success"
      : pdfStatus === "loading"
      ? "loading"
      : "error"
  }`}
>
  {pdfStatus === "idle" && "✖ Keine Wagenliste ausgewählt"}
  {pdfStatus === "loading" && "⏳ Wagenliste wird gelesen"}
  {pdfStatus === "success" && "✔ Datei erfolgreich geladen und bereit zur Verarbeitung"}

  {selectedPdfName && (
    <div style={{ marginTop: 6, fontSize: 13 }}>
      {selectedPdfName}
    </div>
  )}
</div>
      </div>

      <div className="card">
        <div className="card-title">
          <span className="icon">🚆</span>
          Lok wählen
        </div>

        <div className="lok-row">
          <button
  type="button"
  className={`lok-box ${selectedLok === "list" ? "active" : ""}`}
  onClick={() => {
    setSelectedLok("list");
    setLokSelectOpen(true);
  }}
>
  Lok aus Liste
  <span>Aktuell: {selectedLokName}</span>
</button>

          <button
  type="button"
  className={`lok-box ${selectedLok === "custom" ? "active" : ""}`}
  onClick={() => {
    setSelectedLok("custom");
    setCustomLokOpen(true);
  }}
>
  Eigene Lok
  <span>{customLokName || "Manuell eingeben"}</span>
</button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <strong>Zuganfangsbahnhof</strong>
            <div className="sub">Steht der Zug am Anfangsbahnhof?</div>
          </div>

          <div className="switch">
            <div
              className={`toggle ${zugStart ? "active" : ""}`}
              onClick={() => setZugStart(!zugStart)}
            />
          </div>
        </div>

        <div className="divider" />

        <div className="row">
          <div>
            <strong>Richtungswechsel</strong>
            <div className="sub">Ist ein Richtungswechsel vorhanden?</div>
          </div>

          <div className="switch switch-with-text">
  {directionChange && directionStation.trim() !== "" && (
    <span className="switch-value">{directionStation}</span>
  )}

  <div
    className={`toggle ${directionChange ? "active" : ""}`}
    onClick={() => {
      const newValue = !directionChange;
      setDirectionChange(newValue);

      if (newValue) {
        setDirectionModalOpen(true);
      } else {
        setDirectionStation("");
      }
    }}
  />
</div>
        </div>

        <div className="divider" />

        <div className="row">
          <div>
            <strong>Bremsstellung</strong>
            <div className="sub">Bremsstellung gemäß Fahrplan</div>
          </div>

          <div className="toggle-group">
            <button
              className={mode === "P" ? "active" : ""}
              onClick={() => setMode("P")}
            >
              P
            </button>
            <button
              className={mode === "G" ? "active" : ""}
              onClick={() => setMode("G")}
            >
              G
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span className="icon">✏️</span>
          Eingaben
        </div>

        <div className="input-row">
          <label>Mindestbremshundertstel</label>
          <div className="input">
            <input
  type="number"
  value={minimumBrakePercentageInput}
  onChange={(e) => setMinimumBrakePercentageInput(e.target.value)}
  className={mainErrors.minimumBrakePercentage ? "input-error" : ""}
/>
            <span>%</span>
          </div>
        </div>

        <div className="input-row">
          <label>Fahrplangeschwindigkeit</label>
          <div className="input">
            <input
  type="number"
  value={timetableSpeedInput}
  onChange={(e) => setTimetableSpeedInput(e.target.value)}
  className={mainErrors.timetableSpeed ? "input-error" : ""}
/>
            <span>km/h</span>
          </div>
        </div>

        <div className="input-row">
  <label>Name</label>

  <div className="input">
    <input
      type="text"
      value={issuedByName}
      onChange={(e) => {
        setIssuedByName(e.target.value);
        localStorage.setItem("issuedByName", e.target.value);
      }}
      className={mainErrors.issuedByName ? "input-error" : ""}
    />
    <span>Tf</span>
  </div>
</div>


      <button
  className="generate"
  onClick={handleGeneratePdf}
  disabled={isGenerating}
>
  {isGenerating ? (
    <span className="loading-content">
      <span className="spinner" />
      PDF wird erstellt...
    </span>
  ) : (
    "Bremszettel generieren"
  )}
</button>

      </div> 
      
       <div className="ready help-center">
  <strong className="help-title">💡 Brauchst du Hilfe?</strong>

  <div className="help-links">
    <a
      href="/anleitung.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="help-link"
    >
      Anleitung
    </a>

    <a
      href="/faq.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="help-link"
    >
      FAQ
    </a>
  </div>
</div>

      {lokSelectOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Lok auswählen</h2>

      <div className="lok-list">
        {locomotives.map((lok) => (
          <button
            key={lok.name}
            type="button"
            onClick={() => setSelectedLokName(lok.name)}
            className={selectedLokName === lok.name ? "lok-list-button active" : "lok-list-button"}
          >
            {lok.name}
          </button>
        ))}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="primary"
          onClick={() => setLokSelectOpen(false)}
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
)}
{customLokOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Eigene Lok</h2>

      <div className="lok-list">
        <input
  type="text"
  placeholder="Lokbezeichnung"
  value={customLokName}
  onChange={(e) => setCustomLokName(e.target.value)}
  className={customErrors.name ? "input-error" : ""}
/>

        <input
          type="number"
          placeholder="Gewicht [t]"
          value={customLokWeight}
          onChange={(e) => setCustomLokWeight(e.target.value)}
          className={customErrors.weight ? "input-error" : ""}
        />

        <input
          type="number"
          placeholder="Bremsgewicht P [t]"
          value={customLokBrakeP}
          onChange={(e) => setCustomLokBrakeP(e.target.value)}
          className={customErrors.brakeP ? "input-error" : ""}
        />

        <input
          type="number"
          placeholder="Bremsgewicht G [t]"
          value={customLokBrakeG}
          onChange={(e) => setCustomLokBrakeG(e.target.value)}
          className={customErrors.brakeG ? "input-error" : ""}
        />

        <input
          type="number"
          placeholder="Länge [m]"
          value={customLokLength}
          onChange={(e) => setCustomLokLength(e.target.value)}
          className={customErrors.length ? "input-error" : ""}
        />

        <input
          type="number"
          placeholder="Achsenzahl"
          value={customLokAxles}
          onChange={(e) => setCustomLokAxles(e.target.value)}
          className={customErrors.axles ? "input-error" : ""}
        />

        <input
          type="number"
          placeholder="Zul. Höchstgeschwindigkeit [km/h]"
          value={customLokVmax}
          onChange={(e) => setCustomLokVmax(e.target.value)}
          className={customErrors.vmax ? "input-error" : ""}
        />
      </div>

      <div className="modal-actions">
  <button
    type="button"
    className="secondary"
    onClick={() => setCustomLokOpen(false)}
  >
    Zurück
  </button>

  <button
    type="button"
    className="primary"
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
  >
    Anwenden
  </button>
</div>
    </div>
  </div>
)}

  {directionModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Betriebsstelle</h2>

      <div className="lok-list">
        <input
          type="text"
          placeholder="z.B. Bruchsal"
          value={directionStation}
          onChange={(e) => { setDirectionStation(e.target.value);
          setDirectionError(false);
          }}
          className={directionError ? "input-error" : ""}
        />
      </div>

      <div className="modal-actions">
  <button
    type="button"
    className="secondary"
    onClick={() => {
      setDirectionChange(false);
      setDirectionModalOpen(false);
      setDirectionStation("");
      setDirectionError(false);
    }}
  >
    Zurück
  </button>

  <button
    type="button"
    className="primary"
    onClick={() => {
      if (directionStation.trim() === "") {
  setDirectionError(true);
  return;
}

      setDirectionModalOpen(false);
    }}
  >
    Anwenden
  </button>
</div>
    </div>
  </div>
)}

{warningOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Achtung</h2>

      <div className="warning-list">
  {warningItems.map((item, index) => {
    let formatted = item;

    formatted = formatted.replace(
      /(\d+\s+Bremshundertstel)/g,
      '<span class="warning-value">$1</span>'
    );

    formatted = formatted.replace(
      /(\d+\s*km\/h)/g,
      '<span class="warning-value">$1</span>'
    );

    return (
      <div
        key={index}
        className="warning-item"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  })}
</div>

       <div className="modal-actions">
  {warningCanContinue ? (
    <button
      type="button"
      className="primary"
      onClick={confirmWarningAndGeneratePdf}
    >
      Trotzdem fortfahren
    </button>
  ) : (
    <button
      type="button"
      className="primary"
      onClick={() => {
        setWarningOpen(false);
        setWarningItems([]);
      }}
    >
      OK
    </button>
  )}
</div>
    </div>
  </div>
)}

    </div>
  );
}

export default App;