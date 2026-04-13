import { useEffect, useRef, useState } from "react";
import { createPdf } from "./pdfUtils";
import { extractPdfText, parseTrainCheckerText, type ParsedSummary } from "./parser";
type InternationalCountry = {
  code: string;
  label: string;
};

function formatVehicleNumberInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);

  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 4);
  const part3 = digits.slice(4, 8);
  const part4 = digits.slice(8, 11);
  const part5 = digits.slice(11, 12);

  let formatted = part1;

  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += ` ${part3}`;
  if (part4) formatted += ` ${part4}`;
  if (part5) formatted += `-${part5}`;

  return formatted;
}

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [legalNoticeOpen, setLegalNoticeOpen] = useState(false);
const [dontShowLegalNoticeAgain, setDontShowLegalNoticeAgain] = useState(false);
const [appReady, setAppReady] = useState(false);

const [addLocoAtStation, setAddLocoAtStation] = useState(false);
const [addLocoModalOpen, setAddLocoModalOpen] = useState(false);

const [addLocoStation, setAddLocoStation] = useState("");

const [addedLocoSelectedType, setAddedLocoSelectedType] = useState<"list" | "custom">("list");
const [addedLocoSelectedName, setAddedLocoSelectedName] = useState("G1206");
const [addedLocoSelectOpen, setAddedLocoSelectOpen] = useState(false);
const [addedLokSearch, setAddedLokSearch] = useState("");
const [addedCustomLocoOpen, setAddedCustomLocoOpen] = useState(false);

const [addedLocoVehicleNumber, setAddedLocoVehicleNumber] = useState("");
const [addedLocoInsertPosition, setAddedLocoInsertPosition] = useState<"1" | "2" | "">("");
const [addedLocoSoleType, setAddedLocoSoleType] = useState<
  "F" | "D" | "L" | "LL" | "K" | ""
>("");

const [addedCustomLocoName, setAddedCustomLocoName] = useState("");
const [addedCustomLocoWeight, setAddedCustomLocoWeight] = useState("");
const [addedCustomLocoBrakeP, setAddedCustomLocoBrakeP] = useState("");
const [addedCustomLocoBrakeG, setAddedCustomLocoBrakeG] = useState("");
const [addedCustomLocoLength, setAddedCustomLocoLength] = useState("");
const [addedCustomLocoVmax, setAddedCustomLocoVmax] = useState("");
const [addedCustomLocoAxles, setAddedCustomLocoAxles] = useState("");
const [addedCustomLocoFestKn, setAddedCustomLocoFestKn] = useState("");

const [addLocoModalError, setAddLocoModalError] = useState(false);
  const [zugStart, setZugStart] = useState(true);
  const [doubleTraction, setDoubleTraction] = useState(false);
  const [directionChange, setDirectionChange] = useState(false);
  const [secondLocoEnabled, setSecondLocoEnabled] = useState<null | boolean>(null);
const [secondLokSelectOpen, setSecondLokSelectOpen] = useState(false);
const [secondLokSearch, setSecondLokSearch] = useState("");
const [secondCustomLokOpen, setSecondCustomLokOpen] = useState(false);
const [secondSelectedLok, setSecondSelectedLok] = useState<"list" | "custom">("list");
const [secondSelectedLokName, setSecondSelectedLokName] = useState("G1206");

const [secondCustomLokName, setSecondCustomLokName] = useState("");
const [secondLocoVehicleNumber, setSecondLocoVehicleNumber] = useState("");
const [secondLocoSoleType, setSecondLocoSoleType] = useState<
  "F" | "D" | "L" | "LL" | "K" | ""
>("");
const [secondCustomLokWeight, setSecondCustomLokWeight] = useState("");
const [secondCustomLokBrakeP, setSecondCustomLokBrakeP] = useState("");
const [secondCustomLokBrakeG, setSecondCustomLokBrakeG] = useState("");
const [secondCustomLokLength, setSecondCustomLokLength] = useState("");
const [secondCustomLokVmax, setSecondCustomLokVmax] = useState("");
const [secondCustomLokAxles, setSecondCustomLokAxles] = useState("");
  const [mode, setMode] = useState<"P" | "G">("P");
  const [printMode, setPrintMode] = useState<"national" | "international">("national");
  const [internationalModalOpen, setInternationalModalOpen] = useState(false);

  const [doubleTractionModalOpen, setDoubleTractionModalOpen] = useState(false);
const [doubleTractionSecondVehicleNumber, setDoubleTractionSecondVehicleNumber] = useState("");
const [doubleTractionSecondSoleType, setDoubleTractionSecondSoleType] = useState<
  "F" | "D" | "L" | "LL" | "K" | ""
>("");
const [doubleTractionModalError, setDoubleTractionModalError] = useState(false);
const [doubleTractionDropOff, setDoubleTractionDropOff] = useState<null | boolean>(null);
const [doubleTractionDropOffStation, setDoubleTractionDropOffStation] = useState("");
const [doubleTractionRemovedLoco, setDoubleTractionRemovedLoco] = useState<"loco1" | "loco2" | "">("");

const [secondLocoInsertPosition, setSecondLocoInsertPosition] = useState<"1" | "2" | "">("");
const [secondLocoInsertPositionError, setSecondLocoInsertPositionError] = useState(false);

  const [locoVehicleNumber, setLocoVehicleNumber] = useState("");

  const [selectedCountries, setSelectedCountries] = useState<InternationalCountry[]>([]);

  const [locoSoleType, setLocoSoleType] = useState<
  "F" | "D" | "L" | "LL" | "K" | ""
  >("");

  const [etcsEnabled, setEtcsEnabled] = useState<null | boolean>(null);
const [etcsLevel, setEtcsLevel] = useState<"L0" | "L1" | "L2" | "L3" | "">("");
const [wasteTransportPresent, setWasteTransportPresent] = useState<null | boolean>(null);
const [exceptionalConsignment, setExceptionalConsignment] = useState<null | boolean>(null);
const [bzaNumber, setBzaNumber] = useState("");
const [remarksDuringTrip, setRemarksDuringTrip] = useState("");
const [trainSpecialties, setTrainSpecialties] = useState("");
const [additionalRestrictionDocs, setAdditionalRestrictionDocs] = useState<null | boolean>(null);
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success">("idle");
  const [selectedLokName, setSelectedLokName] = useState("G1206");
  const [lokSelectOpen, setLokSelectOpen] = useState(false);
  const [lokSearch, setLokSearch] = useState("");
  const locomotives = [
  {
    name: "G1206",
    weightTons: 88,
    brakeWeightP: 88,
    brakeWeightG: 75,
    brakeWeightPE: 0,
    lengthMeters: 15,
    vmax: 100,
    axles: 4,
    festKn: 41,
  },
  {
    name: "G1203",
    weightTons: 72,
    brakeWeightP: 66,
    brakeWeightG: 53,
    brakeWeightPE: 0,
    lengthMeters: 13,
    vmax: 60,
    axles: 4,
    festKn: 41,
  },
  {
    name: "V100",
    weightTons: 62,
    brakeWeightP: 65,
    brakeWeightG: 57,
    brakeWeightPE: 0,
    lengthMeters: 13,
    vmax: 100,
    axles: 4,
    festKn: 41,
  },
  {
    name: "DE18",
    weightTons: 90,
    brakeWeightP: 106,
    brakeWeightG: 86,
    brakeWeightPE: 0,
    lengthMeters: 17,
    vmax: 120,
    axles: 4,
    festKn: 41,
  },
  {
    name: "BR193",
    weightTons: 90,
    brakeWeightP: 95,
    brakeWeightG: 72,
    brakeWeightPE: 105,
    lengthMeters: 19,
    vmax: 160,
    axles: 4,
    festKn: 56,
  },
  {
    name: "BR151",
    weightTons: 118,
    brakeWeightP: 105,
    brakeWeightG: 90,
    brakeWeightPE: 0,
    lengthMeters: 20,
    vmax: 120,
    axles: 6,
    festKn: 30,
  },
  {
    name: "BR185",
    weightTons: 86,
    brakeWeightP: 90,
    brakeWeightG: 77,
    brakeWeightPE: 105,
    lengthMeters: 19,
    vmax: 140,
    axles: 4,
    festKn: 46,
  },
  {
    name: "BR143",
    weightTons: 83,
    brakeWeightP: 85,
    brakeWeightG: 80,
    brakeWeightPE: 102,
    lengthMeters: 17,
    vmax: 120,
    axles: 4,
    festKn: 30,
  },
  {
    name: "BR152",
    weightTons: 87,
    brakeWeightP: 103,
    brakeWeightG: 90,
    brakeWeightPE: 0,
    lengthMeters: 20,
    vmax: 140,
    axles: 4,
    festKn: 45,
  },
  {
    name: "BR145",
    weightTons: 80,
    brakeWeightP: 90,
    brakeWeightG: 83,
    brakeWeightPE: 105,
    lengthMeters: 19,
    vmax: 140,
    axles: 4,
    festKn: 60,
  },
  {
    name: "BR189",
    weightTons: 87,
    brakeWeightP: 93,
    brakeWeightG: 79,
    brakeWeightPE: 107,
    lengthMeters: 20,
    vmax: 140,
    axles: 4,
    festKn: 46,
  },
  {
    name: "BR363",
    weightTons: 54,
    brakeWeightP: 56,
    brakeWeightG: 33,
    brakeWeightPE: 0,
    lengthMeters: 11,
    vmax: 60,
    axles: 3,
    festKn: 20,
  },
  {
    name: "BR294",
    weightTons: 80,
    brakeWeightP: 88,
    brakeWeightG: 47,
    brakeWeightPE: 0,
    lengthMeters: 15,
    vmax: 80,
    axles: 4,
    festKn: 47,
  },
  {
    name: "BR187",
    weightTons: 84,
    brakeWeightP: 97,
    brakeWeightG: 78,
    brakeWeightPE: 0,
    lengthMeters: 19,
    vmax: 140,
    axles: 4,
    festKn: 46,
  },
  {
    name: "BR146",
    weightTons: 84,
    brakeWeightP: 90,
    brakeWeightG: 74,
    brakeWeightPE: 100,
    lengthMeters: 19,
    vmax: 160,
    axles: 4,
    festKn: 54,
  },
  {
    name: "BR155",
    weightTons: 123,
    brakeWeightP: 124,
    brakeWeightG: 106,
    brakeWeightPE: 0,
    lengthMeters: 20,
    vmax: 125,
    axles: 6,
    festKn: 50,
  },
  {
    name: "BR182",
    weightTons: 86,
    brakeWeightP: 67,
    brakeWeightG: 67,
    brakeWeightPE: 100,
    lengthMeters: 20,
    vmax: 230,
    axles: 4,
    festKn: 25,
  },
  {
    name: "ÖBB2016",
    weightTons: 80,
    brakeWeightP: 72,
    brakeWeightG: 65,
    brakeWeightPE: 0,
    lengthMeters: 20,
    vmax: 140,
    axles: 4,
    festKn: 20,
  },
  {
    name: "BR261",
    weightTons: 80,
    brakeWeightP: 84,
    brakeWeightG: 70,
    brakeWeightPE: 0,
    lengthMeters: 16,
    vmax: 100,
    axles: 4,
    festKn: 43,
  },
  {
    name: "BR218",
    weightTons: 78,
    brakeWeightP: 70,
    brakeWeightG: 53,
    brakeWeightPE: 0,
    lengthMeters: 17,
    vmax: 140,
    axles: 4,
    festKn: 40,
  },
  {
    name: "G6(80)",
    weightTons: 60,
    brakeWeightP: 66,
    brakeWeightG: 63,
    brakeWeightPE: 0,
    lengthMeters: 11,
    vmax: 80,
    axles: 3,
    festKn: 35,
  },
  {
    name: "V200",
    weightTons: 79,
    brakeWeightP: 74,
    brakeWeightG: 58,
    brakeWeightPE: 0,
    lengthMeters: 19,
    vmax: 140,
    axles: 4,
    festKn: 40,
  },
  {
    name: "BR159",
    weightTons: 123,
    brakeWeightP: 142,
    brakeWeightG: 118,
    brakeWeightPE: 0,
    lengthMeters: 24,
    vmax: 120,
    axles: 6,
    festKn: 50,
  },
];
const [customLokOpen, setCustomLokOpen] = useState(false);
const [nationalDoubleTractionDropOff, setNationalDoubleTractionDropOff] = useState(false);
const [nationalDropOffStation, setNationalDropOffStation] = useState("");
const [secondLocoModalError, setSecondLocoModalError] = useState(false);
const [internationalModalError, setInternationalModalError] = useState(false);

const [customLokName, setCustomLokName] = useState("");
const [customLokWeight, setCustomLokWeight] = useState("");
const [customLokBrakeP, setCustomLokBrakeP] = useState("");
const [customLokBrakeG, setCustomLokBrakeG] = useState("");
const [customLokLength, setCustomLokLength] = useState("");
const [customLokVmax, setCustomLokVmax] = useState("");
const [customLokAxles, setCustomLokAxles] = useState("");
const [customLokFestKn, setCustomLokFestKn] = useState("");
const [secondCustomLokFestKn, setSecondCustomLokFestKn] = useState("");
const [directionModalOpen, setDirectionModalOpen] = useState(false);
const [customLokBrakePE, setCustomLokBrakePE] = useState("");
const [dynamicBrakeModalOpen, setDynamicBrakeModalOpen] = useState(false);
const [dynamicBrakeEffective, setDynamicBrakeEffective] = useState<boolean | null>(null);
const [secondCustomLokBrakePE, setSecondCustomLokBrakePE] = useState("");
const [secondDynamicBrakeModalOpen, setSecondDynamicBrakeModalOpen] = useState(false);
const [secondDynamicBrakeEffective, setSecondDynamicBrakeEffective] = useState<boolean | null>(null);
const [freinageForfaitaire, setFreinageForfaitaire] = useState<null | boolean>(null);

const [addedCustomLocoBrakePE, setAddedCustomLocoBrakePE] = useState("");
const [addedDynamicBrakeModalOpen, setAddedDynamicBrakeModalOpen] = useState(false);
const [addedDynamicBrakeEffective, setAddedDynamicBrakeEffective] = useState<boolean | null>(null);

const [reduceToOneLocoAfterDirectionChange, setReduceToOneLocoAfterDirectionChange] = useState(false);
const [removedLocoAfterDirectionChange, setRemovedLocoAfterDirectionChange] = useState<"loco1" | "loco2" | "">("");



const [directionStation, setDirectionStation] = useState("");
const [keepDoubleTractionAfterDirectionChange, setKeepDoubleTractionAfterDirectionChange] = useState<boolean | null>(null);
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
const [issuerEvu, setIssuerEvu] = useState(
  localStorage.getItem("issuerEvu") || ""
);
useEffect(() => {
  localStorage.setItem("issuerEvu", issuerEvu);
}, [issuerEvu]);

useEffect(() => {
  const timer = window.setTimeout(() => {
    setAppReady(true);

    const hideNotice = localStorage.getItem("hideLegalNotice");
    if (hideNotice !== "true") {
      setLegalNoticeOpen(true);
    }
  }, 1200);

  return () => window.clearTimeout(timer);
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

const [secondCustomErrors, setSecondCustomErrors] = useState({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});

const [addedCustomErrors, setAddedCustomErrors] = useState({
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

function hasAtLeastFourActiveWagonBrakes(parsedSummary: ParsedSummary | null): boolean {
  if (!parsedSummary) return false;
  return parsedSummary.multiReleaseBrakeCount >= 4;
}

function getGermanyBaseTrainCategory(parsedSummary: ParsedSummary | null): "P" | "G" | "M" {
  if (!parsedSummary) return "P";

  if (parsedSummary.hasOnlyGBrakes) {
    return "G";
  }

  if (parsedSummary.hasMixedBrakeModes) {
    return "M";
  }

  return "P";
}

function hasGermanyDynamicBrakeE(
  dynamicBrakeEffective: boolean,
  secondDynamicBrakeEffective: boolean | null,
  doubleTraction: boolean
): boolean {
  // eine Lok
  if (!doubleTraction) {
    return dynamicBrakeEffective === true;
  }

  // zwei Loks -> beide müssen "Ja" sein
  return dynamicBrakeEffective === true && secondDynamicBrakeEffective === true;
}

function buildGermanyTrainCategory(
  parsedSummary: ParsedSummary | null,
  timetableSpeed: number,
  dynamicBrakeEffective: boolean,
  secondDynamicBrakeEffective: boolean | null,
  doubleTraction: boolean,
  missingBrakePercentage: number
): string {
  const baseCategory = getGermanyBaseTrainCategory(parsedSummary);

  const hasE = hasGermanyDynamicBrakeE(
    dynamicBrakeEffective,
    secondDynamicBrakeEffective,
    doubleTraction
  );

  const categoryPrefix = hasE ? `${baseCategory}E` : baseCategory;

  const adjustedSpeed = Math.max(0, timetableSpeed - missingBrakePercentage);

  return `${categoryPrefix}${adjustedSpeed}`;
}

function buildSwitzerlandTrainCategory(
  parsedSummary: ParsedSummary | null,
  availableBrakePercentage: number
): string {
  if (!parsedSummary) return "";

  const roundedBrake = Math.floor(availableBrakePercentage / 5) * 5;

  const routeClass = parsedSummary.highestRouteClass;

  const isDClass =
    routeClass === "D2" ||
    routeClass === "D3" ||
    routeClass === "D4";

  const prefix = isDClass ? "D" : "A";

  return `${prefix}${roundedBrake}`;
}

function buildFranceTrainCategory(
  brakePercentage: number,
  trainLength: number,
  freinageForfaitaire: boolean
): string | null {
  if (!freinageForfaitaire) {
    return null;
  }

  if (trainLength <= 800) {
    if (brakePercentage >= 57) return "MA100";
    if (brakePercentage >= 50) return "MA90";
    if (brakePercentage >= 47) return "MA80";
  }

  if (trainLength <= 900) {
    if (brakePercentage >= 64) return "MA100";
    if (brakePercentage >= 57) return "MA90";
    if (brakePercentage >= 55) return "MA80";
  }

  if (trainLength <= 1000) {
    if (brakePercentage >= 69) return "MA100";
    if (brakePercentage >= 61) return "MA90";
    if (brakePercentage >= 59) return "MA80";
  }

  return "";
}

function buildAustriaTrainCategory(
  parsedSummary: ParsedSummary | null
): string {
  if (!parsedSummary) return "";

  if (parsedSummary.hasOnlyPBrakes) {
    return "P";
  }

  if (parsedSummary.hasOnlyGBrakes) {
    return "G";
  }

  if (parsedSummary.hasMixedBrakeModes) {
    return "Misch";
  }

  return "";
}

function handleSelectMainLokFromList(lokName: string) {
  setSelectedLokName(lokName);

  const lok = locomotives.find((item) => item.name === lokName);

  if (lok && Number(lok.brakeWeightPE || 0) > 0) {
    setDynamicBrakeEffective(null);
    setDynamicBrakeModalOpen(true);
  } else {
    setDynamicBrakeEffective(false);
  }
}

function handleSelectSecondLokFromList(lokName: string) {
  setSecondSelectedLok("list");
  setSecondSelectedLokName(lokName);
  setSecondLokSelectOpen(false);

  const lok = locomotives.find((item) => item.name === lokName);

  if (lok && Number(lok.brakeWeightPE || 0) > 0) {
    setSecondDynamicBrakeEffective(null);
    setSecondDynamicBrakeModalOpen(true);
  } else {
    setSecondDynamicBrakeEffective(false);
  }
}

function handleSelectAddedLokFromList(lokName: string) {
  setAddedLocoSelectedType("list");
  setAddedLocoSelectedName(lokName);
  setAddedLocoSelectOpen(false);

  const lok = locomotives.find((item) => item.name === lokName);

  if (lok && Number(lok.brakeWeightPE || 0) > 0) {
    setAddedDynamicBrakeEffective(null);
    setAddedDynamicBrakeModalOpen(true);
  } else {
    setAddedDynamicBrakeEffective(false);
  }
}

function determineLocoBrakeWeight(
  lok: {
    brakeWeightP: number;
    brakeWeightG: number;
    brakeWeightPE?: number;
  },
  wagonWeight: number,
  wagonLength: number,
  selectedMode: "P" | "G",
  dynamicBrakeEffective: boolean,
  hasFourActiveBrakes: boolean
): number {
  const canUseDynamicBrake =
    selectedMode === "P" &&
    dynamicBrakeEffective &&
    wagonWeight <= 800 &&
    hasFourActiveBrakes &&
    Number(lok.brakeWeightPE || 0) > 0;

  if (selectedMode === "P") {
    if (wagonWeight <= 800) {
      if (canUseDynamicBrake) {
        return Number(lok.brakeWeightPE || 0);
      }

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

function getDisplayedBrakeMode(
  lok: {
    brakeWeightPE?: number;
  } | null,
  selectedMode: "P" | "G",
  dynamicBrakeEffective: boolean,
  wagonWeight: number,
  hasFourActiveBrakes: boolean
): "P" | "G" | "P+E" {
  if (!lok) return selectedMode;

  const canUseDynamicBrake =
    selectedMode === "P" &&
    dynamicBrakeEffective &&
    wagonWeight <= 800 &&
    hasFourActiveBrakes &&
    Number(lok.brakeWeightPE || 0) > 0;

  if (canUseDynamicBrake) {
    return "P+E";
  }

  if (selectedMode === "P" && wagonWeight > 800) {
    return "G";
  }

  return selectedMode;
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
        brakeWeightPE: Number(customLokBrakePE) || 0,
        lengthMeters: Number(customLokLength) || 0,
        vmax: Number(customLokVmax) || 0,
        axles: Number(customLokAxles) || 0,
        festKn: Number(customLokFestKn) || 0,
      }
    : selectedListLok;

    const secondSelectedListLok =
  locomotives.find((lok) => lok.name === secondSelectedLokName) || locomotives[0];

const secondActiveLok =
  secondLocoEnabled !== true
    ? null
    : secondSelectedLok === "custom"
    ? {
        name: secondCustomLokName || "Eigene Lok 2",
        weightTons: Number(secondCustomLokWeight) || 0,
        brakeWeightP: Number(secondCustomLokBrakeP) || 0,
        brakeWeightG: Number(secondCustomLokBrakeG) || 0,
        brakeWeightPE: Number(secondCustomLokBrakePE) || 0,
        lengthMeters: Number(secondCustomLokLength) || 0,
        vmax: Number(secondCustomLokVmax) || 0,
        axles: Number(secondCustomLokAxles) || 0,
        festKn: Number(secondCustomLokFestKn) || 0,
      }
    : secondSelectedListLok;

    const tractionSecondLok =
  doubleTraction
    ? { ...activeLok }
    : secondActiveLok;

    const addedSelectedListLok =
  locomotives.find((lok) => lok.name === addedLocoSelectedName) || locomotives[0];

const addedActiveLok =
  !addLocoAtStation
    ? null
    : addedLocoSelectedType === "custom"
    ? {
        name: addedCustomLocoName || "Zusätzliche Lok",
        weightTons: Number(addedCustomLocoWeight) || 0,
        brakeWeightP: Number(addedCustomLocoBrakeP) || 0,
        brakeWeightG: Number(addedCustomLocoBrakeG) || 0,
        brakeWeightPE: Number(addedCustomLocoBrakePE) || 0,
        lengthMeters: Number(addedCustomLocoLength) || 0,
        vmax: Number(addedCustomLocoVmax) || 0,
        axles: Number(addedCustomLocoAxles) || 0,
        festKn: Number(addedCustomLocoFestKn) || 0,
      }
    : addedSelectedListLok;

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

  const hasFourActiveBrakes = hasAtLeastFourActiveWagonBrakes(parsedSummary);
  const firstLocoModeDisplay = getDisplayedBrakeMode(
  activeLok,
  mode,
  dynamicBrakeEffective === true,
  parsedSummary.totalWeightTons,
  hasFourActiveBrakes
);

const secondLocoModeDisplay = tractionSecondLok
  ? getDisplayedBrakeMode(
      tractionSecondLok,
      mode,
      doubleTraction
        ? dynamicBrakeEffective === true
        : secondDynamicBrakeEffective === true,
      parsedSummary.totalWeightTons,
      hasFourActiveBrakes
    )
  : mode;

const addedLocoModeDisplay = addedActiveLok
  ? getDisplayedBrakeMode(
      addedActiveLok,
      mode,
      addedDynamicBrakeEffective === true,
      parsedSummary.totalWeightTons,
      hasFourActiveBrakes
    )
  : mode;

const locoBrakeWeight = determineLocoBrakeWeight(
  activeLok,
  parsedSummary.totalWeightTons,
  parsedSummary.totalLengthMeters,
  mode,
  dynamicBrakeEffective === true,
  hasFourActiveBrakes
);

const secondLocoBrakeWeight =
  tractionSecondLok
    ? determineLocoBrakeWeight(
        tractionSecondLok,
        parsedSummary.totalWeightTons,
        parsedSummary.totalLengthMeters,
        mode,
        doubleTraction
          ? dynamicBrakeEffective === true
          : secondDynamicBrakeEffective === true,
        hasFourActiveBrakes
      )
    : 0;

const addedLocoBrakeWeight =
  addedActiveLok
    ? determineLocoBrakeWeight(
        addedActiveLok,
        parsedSummary.totalWeightTons,
        parsedSummary.totalLengthMeters,
        mode,
        addedDynamicBrakeEffective === true,
        hasFourActiveBrakes
      )
    : 0;
const addedLocoFestKn =
  addedActiveLok ? addedActiveLok.festKn || 0 : 0;



    const firstLocoStaysAfterDirectionChange =
  !(doubleTraction &&
    (
      (directionChange &&
        reduceToOneLocoAfterDirectionChange &&
        removedLocoAfterDirectionChange === "loco1") ||
      (doubleTractionDropOff === true &&
        doubleTractionRemovedLoco === "loco1")
    ));

const secondLocoStaysAfterDirectionChange =
  tractionSecondLok
    ? !(doubleTraction &&
        (
          (directionChange &&
            reduceToOneLocoAfterDirectionChange &&
            removedLocoAfterDirectionChange === "loco2") ||
          (doubleTractionDropOff === true &&
            doubleTractionRemovedLoco === "loco2")
        ))
    : false;

const totalWeight =
  parsedSummary.totalWeightTons +
  activeLok.weightTons +
  (doubleTraction && tractionSecondLok ? tractionSecondLok.weightTons : 0);

const totalBrakeWeight =
  parsedSummary.totalBrakeWeightTons +
  locoBrakeWeight +
  (doubleTraction && tractionSecondLok ? secondLocoBrakeWeight : 0);

const totalAxles =
  parsedSummary.totalAxles +
  activeLok.axles +
  (doubleTraction && tractionSecondLok ? tractionSecondLok.axles : 0);

const totalLength =
  Math.ceil(
    parsedSummary.totalLengthMeters +
    activeLok.lengthMeters +
    (doubleTraction && tractionSecondLok ? tractionSecondLok.lengthMeters : 0)
  );

    const useReducedDoubleTractionState =
  doubleTraction && doubleTractionDropOff === true && doubleTractionDropOffStation.trim() !== "";

  const directionChangeLocoCount = useReducedDoubleTractionState
  ? 1
  : (firstLocoStaysAfterDirectionChange ? 1 : 0) +
    (secondLocoStaysAfterDirectionChange ? 1 : 0);

const directionChangeLocoWeight = useReducedDoubleTractionState
  ? (doubleTractionRemovedLoco === "loco1"
      ? (tractionSecondLok ? tractionSecondLok.weightTons : 0)
      : activeLok.weightTons)
  : (firstLocoStaysAfterDirectionChange ? activeLok.weightTons : 0) +
    (secondLocoStaysAfterDirectionChange && tractionSecondLok ? tractionSecondLok.weightTons : 0);

const directionChangeLocoBrakeWeight = useReducedDoubleTractionState
  ? (doubleTractionRemovedLoco === "loco1"
      ? secondLocoBrakeWeight
      : locoBrakeWeight)
  : (firstLocoStaysAfterDirectionChange ? locoBrakeWeight : 0) +
    (secondLocoStaysAfterDirectionChange && tractionSecondLok ? secondLocoBrakeWeight : 0);

const directionChangeLocoLength = useReducedDoubleTractionState
  ? (doubleTractionRemovedLoco === "loco1"
      ? (tractionSecondLok ? tractionSecondLok.lengthMeters : 0)
      : activeLok.lengthMeters)
  : (firstLocoStaysAfterDirectionChange ? activeLok.lengthMeters : 0) +
    (secondLocoStaysAfterDirectionChange && tractionSecondLok ? tractionSecondLok.lengthMeters : 0);


const directionChangeTotalVehicleCount =
  parsedSummary.wagonCount + directionChangeLocoCount;

const directionChangeTotalLength =
  Math.ceil(parsedSummary.totalLengthMeters + directionChangeLocoLength);

const directionChangeTotalWeight =
  parsedSummary.totalWeightTons + directionChangeLocoWeight;

const directionChangeTotalBrakeWeight =
  parsedSummary.totalBrakeWeightTons + directionChangeLocoBrakeWeight;

  const availableBrakePercentage =
  totalWeight > 0
    ? Math.floor((totalBrakeWeight * 100) / totalWeight)
    : 0;

    const directionChangeAvailableBrakePercentage =
  directionChangeTotalWeight > 0
    ? Math.floor((directionChangeTotalBrakeWeight * 100) / directionChangeTotalWeight)
    : 0;

    const minimum = Number(minimumBrakePercentageInput) || 0;

    const missingBrakePercentage =
  availableBrakePercentage < minimum
    ? minimum - availableBrakePercentage
    : 0;

    const directionChangeMissingBrakePercentage =
  directionChangeAvailableBrakePercentage < minimum
    ? minimum - directionChangeAvailableBrakePercentage
    : 0;

    const timetableSpeed = Number(timetableSpeedInput) || 0;

    const germanyTrainCategory = buildGermanyTrainCategory(
  parsedSummary,
  timetableSpeed,
  dynamicBrakeEffective === true,
  doubleTraction ? dynamicBrakeEffective === true : secondDynamicBrakeEffective,
  doubleTraction,
  missingBrakePercentage
);
const germanyDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const luxembourgTrainCategory = buildGermanyTrainCategory(
  parsedSummary,
  timetableSpeed,
  dynamicBrakeEffective === true,
  doubleTraction ? dynamicBrakeEffective === true : secondDynamicBrakeEffective,
  doubleTraction,
  missingBrakePercentage
);
const luxembourgDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const austriaTrainCategory = buildAustriaTrainCategory(parsedSummary);
const austriaDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const polandTrainCategory = buildAustriaTrainCategory(parsedSummary);
const polandDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const belgiumTrainCategory = buildAustriaTrainCategory(parsedSummary);
const belgiumDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const czechTrainCategory = buildAustriaTrainCategory(parsedSummary);
const czechDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const denmarkTrainCategory = buildAustriaTrainCategory(parsedSummary);
const denmarkDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);
const netherlandsTrainCategory = buildAustriaTrainCategory(parsedSummary);
const netherlandsDisplayedVmax = Math.max(0, timetableSpeed - missingBrakePercentage);


const switzerlandTrainCategory = buildSwitzerlandTrainCategory(
  parsedSummary,
  availableBrakePercentage
);

const franceTrainCategory = buildFranceTrainCategory(
  availableBrakePercentage,
  totalLength,
  freinageForfaitaire === true
);
const franceDisplayedVmax =
  franceTrainCategory === "MA100"
    ? Math.min(timetableSpeed, 100)
    : franceTrainCategory === "MA90"
    ? Math.min(timetableSpeed, 90)
    : franceTrainCategory === "MA80"
    ? Math.min(timetableSpeed, 80)
    : "";

const lokTooSlow =
  timetableSpeed > 0 && activeLok.vmax < timetableSpeed;

  const wagonTooSlow =
  timetableSpeed > 0 &&
  parsedSummary.lowerSpeedKmh !== null &&
  parsedSummary.lowerSpeedKmh < timetableSpeed;

  const limitingVmaxCandidates: number[] = [];

if (lokTooSlow) {
  limitingVmaxCandidates.push(activeLok.vmax);
}

if (wagonTooSlow && parsedSummary.lowerSpeedKmh !== null) {
  limitingVmaxCandidates.push(parsedSummary.lowerSpeedKmh);
}

const limitingVmax =
  limitingVmaxCandidates.length > 0
    ? Math.min(...limitingVmaxCandidates)
    : null;

const vmaxRemark =
  limitingVmax !== null ? `Vmax ${limitingVmax} km/h beachten!` : "";

  const etcsDisplay = etcsEnabled ? etcsLevel : "";
const ntcDisplay = etcsEnabled === false || etcsEnabled === true ? "NTC" : "";

const locoFestKn = activeLok.festKn || 0;
const secondLocoFestKn = tractionSecondLok ? tractionSecondLok.festKn || 0 : 0;

const addLocoTotalVehicleCount =
  parsedSummary.wagonCount + 1 + (addedActiveLok ? 1 : 0);

const addLocoTotalLength =
  Math.ceil(
    parsedSummary.totalLengthMeters +
      activeLok.lengthMeters +
      (addedActiveLok ? addedActiveLok.lengthMeters : 0)
  );

const addLocoTotalWeight =
  parsedSummary.totalWeightTons +
  activeLok.weightTons +
  (addedActiveLok ? addedActiveLok.weightTons : 0);

const addLocoTotalBrakeWeight =
  parsedSummary.totalBrakeWeightTons +
  locoBrakeWeight +
  (addedActiveLok ? addedLocoBrakeWeight : 0);

const addLocoTotalAxles =
  parsedSummary.totalAxles +
  activeLok.axles +
  (addedActiveLok ? addedActiveLok.axles : 0);

const addLocoTotalFestKn =
  parsedSummary.totalFestKn +
  locoFestKn +
  (addedActiveLok ? addedLocoFestKn : 0);

    const addLocoAvailableBrakePercentage =
  addLocoTotalWeight > 0
    ? Math.floor((addLocoTotalBrakeWeight * 100) / addLocoTotalWeight)
    : 0;

    const addLocoMissingBrakePercentage =
  addLocoAvailableBrakePercentage < minimum
    ? minimum - addLocoAvailableBrakePercentage
    : 0;

const workingLocoWeightTons =
  activeLok.weightTons +
  (doubleTraction && tractionSecondLok ? tractionSecondLok.weightTons : 0);

const workingLocoLengthMeters =
  activeLok.lengthMeters +
  (doubleTraction && tractionSecondLok ? tractionSecondLok.lengthMeters : 0);

const workingLocoAxles =
  activeLok.axles +
  (doubleTraction && tractionSecondLok ? tractionSecondLok.axles : 0);

const workingLocoBrakeWeightTons =
  locoBrakeWeight +
  (doubleTraction && tractionSecondLok ? secondLocoBrakeWeight : 0);

const workingLocoFestKn =
  locoFestKn +
  (doubleTraction && tractionSecondLok ? secondLocoFestKn : 0);

const totalFestKn =
  parsedSummary.totalFestKn +
  locoFestKn +
  (doubleTraction && tractionSecondLok ? secondLocoFestKn : 0);

const directionChangeLocoFestKn = useReducedDoubleTractionState
  ? (doubleTractionRemovedLoco === "loco1"
      ? secondLocoFestKn
      : locoFestKn)
  : (firstLocoStaysAfterDirectionChange ? locoFestKn : 0) +
    (secondLocoStaysAfterDirectionChange && tractionSecondLok ? secondLocoFestKn : 0);

const directionChangeTotalFestKn =
  parsedSummary.totalFestKn + directionChangeLocoFestKn;

  let stateToGenerate: any = null;
let reversedStateToGenerate: any = null;

if (printMode === "international") {
  const internationalState = {
    issuerEvu,
   countries: selectedCountries.map((country) => ({
  ...country,
  trainCategory:
    country.code === "80"
      ? germanyTrainCategory
      : country.code === "82"
      ? luxembourgTrainCategory
      : country.code === "81"
      ? austriaTrainCategory
      : country.code === "51"
      ? polandTrainCategory
      : country.code === "88"
      ? belgiumTrainCategory
      : country.code === "54"
      ? czechTrainCategory
      : country.code === "86"
      ? denmarkTrainCategory
      : country.code === "84"
      ? netherlandsTrainCategory
      : country.code === "85"
      ? switzerlandTrainCategory
      : country.code === "87"
      ? franceTrainCategory || ""
      : country.code === "83"
      ? ""
      : "",
  vmax:
    country.code === "80"
      ? String(germanyDisplayedVmax)
      : country.code === "82"
      ? String(luxembourgDisplayedVmax)
      : country.code === "81"
      ? String(austriaDisplayedVmax)
      : country.code === "51"
      ? String(polandDisplayedVmax)
      : country.code === "88"
      ? String(belgiumDisplayedVmax)
      : country.code === "54"
      ? String(czechDisplayedVmax)
      : country.code === "86"
      ? String(denmarkDisplayedVmax)
      : country.code === "84"
      ? String(netherlandsDisplayedVmax)
      : country.code === "85"
      ? ""
      : country.code === "87"
      ? franceTrainCategory
        ? String(franceDisplayedVmax)
        : ""
      : country.code === "83"
      ? ""
      : timetableSpeedInput || "",
})),
    etcsDisplay,
    ntcDisplay,
    dangerousGoodsPresent: parsedSummary.dangerousGoodsPresent,
    wasteTransportPresent,
    exceptionalConsignment,
    doubleTraction,

    firstVehicleNumber: parsedSummary.firstVehicleNumber,
    lastVehicleNumber: parsedSummary.lastVehicleNumber,

    bzaNumber,
    remarksDuringTrip:
  doubleTraction && doubleTractionDropOff === true && doubleTractionDropOffStation.trim() !== ""
    ? `${remarksDuringTrip ? remarksDuringTrip + "\n" : ""}Doppeltraktion bis ${doubleTractionDropOffStation}`
    : remarksDuringTrip,
    vmaxRemark,
    addLocoBeforeStationRemark:
  addLocoAtStation && addLocoStation.trim() !== ""
    ? `Bis ${addLocoStation} mit nur einem Tfz an Spitze`
    : "",
    wagonAxlesRemark: `Anzahl Radsätze Wagenzug: ${parsedSummary.totalAxles}`,
    trainSpecialties,
    additionalRestrictionDocs,

    fSoleBrakeWeightTons:
      parsedSummary.fSoleBrakeWeightTons > 0
        ? String(parsedSummary.fSoleBrakeWeightTons)
        : "",

    locoVehicleNumber,
    locoName: activeLok.name,

    secondLocoFestKn: tractionSecondLok ? String(secondLocoFestKn) : "",
    secondLocoVehicleNumber: doubleTraction
  ? doubleTractionSecondVehicleNumber
  : secondLocoVehicleNumber,
    secondLocoName: tractionSecondLok ? tractionSecondLok.name : "",
    secondLocoAxles: tractionSecondLok ? String(tractionSecondLok.axles) : "",
    secondLocoLengthMeters: tractionSecondLok ? String(tractionSecondLok.lengthMeters) : "",
    secondLocoWeightTons: tractionSecondLok ? String(tractionSecondLok.weightTons) : "",
    secondLocoSoleType: doubleTraction
  ? doubleTractionSecondSoleType
  : secondLocoSoleType,
    secondLocoMode: secondLocoModeDisplay,
    secondLocoBrakeWeightTons: tractionSecondLok ? String(secondLocoBrakeWeight) : "",
    secondLocoInsertPosition,
    addLocoAtStation,
addLocoStation,
addedLocoVehicleNumber,
addedLocoSoleType,
addedLocoInsertPosition,
addedLocoName: addedActiveLok ? addedActiveLok.name : "",
addedLocoAxles: addedActiveLok ? String(addedActiveLok.axles) : "",
addedLocoLengthMeters: addedActiveLok ? String(addedActiveLok.lengthMeters) : "",
addedLocoWeightTons: addedActiveLok ? String(addedActiveLok.weightTons) : "",
addedLocoBrakeWeightTons: addedActiveLok ? String(addedLocoBrakeWeight) : "",
addedLocoMode: addedActiveLok ? addedLocoModeDisplay : "",
addedLocoFestKn: addedActiveLok ? String(addedLocoFestKn) : "",
addedLocoRemark:
  addLocoAtStation && addLocoStation.trim() !== "" && addedLocoInsertPosition === "1"
    ? `ab ${addLocoStation} Spitze`
    : addLocoAtStation && addLocoStation.trim() !== "" && addedLocoInsertPosition === "2"
    ? `ab ${addLocoStation}`
    : "",

    reduceToOneLocoAfterDirectionChange,
removedLocoAfterDirectionChange,
firstLocoRemark:
  doubleTraction &&
  doubleTractionDropOff === true &&
  doubleTractionRemovedLoco === "loco1" &&
  doubleTractionDropOffStation.trim() !== ""
    ? `bis ${doubleTractionDropOffStation}`
    : doubleTraction &&
      directionChange &&
      reduceToOneLocoAfterDirectionChange &&
      removedLocoAfterDirectionChange === "loco1" &&
      directionStation.trim() !== ""
    ? `nur bis ${directionStation}`
    : "",

secondLocoRemark:
  doubleTraction &&
  doubleTractionDropOff === true &&
  doubleTractionRemovedLoco === "loco2" &&
  doubleTractionDropOffStation.trim() !== ""
    ? `bis ${doubleTractionDropOffStation}`
    : doubleTraction &&
      directionChange &&
      reduceToOneLocoAfterDirectionChange &&
      removedLocoAfterDirectionChange === "loco2" &&
      directionStation.trim() !== ""
    ? `nur bis ${directionStation}`
    : doubleTraction && directionChange && directionStation.trim() !== ""
    ? `(ab ${directionStation} Spitze)`
    : !doubleTraction &&
      tractionSecondLok &&
      directionStation.trim() !== "" &&
      secondLocoInsertPosition === "1"
    ? `ab ${directionStation} Spitze`
    : !doubleTraction &&
      tractionSecondLok &&
      directionStation.trim() !== "" &&
      secondLocoInsertPosition === "2"
    ? `ab ${directionStation}`
    : "",

    locoSoleType,
    locoWeightTons: String(workingLocoWeightTons),
    locoLengthMeters: String(workingLocoLengthMeters),
    totalLengthMeters: String(totalLength),
    locoAxles: String(workingLocoAxles),
    locoBrakeWeightTons: String(workingLocoBrakeWeightTons),
    totalBrakeWeightTons: String(totalBrakeWeight),
    totalWeightTons: String(totalWeight),

    firstLocoVehicleNumber: locoVehicleNumber,
firstLocoName: activeLok.name,
firstLocoAxles: String(activeLok.axles),
firstLocoLengthMeters: String(activeLok.lengthMeters),
firstLocoWeightTons: String(activeLok.weightTons),
firstLocoSoleType: locoSoleType,
firstLocoMode: firstLocoModeDisplay,
firstLocoBrakeWeightTons: String(locoBrakeWeight),
firstLocoFestKn: String(locoFestKn),


    locoFestKn: String(workingLocoFestKn),
    totalFestKn: String(totalFestKn),
    directionChangeTotalFestKn: String(directionChangeTotalFestKn),

    wagonFestKn: String(parsedSummary.totalFestKn),
    directionChangeWagonFestKn: String(parsedSummary.totalFestKn),

    wagonCount: String(parsedSummary.wagonCount),
    totalVehicleCount: String(
      parsedSummary.wagonCount + 1 + (doubleTraction ? 1 : 0)
    ),
    workingLocoCount: String(1 + (doubleTraction ? 1 : 0)),

    wagonLengthMeters: String(Math.ceil(parsedSummary.totalLengthMeters)),
    wagonBrakeWeightTons: String(parsedSummary.totalBrakeWeightTons),
    wagonWeightTons: String(parsedSummary.totalWeightTons),

    directionChange,
    directionChangeStation: directionStation,
    doubleTractionDropOff,
doubleTractionDropOffStation,

    directionChangeLocoCount: String(directionChangeLocoCount),
    directionChangeLocoWeightTons: String(directionChangeLocoWeight),
    directionChangeLocoBrakeWeightTons: String(directionChangeLocoBrakeWeight),
    directionChangeLocoLengthMeters: String(directionChangeLocoLength),
    directionChangeLocoFestKn: String(directionChangeLocoFestKn),
    directionChangeTotalVehicleCount: String(directionChangeTotalVehicleCount),
    directionChangeTotalLengthMeters: String(directionChangeTotalLength),
    directionChangeTotalWeightTons: String(directionChangeTotalWeight),
    directionChangeTotalBrakeWeightTons: String(directionChangeTotalBrakeWeight),
    directionChangeAvailableBrakePercentage: String(directionChangeAvailableBrakePercentage),
    directionChangeMissingBrakePercentage:
      directionChangeMissingBrakePercentage > 0
        ? String(directionChangeMissingBrakePercentage)
        : "",
        addLocoTotalVehicleCount: String(addLocoTotalVehicleCount),
addLocoTotalLengthMeters: String(addLocoTotalLength),
addLocoTotalWeightTons: String(addLocoTotalWeight),
addLocoTotalBrakeWeightTons: String(addLocoTotalBrakeWeight),
addLocoTotalAxles: String(addLocoTotalAxles),
addLocoTotalFestKn: String(addLocoTotalFestKn),
addLocoAvailableBrakePercentage: String(addLocoAvailableBrakePercentage),
addLocoMissingBrakePercentage:
  addLocoMissingBrakePercentage > 0
    ? String(addLocoMissingBrakePercentage)
    : "",

    availableBrakePercentage: String(availableBrakePercentage),
    mode,
    issuedByName,
    highestRouteClass: parsedSummary.highestRouteClass,
    minimumBrakePercentage: String(minimum),
    missingBrakePercentage:
      missingBrakePercentage > 0 ? String(missingBrakePercentage) : "",

    trainNumber: parsedSummary.trainNumber,
    departureStation: parsedSummary.departureStation,
    destinationStation: parsedSummary.destinationStation,
    date: new Date().toLocaleDateString("de-DE"),
  };

stateToGenerate = {
    mode: "international",
    data: internationalState,
  };

}




  const state = {
  date: new Date().toLocaleDateString("de-DE"),
  trainNumber: parsedSummary.trainNumber,
  departureStation: parsedSummary.departureStation,
  zugStart,
  directionChange,
  nationalDoubleTractionDropOff,
  directionChangeStation: directionStation,
  firstVehicleNumber: parsedSummary.firstVehicleNumber,
  firstBrakeWeight: parsedSummary.firstBrakeWeight,
  lokVmax: activeLok.vmax,
  fahrplanVmax: Number(timetableSpeedInput) || 0,

  wagonWeightTons: String(parsedSummary.totalWeightTons),
  locoWeightTons: String(
    activeLok.weightTons +
      (doubleTraction && tractionSecondLok ? tractionSecondLok.weightTons : 0)
  ),
  totalWeightTons: String(totalWeight),

  wagonBrakeWeightTons: String(parsedSummary.totalBrakeWeightTons),
  locoBrakeWeightTons: String(
    locoBrakeWeight +
      (doubleTraction && tractionSecondLok ? secondLocoBrakeWeight : 0)
  ),
  totalBrakeWeightTons: String(totalBrakeWeight),

  wagonAxles: String(parsedSummary.totalAxles),
  locoAxles: String(
    activeLok.axles +
      (doubleTraction && tractionSecondLok ? tractionSecondLok.axles : 0)
  ),
  totalAxles: String(totalAxles),

  minimumBrakePercentage: String(minimum),
  availableBrakePercentage: String(availableBrakePercentage),
  missingBrakePercentage: missingBrakePercentage > 0 ? String(missingBrakePercentage) : "",

  lastVehicleNumber: parsedSummary.lastVehicleNumber,
  multiReleaseBrakeCount: String(parsedSummary.multiReleaseBrakeCount),
  kLllBrakeCount: String(parsedSummary.kLllBrakeCount),

  wagonLengthMeters: String(Math.ceil(parsedSummary.totalLengthMeters)),
  locoLengthMeters: String(
    activeLok.lengthMeters +
      (doubleTraction && tractionSecondLok ? tractionSecondLok.lengthMeters : 0)
  ),
  totalLengthMeters: String(totalLength),

  speedCheckNo: wagonTooSlow,
  lowerSpeedKmh: wagonTooSlow ? String(parsedSummary.lowerSpeedKmh ?? "") : "",

  dangerousGoodsPresent: parsedSummary.dangerousGoodsPresent,
  issuedByName,
};

  if (printMode !== "international") {
  if (directionChange && directionStation.trim() !== "") {
    const reversedLocoWeightTons =
      doubleTraction && keepDoubleTractionAfterDirectionChange === false
        ? activeLok.weightTons
        : activeLok.weightTons +
          (doubleTraction && tractionSecondLok ? tractionSecondLok.weightTons : 0);

    const reversedLocoBrakeWeightTons =
      doubleTraction && keepDoubleTractionAfterDirectionChange === false
        ? locoBrakeWeight
        : locoBrakeWeight +
          (doubleTraction && tractionSecondLok ? secondLocoBrakeWeight : 0);

    const reversedLocoAxles =
      doubleTraction && keepDoubleTractionAfterDirectionChange === false
        ? activeLok.axles
        : activeLok.axles +
          (doubleTraction && tractionSecondLok ? tractionSecondLok.axles : 0);

    const reversedLocoLengthMeters =
      doubleTraction && keepDoubleTractionAfterDirectionChange === false
        ? activeLok.lengthMeters
        : activeLok.lengthMeters +
          (doubleTraction && tractionSecondLok ? tractionSecondLok.lengthMeters : 0);

    const reversedTotalWeightTons =
      parsedSummary.totalWeightTons + reversedLocoWeightTons;

    const reversedTotalBrakeWeightTons =
      parsedSummary.totalBrakeWeightTons + reversedLocoBrakeWeightTons;

    const reversedTotalAxles =
      parsedSummary.totalAxles + reversedLocoAxles;

    const reversedTotalLengthMeters =
      Math.ceil(parsedSummary.totalLengthMeters + reversedLocoLengthMeters);

    const reversedAvailableBrakePercentage =
      reversedTotalWeightTons > 0
        ? Math.floor((reversedTotalBrakeWeightTons * 100) / reversedTotalWeightTons)
        : 0;

    const reversedMissingBrakePercentage =
      reversedAvailableBrakePercentage < minimum
        ? minimum - reversedAvailableBrakePercentage
        : 0;

    reversedStateToGenerate = {
      ...state,
      departureStation: directionStation,
      lastVehicleNumber: state.firstVehicleNumber,

      locoWeightTons: String(reversedLocoWeightTons),
      totalWeightTons: String(reversedTotalWeightTons),

      locoBrakeWeightTons: String(reversedLocoBrakeWeightTons),
      totalBrakeWeightTons: String(reversedTotalBrakeWeightTons),

      locoAxles: String(reversedLocoAxles),
      totalAxles: String(reversedTotalAxles),

      locoLengthMeters: String(reversedLocoLengthMeters),
      totalLengthMeters: String(reversedTotalLengthMeters),

      availableBrakePercentage: String(reversedAvailableBrakePercentage),
      missingBrakePercentage:
        reversedMissingBrakePercentage > 0
          ? String(reversedMissingBrakePercentage)
          : "",
    };
  }

  if (
    doubleTraction &&
    nationalDoubleTractionDropOff &&
    nationalDropOffStation.trim() !== ""
  ) {
    const reducedLocoWeightTons = activeLok.weightTons;
    const reducedLocoBrakeWeightTons = locoBrakeWeight;
    const reducedLocoAxles = activeLok.axles;
    const reducedLocoLengthMeters = activeLok.lengthMeters;

    const reducedTotalWeightTons =
      parsedSummary.totalWeightTons + reducedLocoWeightTons;

    const reducedTotalBrakeWeightTons =
      parsedSummary.totalBrakeWeightTons + reducedLocoBrakeWeightTons;

    const reducedTotalAxles =
      parsedSummary.totalAxles + reducedLocoAxles;

    const reducedTotalLengthMeters =
      Math.ceil(parsedSummary.totalLengthMeters + reducedLocoLengthMeters);

    const reducedAvailableBrakePercentage =
      reducedTotalWeightTons > 0
        ? Math.floor((reducedTotalBrakeWeightTons * 100) / reducedTotalWeightTons)
        : 0;

    const reducedMissingBrakePercentage =
      reducedAvailableBrakePercentage < minimum
        ? minimum - reducedAvailableBrakePercentage
        : 0;

    reversedStateToGenerate = {
  ...state,
  zugStart: false,
  departureStation: nationalDropOffStation,

  locoWeightTons: String(reducedLocoWeightTons),
  totalWeightTons: String(reducedTotalWeightTons),

  locoBrakeWeightTons: String(reducedLocoBrakeWeightTons),
  totalBrakeWeightTons: String(reducedTotalBrakeWeightTons),

  locoAxles: String(reducedLocoAxles),
  totalAxles: String(reducedTotalAxles),

  locoLengthMeters: String(reducedLocoLengthMeters),
  totalLengthMeters: String(reducedTotalLengthMeters),

  availableBrakePercentage: String(reducedAvailableBrakePercentage),
  missingBrakePercentage:
    reducedMissingBrakePercentage > 0
      ? String(reducedMissingBrakePercentage)
      : "",
};
  }

  stateToGenerate = {
    mode: "national",
    data: state,
  };
}

  // ❗ Richtungswechsel-Block
if (directionChange && directionStation.trim() !== "") {
  const wagonWeight = parsedSummary.totalWeightTons;

  if (wagonWeight >= 1200) {
    setWarningItems([
      "Achtung! Richtungswechsel unzulässig! Wagenzuggewicht größer 1200T. Neue Wagenliste erforderlich!"
    ]);
    setPendingPdfState({
  mode: stateToGenerate?.mode,
  data: stateToGenerate?.data,
  reversedData: reversedStateToGenerate || null,
});
    setWarningCanContinue(false);
    setWarningOpen(true);
    setIsGenerating(false);
    return;
  }

  if ((parsedSummary.firstBrakeWeight || 0) === 0) {
    setWarningItems([
      "Richtungswechsel nicht zulässig: erster Wagen hat keine wirkende Druckluftbremse. Somit hätte das letzte Fahrzeug nach dem Richtungswechsel keine wirkende Druckluftbremse!"
    ]);
    setPendingPdfState({
  mode: stateToGenerate?.mode,
  data: stateToGenerate?.data,
  reversedData: reversedStateToGenerate || null,
});
    setWarningCanContinue(false);
    setWarningOpen(true);
    setIsGenerating(false);
    return;
  }
}
  
  const warnings: string[] = [];

  const italyNeedsManualClarification =
  selectedCountries.some((country) => country.code === "83");

if (italyNeedsManualClarification) {
  warnings.push(
    "Achtung: Für Italien kann ohne Streckendaten keine eindeutige zulässige Geschwindigkeit bzw. keine vollständige betriebliche Einstufung ermittelt werden. Bitte Streckendaten abgleichen."
  );
}

  const franceNeedsManualClarification =
  selectedCountries.some((country) => country.code === "87") &&
  freinageForfaitaire === false;

if (franceNeedsManualClarification) {
  warnings.push(
    "Bildung der Zugkategorie für Frankreich nicht möglich! Mit betriebsleitender Stelle weiteres Vorgehen abstimmen!"
  );
}

  const dynamicBrakeRejectedBecauseOfWeight =
  mode === "P" &&
  parsedSummary.totalWeightTons > 800 &&
  (
    (Number(activeLok.brakeWeightPE || 0) > 0 && dynamicBrakeEffective === true) ||
    (!!tractionSecondLok &&
      Number(tractionSecondLok.brakeWeightPE || 0) > 0 &&
      (
        doubleTraction
          ? dynamicBrakeEffective === true
          : secondDynamicBrakeEffective === true
      )) ||
    (!!addedActiveLok &&
      Number(addedActiveLok.brakeWeightPE || 0) > 0 &&
      addedDynamicBrakeEffective === true)
  );

if (dynamicBrakeRejectedBecauseOfWeight) {
  warnings.push(
    "Achtung! Dynamische Bremse darf nicht angerechnet werden, da das Wagenzuggewicht größer als 800 t ist! Es wird automatisch Bremsgewicht G verwendet!"
  );
}

 const tooFewActiveBrakesForMainDynamicBrake =
  Number(activeLok.brakeWeightPE || 0) > 0 &&
  dynamicBrakeEffective === true &&
  mode === "P" &&
  parsedSummary.totalWeightTons <= 800 &&
  !hasAtLeastFourActiveWagonBrakes(parsedSummary);

const tooFewActiveBrakesForSecondDynamicBrake =
  !!tractionSecondLok &&
  Number(tractionSecondLok.brakeWeightPE || 0) > 0 &&
  (
    doubleTraction
      ? dynamicBrakeEffective === true
      : secondDynamicBrakeEffective === true
  ) &&
  mode === "P" &&
  parsedSummary.totalWeightTons <= 800 &&
  !hasAtLeastFourActiveWagonBrakes(parsedSummary);

const tooFewActiveBrakesForAddedDynamicBrake =
  !!addedActiveLok &&
  Number(addedActiveLok.brakeWeightPE || 0) > 0 &&
  addedDynamicBrakeEffective === true &&
  mode === "P" &&
  parsedSummary.totalWeightTons <= 800 &&
  !hasAtLeastFourActiveWagonBrakes(parsedSummary);

if (
  tooFewActiveBrakesForMainDynamicBrake ||
  tooFewActiveBrakesForSecondDynamicBrake ||
  tooFewActiveBrakesForAddedDynamicBrake
) {
  warnings.push(
    "Achtung! Dynamische Bremse darf nicht angerechnet werden, da weniger als 4 Wagen im Zug eine wirkende Druckluftbremse haben! Es wird automatisch Bremsgewicht P verwendet!"
  );
}

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
  setPendingPdfState({
    mode: stateToGenerate?.mode,
    data: stateToGenerate?.data,
    reversedData: reversedStateToGenerate || null,
  });
  setWarningCanContinue(true);
  setWarningOpen(true);
  setIsGenerating(false);
  return;
}


if (stateToGenerate?.mode === "international") {
  await createPdf(undefined, undefined, stateToGenerate.data);
  setIsGenerating(false);
  return;
}

if (stateToGenerate?.mode === "national") {
  await createPdf(
    stateToGenerate.data,
    reversedStateToGenerate || undefined
  );
  setIsGenerating(false);
  return;
}
  }

async function confirmWarningAndGeneratePdf() {
  setWarningOpen(false);

  if (!pendingPdfState) return;

  if (pendingPdfState.mode === "international") {
    await createPdf(undefined, undefined, pendingPdfState.data);
  } else if (pendingPdfState.mode === "national") {
    await createPdf(
      pendingPdfState.data,
      pendingPdfState.reversedData || undefined
    );
  }

  setPendingPdfState(null);
  setWarningItems([]);
}

const availableCountries = [
  { code: "80", label: "Deutschland" },
  { code: "81", label: "Österreich" },
  { code: "83", label: "Italien" },
  { code: "87", label: "Frankreich" },
  { code: "88", label: "Belgien" },
  { code: "86", label: "Dänemark" },
  { code: "85", label: "Schweiz" },
  { code: "84", label: "Niederlande" },
  { code: "82", label: "Luxemburg" },
  { code: "51", label: "Polen" },
  { code: "54", label: "Tschechien" },
];
    const doubleTractionDisabled =
  printMode === "international" && addLocoAtStation;

  const directionChangeDisabled =
  (printMode === "international" &&
    (addLocoAtStation || (doubleTraction && doubleTractionDropOff === true))) ||
  (printMode === "national" && doubleTraction && nationalDoubleTractionDropOff);

  return (
    <div className="app">
      <div className="header-card">
        <div className="header-row">
          <img src="/header-icon.png" className="header-icon" />
          <div className="header-text">
            <h1>BREZEL-Master</h1>
            <p>by Jonas Gießmann | Version 4.0</p>
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
    <span className="icon">🧾</span>
    Bremszettelausdruck
  </div>

  <div className="lok-row">
    <button
      type="button"
      className={`lok-box ${printMode === "national" ? "active" : ""}`}
      onClick={() => {
        setPrintMode("national");
      }}
    >
      National
      <span>Für Fahrten in Deutschland</span>
    </button>

    <button
      type="button"
      className={`lok-box ${printMode === "international" ? "active" : ""}`}
      onClick={() => {
        setPrintMode("international");
        setInternationalModalOpen(true);
      }}
    >
      International
      <span>Für Grenzüberschreitenden Verkehr</span>
    </button>
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

        {printMode === "international" && (
  <>
    <div className="divider" />

    <div className="row">
      <div>
        <strong>Lok in Unterwegsbahnhof hinzufügen</strong>
        <div className="sub">Soll unterwegs eine weitere arbeitende Lok dazukommen?</div>
      </div>

      <div className="switch">
        <div
          className={`toggle ${addLocoAtStation ? "active" : ""}`}
          onClick={() => {
            const newValue = !addLocoAtStation;
            setAddLocoAtStation(newValue);
            if (newValue) {
  setDoubleTraction(false);
  setDirectionChange(false);
setDirectionModalOpen(false);
setDirectionStation("");
setReduceToOneLocoAfterDirectionChange(false);
setRemovedLocoAfterDirectionChange("");
setSecondLocoEnabled(null);
setSecondLocoVehicleNumber("");
setSecondLocoSoleType("");
setSecondLocoInsertPosition("");
setSecondLocoInsertPositionError(false);
setKeepDoubleTractionAfterDirectionChange(null);
}

            if (newValue) {
              setAddLocoModalOpen(true);
            } else {
              setAddLocoModalOpen(false);
              setAddLocoStation("");
              setAddedLocoSelectedType("list");
              setAddedLocoSelectedName("G1206");
              setAddedLocoVehicleNumber("");
              setAddedLocoInsertPosition("");
              setAddedLocoSoleType("");
              setAddedCustomLocoName("");
              setAddedCustomLocoWeight("");
              setAddedCustomLocoBrakeP("");
              setAddedCustomLocoBrakeG("");
              setAddedCustomLocoLength("");
              setAddedCustomLocoVmax("");
              setAddedCustomLocoAxles("");
              setAddedCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});
              setAddedCustomLocoFestKn("");
              setAddedCustomLocoBrakePE("");
setAddedDynamicBrakeEffective(null);
setAddedDynamicBrakeModalOpen(false);
              setAddLocoModalError(false);
            }
          }}
        />
      </div>
    </div>
  </>
)}
      </div>

      <div className="card">
 {printMode === "national" && (
  <>
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
  </>
)}

  <div className="row">
    <div>
      <strong>Doppeltraktion</strong>
      <div className="sub">Fährt der Zug mit zwei arbeitenden Loks?</div>
    </div>

    <div className="switch">

<div
  className={`toggle ${doubleTraction ? "active" : ""} ${
    doubleTractionDisabled ? "disabled" : ""
  }`}
  onClick={() => {
    if (doubleTractionDisabled) return;

    const newValue = !doubleTraction;

    setDoubleTraction(newValue);

    if (newValue && printMode === "international" && !directionChange) {
  setDoubleTractionModalOpen(true);
}

    if (!newValue) {
      setDoubleTractionSecondVehicleNumber("");
      setDoubleTractionSecondSoleType("");
    }
  }}
/>
    </div>
  </div>

  <div className="divider" />

  {printMode === "national" && doubleTraction && (
  <>
    <div className="row" style={{ alignItems: "flex-start" }}>
      <div>
        <strong>Ab Unterwegsbahnhof nur noch eine Lok?</strong>
        <div className="sub">Geht unterwegs eine der beiden Loks weg?</div>
      </div>

      <div className="toggle-group">
        <button
  type="button"
  className={nationalDoubleTractionDropOff === true ? "active" : ""}
  onClick={() => {
    setNationalDoubleTractionDropOff(true);
    setDirectionChange(false);
    setDirectionStation("");
    setReduceToOneLocoAfterDirectionChange(false);
    setRemovedLocoAfterDirectionChange("");
    setKeepDoubleTractionAfterDirectionChange(null);
  }}
>
  Ja
</button>

        <button
  type="button"
  className={nationalDoubleTractionDropOff === false ? "active" : ""}
  onClick={() => {
    setNationalDoubleTractionDropOff(false);
    setNationalDropOffStation("");
  }}
>
  Nein
</button>
      </div>
    </div>

    {nationalDoubleTractionDropOff === true && (
      <div className="input-row" style={{ marginTop: "14px" }}>
        <label>Betriebsstelle, ab der nur noch eine Lok fährt</label>
        <input
          type="text"
          value={nationalDropOffStation}
          onChange={(e) => setNationalDropOffStation(e.target.value)}
          placeholder="z. B. Bruchsal"
        />
      </div>
    )}

    <div className="divider" />
  </>
)}

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
  className={`toggle ${directionChange ? "active" : ""} ${
    directionChangeDisabled ? "disabled" : ""
  }`}
  onClick={() => {
    if (directionChangeDisabled) return;

    const newValue = !directionChange;
    setDirectionChange(newValue);

    if (newValue) {
      setDirectionModalOpen(true);
    } else {
      setDirectionStation("");
      setReduceToOneLocoAfterDirectionChange(false);
      setRemovedLocoAfterDirectionChange("");
      setSecondLocoEnabled(null);
      setSecondLocoVehicleNumber("");
      setSecondLocoSoleType("");
      setSecondLocoInsertPosition("");
      setSecondLocoInsertPositionError(false);
      setKeepDoubleTractionAfterDirectionChange(null);
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
          <label>Fahrplangeschwindigkeit (Deutschland)</label>
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

      <input
  type="text"
  placeholder="Lok suchen..."
  value={lokSearch}
  onChange={(e) => setLokSearch(e.target.value)}
  style={{ marginBottom: "10px" }}
/>

      <div className="lok-list">
        {(() => {
  const filteredLokomotives = locomotives.filter((lok) =>
    lok.name.toLowerCase().includes(lokSearch.toLowerCase())
  );

  if (filteredLokomotives.length === 0) {
    return <div className="sub">Keine Lok gefunden</div>;
  }

  return filteredLokomotives.map((lok) => (
    <button
      key={lok.name}
      type="button"
      onClick={() => handleSelectMainLokFromList(lok.name)}
      className={selectedLokName === lok.name ? "lok-list-button active" : "lok-list-button"}
    >
      {lok.name}
    </button>
  ));
})()}
      </div>

      <div className="modal-actions">
        <button
  type="button"
  className="primary"
  onClick={() => {
    setLokSelectOpen(false);
    setLokSearch("");
  }}
>
  Schließen
</button>
      </div>
    </div>
  </div>
)}

{secondLokSelectOpen && (
  <div className="modal-overlay" style={{ zIndex: 1100 }}>
    <div className="modal-card">
      <h2>Zweite Lok auswählen</h2>

      <input
  type="text"
  placeholder="Lok suchen..."
  value={secondLokSearch}
  onChange={(e) => setSecondLokSearch(e.target.value)}
  style={{ marginBottom: "10px" }}
/>

      <div className="lok-list">
        {(() => {
  const filteredLokomotives = locomotives.filter((lok) =>
    lok.name.toLowerCase().includes(secondLokSearch.toLowerCase())
  );

  if (filteredLokomotives.length === 0) {
    return <div className="sub">Keine Lok gefunden</div>;
  }

  return filteredLokomotives.map((lok) => (
    <button
      key={lok.name}
      type="button"
      onClick={() => handleSelectSecondLokFromList(lok.name)}
      className={
        secondSelectedLokName === lok.name
          ? "lok-list-button active"
          : "lok-list-button"
      }
    >
      {lok.name}
    </button>
  ));
})()}
      </div>

      <div className="modal-actions">
       <button
  type="button"
  className="primary"
  onClick={() => {
    setSecondLokSelectOpen(false);
    setSecondLokSearch("");
  }}
>
  Schließen
</button>
      </div>
    </div>
  </div>
)}

{secondCustomLokOpen && (
  <div className="modal-overlay" style={{ zIndex: 1100 }}>
    <div className="modal-card">
      <h2>Zweite eigene Lok</h2>

      <div className="lok-list">
        <input
  type="text"
  placeholder="Lokbezeichnung"
  value={secondCustomLokName}
  onChange={(e) => setSecondCustomLokName(e.target.value)}
  className={secondCustomErrors.name ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Gewicht [t]"
  value={secondCustomLokWeight}
  onChange={(e) => setSecondCustomLokWeight(e.target.value)}
  className={secondCustomErrors.weight ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Bremsgewicht P [t]"
  value={secondCustomLokBrakeP}
  onChange={(e) => setSecondCustomLokBrakeP(e.target.value)}
  className={secondCustomErrors.brakeP ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Bremsgewicht P+E [t] (optional)"
  value={secondCustomLokBrakePE}
  onChange={(e) => setSecondCustomLokBrakePE(e.target.value)}
/>

        <input
  type="number"
  placeholder="Bremsgewicht G [t]"
  value={secondCustomLokBrakeG}
  onChange={(e) => setSecondCustomLokBrakeG(e.target.value)}
  className={secondCustomErrors.brakeG ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Länge [m]"
  value={secondCustomLokLength}
  onChange={(e) => setSecondCustomLokLength(e.target.value)}
  className={secondCustomErrors.length ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Achsenzahl"
  value={secondCustomLokAxles}
  onChange={(e) => setSecondCustomLokAxles(e.target.value)}
  className={secondCustomErrors.axles ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Zul. Höchstgeschwindigkeit [km/h]"
  value={secondCustomLokVmax}
  onChange={(e) => setSecondCustomLokVmax(e.target.value)}
  className={secondCustomErrors.vmax ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Festhaltekraft [kN]"
  value={secondCustomLokFestKn}
  onChange={(e) => setSecondCustomLokFestKn(e.target.value)}
/>
      </div>

      <div className="modal-actions">
        <button
  type="button"
  className="secondary"
  onClick={() => {
    setSecondCustomLokOpen(false);
    setSecondCustomErrors({
      name: false,
      weight: false,
      brakeP: false,
      brakeG: false,
      length: false,
      vmax: false,
      axles: false,
    });
  }}
>
  Zurück
</button>

        <button
  type="button"
  className="primary"
  onClick={() => {
    const errors = {
      name: secondCustomLokName.trim() === "",
      weight: Number(secondCustomLokWeight) <= 0,
      brakeP: Number(secondCustomLokBrakeP) <= 0,
      brakeG: Number(secondCustomLokBrakeG) <= 0,
      length: Number(secondCustomLokLength) <= 0,
      vmax: Number(secondCustomLokVmax) <= 0,
      axles: Number(secondCustomLokAxles) <= 0,
    };

    setSecondCustomErrors(errors);

    const hasError = Object.values(errors).some((e) => e);

    if (hasError) return;
    setSecondCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});

    setSecondCustomLokOpen(false);

    if (Number(secondCustomLokBrakePE) > 0) {
      setSecondDynamicBrakeEffective(null);
      setSecondDynamicBrakeModalOpen(true);
    } else {
      setSecondDynamicBrakeEffective(false);
    }
  }}
>
  Anwenden
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
  placeholder="Bremsgewicht P+E [t] (optional)"
  value={customLokBrakePE}
  onChange={(e) => setCustomLokBrakePE(e.target.value)}
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

        <input
  type="number"
  placeholder="Festhaltekraft [kN]"
  value={customLokFestKn}
  onChange={(e) => setCustomLokFestKn(e.target.value)}
/>
      </div>

      <div className="modal-actions">
  <button
  type="button"
  className="secondary"
  onClick={() => {
    setCustomLokOpen(false);
    setCustomErrors({
      name: false,
      weight: false,
      brakeP: false,
      brakeG: false,
      length: false,
      vmax: false,
      axles: false,
    });
  }}
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
    setCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});

    setSelectedLok("custom");
    setCustomLokOpen(false);

    if (Number(customLokBrakePE) > 0) {
      setDynamicBrakeEffective(null);
      setDynamicBrakeModalOpen(true);
    } else {
      setDynamicBrakeEffective(false);
    }
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

      {printMode === "national" && doubleTraction && (
  <>
    <label>Nach Richtungswechsel weiterhin Doppeltraktion?</label>

    <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "10px" }}>
      <button
        type="button"
        className={keepDoubleTractionAfterDirectionChange === true ? "active" : ""}
        onClick={() => setKeepDoubleTractionAfterDirectionChange(true)}
      >
        Ja
      </button>

      <button
        type="button"
        className={keepDoubleTractionAfterDirectionChange === false ? "active" : ""}
        onClick={() => setKeepDoubleTractionAfterDirectionChange(false)}
      >
        Nein
      </button>
    </div>
  </>
)}

      {printMode === "international" && doubleTraction && (
  <>
    <label>Nach Richtungswechsel nur noch eine Lok?</label>

    <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "10px" }}>
      <button
        type="button"
        className={reduceToOneLocoAfterDirectionChange === true ? "active" : ""}
        onClick={() => setReduceToOneLocoAfterDirectionChange(true)}
      >
        Ja
      </button>

      <button
        type="button"
        className={reduceToOneLocoAfterDirectionChange === false ? "active" : ""}
        onClick={() => {
          setReduceToOneLocoAfterDirectionChange(false);
          setRemovedLocoAfterDirectionChange("");
        }}
      >
        Nein
      </button>
    </div>
  </>
)}

{doubleTraction && reduceToOneLocoAfterDirectionChange && (
  <>
    <label>Welche Lok geht beim Richtungswechsel weg?</label>

    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px", marginBottom: "10px" }}>
      <button
  type="button"
  className={removedLocoAfterDirectionChange === "loco1" ? "active" : ""}
  onClick={() => setRemovedLocoAfterDirectionChange("loco1")}
>
  {locoVehicleNumber.trim() !== "" ? locoVehicleNumber : "Lok 1"}
</button>

<button
  type="button"
  className={removedLocoAfterDirectionChange === "loco2" ? "active" : ""}
  onClick={() => setRemovedLocoAfterDirectionChange("loco2")}
>
  {doubleTractionSecondVehicleNumber.trim() !== ""
    ? doubleTractionSecondVehicleNumber
    : "Lok 2"}
</button>
    </div>
  </>
)}

{printMode === "international" && !doubleTraction && (
  <>
    <label>Weitere Lok?</label>

    <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "10px" }}>
      <button
        type="button"
        className={secondLocoEnabled === true ? "active" : ""}
        onClick={() => setSecondLocoEnabled(true)}
      >
        Ja
      </button>

      <button
        type="button"
        className={secondLocoEnabled === false ? "active" : ""}
        onClick={() => {
  setSecondLocoEnabled(false);
  setSecondLocoModalError(false);
  setSecondSelectedLok("list");
  setSecondSelectedLokName("G1206");
  setSecondCustomLokName("");
  setSecondCustomLokWeight("");
  setSecondCustomLokBrakeP("");
  setSecondCustomLokBrakeG("");
  setSecondCustomLokLength("");
  setSecondCustomLokVmax("");
  setSecondCustomLokAxles("");
  setSecondCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});
  setSecondCustomLokBrakePE("");
setSecondDynamicBrakeEffective(null);
setSecondDynamicBrakeModalOpen(false);
setSecondCustomLokFestKn("");
  setSecondLocoVehicleNumber("");
  setSecondLocoSoleType("");
  setSecondLocoInsertPosition("");
  setSecondLocoInsertPositionError(false);
}}
      >
        Nein
      </button>
    </div>

    {secondLocoEnabled && (
      <div className="lok-row" style={{ marginTop: "12px" }}>
        <button
  type="button"
  className={`lok-box ${secondSelectedLok === "list" ? "active" : ""}`}
  onClick={() => {
    setSecondSelectedLok("list");
    setSecondLokSelectOpen(true);
  }}
>
  Lok aus Liste
  <span>Aktuell: {secondSelectedLokName}</span>
</button>

        <button
  type="button"
  className={`lok-box ${secondSelectedLok === "custom" ? "active" : ""}`}
  onClick={() => {
    setSecondSelectedLok("custom");
    setSecondCustomLokOpen(true);
  }}
>
  Eigene Lok
  <span>{secondCustomLokName || "Manuell eingeben"}</span>
</button>
      </div>
    )}

    {secondLocoEnabled && (
  <>
    <input
  type="text"
  placeholder="Lokfahrzeugnummer zweite Lok"
  value={secondLocoVehicleNumber}
  onChange={(e) => {
    setSecondLocoVehicleNumber(formatVehicleNumberInput(e.target.value));
    setSecondLocoModalError(false);
  }}
  style={{ marginTop: "12px" }}
  className={
    secondLocoModalError && secondLocoVehicleNumber.trim() === ""
      ? "input-error"
      : ""
  }
  inputMode="numeric"
  maxLength={16}
  autoComplete="off"
/>

    <select
  value={secondLocoSoleType}
  onChange={(e) => {
    setSecondLocoSoleType(
      e.target.value as "F" | "D" | "L" | "LL" | "K" | ""
    );
    setSecondLocoModalError(false);
  }}
  style={{ marginTop: "12px" }}
  className={
    secondLocoModalError && secondLocoSoleType === ""
      ? "input-error"
      : ""
  }
>
      <option value="">Bremssohlenart zweite Lok</option>
      <option value="F">F</option>
      <option value="D">D</option>
      <option value="L">L</option>
      <option value="LL">LL</option>
      <option value="K">K</option>
    </select>

    <label style={{ marginTop: "12px", display: "block" }}>
  Position der zweiten Lok nach Richtungswechsel
</label>

<select
  value={secondLocoInsertPosition}
  onChange={(e) => {
    setSecondLocoInsertPosition(e.target.value as "1" | "2" | "");
    setSecondLocoInsertPositionError(false);
  }}
  className={secondLocoInsertPositionError ? "input-error" : ""}
>
  <option value="" disabled hidden>Bitte wählen</option>
  <option value="1">Pos. 1</option>
  <option value="2">Pos. 2</option>
</select>
  </>
)}
  </>
)}



      <div className="modal-actions">
  <button
    type="button"
    className="secondary"
    onClick={() => {
  setDirectionChange(false);
  setDirectionModalOpen(false);
  setDirectionStation("");
  setDirectionError(false);
  setReduceToOneLocoAfterDirectionChange(false);
  setRemovedLocoAfterDirectionChange("");
  setSecondLocoEnabled(null);
  setSecondCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});
  setSecondCustomLokBrakePE("");
setSecondDynamicBrakeEffective(null);
setSecondDynamicBrakeModalOpen(false);
setSecondCustomLokFestKn("");
  setSecondLocoVehicleNumber("");
  setSecondLocoSoleType("");
  setSecondLocoInsertPosition("");
  setSecondLocoInsertPositionError(false);
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
  if (
  printMode === "national" &&
  doubleTraction &&
  keepDoubleTractionAfterDirectionChange === null
) {
  return;
}

  if (
    doubleTraction &&
    reduceToOneLocoAfterDirectionChange &&
    removedLocoAfterDirectionChange === ""
  ) {
    return;
  }

  if (
  printMode === "international" &&
  !doubleTraction &&
  secondLocoEnabled &&
  (
    secondLocoVehicleNumber.trim() === "" ||
    secondLocoSoleType === ""
  )
) {
  setSecondLocoModalError(true);
  return;
}

  if (
    printMode === "international" &&
    !doubleTraction &&
    secondLocoEnabled &&
    secondLocoInsertPosition === ""
  ) {
    setSecondLocoInsertPositionError(true);
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

{doubleTractionModalOpen && (
  <div className="modal-overlay" style={{ zIndex: 1100 }}>
    <div className="modal-card">
      <h2>Zweite Lok bei Doppeltraktion</h2>

      <div className="lok-list">
        <input
  type="text"
  placeholder="Lokfahrzeugnummer zweite Lok"
  value={doubleTractionSecondVehicleNumber}
  onChange={(e) => {
    setDoubleTractionSecondVehicleNumber(
      formatVehicleNumberInput(e.target.value)
    );
    setDoubleTractionModalError(false);
  }}
  className={
  doubleTractionModalError && doubleTractionSecondVehicleNumber.trim() === ""
    ? "input-error"
    : ""
}
  inputMode="numeric"
  maxLength={16}
  autoComplete="off"
/>

        <select
          value={doubleTractionSecondSoleType}
          onChange={(e) => {
            setDoubleTractionSecondSoleType(
              e.target.value as "F" | "D" | "L" | "LL" | "K" | ""
            );
            setDoubleTractionModalError(false);
          }}
          className={
  doubleTractionModalError && doubleTractionSecondSoleType === ""
    ? "input-error"
    : ""
}
        >
          <option value="">Bremssohlenart zweite Lok</option>
          <option value="F">F</option>
          <option value="D">D</option>
          <option value="L">L</option>
          <option value="LL">LL</option>
          <option value="K">K</option>
        </select>
      </div>

      <label>Geht unterwegs eine Lok weg?</label>

<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
  <button
  type="button"
  className={doubleTractionDropOff === true ? "active" : ""}
  onClick={() => {
    setDoubleTractionDropOff(true);
    setDirectionChange(false);
    setDirectionStation("");
    setReduceToOneLocoAfterDirectionChange(false);
    setRemovedLocoAfterDirectionChange("");
    setKeepDoubleTractionAfterDirectionChange(null);
  }}
>
  Ja
</button>

  <button
    type="button"
    className={doubleTractionDropOff === false ? "active" : ""}
    onClick={() => {
      setDoubleTractionDropOff(false);
      setDoubleTractionDropOffStation("");
      setDoubleTractionRemovedLoco("");
    }}
  >
    Nein
  </button>
</div>

{doubleTractionDropOff === true && (
  <input
    type="text"
    placeholder="Betriebsstelle, z. B. Bruchsal"
    value={doubleTractionDropOffStation}
    onChange={(e) => setDoubleTractionDropOffStation(e.target.value)}
    style={{ marginTop: "10px", marginBottom: "10px" }}
  />
)}

{printMode === "international" &&
  doubleTractionDropOff === true &&
  doubleTractionDropOffStation.trim() !== "" && (
    <>
      <label>Welche Lok geht weg?</label>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
        <button
          type="button"
          className={doubleTractionRemovedLoco === "loco1" ? "active" : ""}
          onClick={() => setDoubleTractionRemovedLoco("loco1")}
        >
          {locoVehicleNumber.trim() !== "" ? locoVehicleNumber : "Lok 1"}
        </button>

        <button
          type="button"
          className={doubleTractionRemovedLoco === "loco2" ? "active" : ""}
          onClick={() => setDoubleTractionRemovedLoco("loco2")}
        >
          {doubleTractionSecondVehicleNumber.trim() !== ""
            ? doubleTractionSecondVehicleNumber
            : "Lok 2"}
        </button>
      </div>
    </>
)}

      <div className="modal-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setDoubleTraction(false);
            setDoubleTractionModalOpen(false);
            setDoubleTractionSecondVehicleNumber("");
            setDoubleTractionSecondSoleType("");
            setDoubleTractionModalError(false);
          }}
        >
          Zurück
        </button>

        <button
  type="button"
  className="primary"
  onClick={() => {
    if (
      doubleTractionSecondVehicleNumber.trim() === "" ||
      doubleTractionSecondSoleType === ""
    ) {
      setDoubleTractionModalError(true);
      return;
    }

    if (doubleTractionDropOff === true && doubleTractionDropOffStation.trim() === "") {
      return;
    }

    if (
      printMode === "international" &&
      doubleTractionDropOff === true &&
      doubleTractionRemovedLoco === ""
    ) {
      return;
    }

    setDoubleTractionModalOpen(false);
  }}
>
  Anwenden
</button>
      </div>
    </div>
  </div>
)}

{addLocoModalOpen && (
  <div className="modal-overlay" style={{ zIndex: 1100 }}>
    <div className="modal-card">
      <h2>Lok im Unterwegsbahnhof hinzufügen</h2>

      <div className="lok-list">
        <input
          type="text"
          placeholder="Unterwegsbahnhof"
          value={addLocoStation}
          onChange={(e) => {
            setAddLocoStation(e.target.value);
            setAddLocoModalError(false);
          }}
          className={addLocoModalError && addLocoStation.trim() === "" ? "input-error" : ""}
        />

        <div className="lok-row" style={{ marginTop: "12px" }}>
          <button
  type="button"
  className={`lok-box ${addedLocoSelectedType === "list" ? "active" : ""}`}
  onClick={() => {
    setAddedLocoSelectedType("list");
    setAddedLocoSelectOpen(true);
  }}
>
  Lok aus Liste
  <span>Aktuell: {addedLocoSelectedName}</span>
</button>

          <button
  type="button"
  className={`lok-box ${addedLocoSelectedType === "custom" ? "active" : ""}`}
  onClick={() => {
    setAddedLocoSelectedType("custom");
    setAddedCustomLocoOpen(true);
  }}
>
  Eigene Lok
  <span>{addedCustomLocoName || "Manuell eingeben"}</span>
</button>
        </div>

        <input
          type="text"
          placeholder="Lokfahrzeugnummer"
          value={addedLocoVehicleNumber}
          onChange={(e) => {
            setAddedLocoVehicleNumber(formatVehicleNumberInput(e.target.value));
            setAddLocoModalError(false);
          }}
          inputMode="numeric"
          maxLength={16}
          autoComplete="off"
          style={{ marginTop: "12px" }}
          className={addLocoModalError && addedLocoVehicleNumber.trim() === "" ? "input-error" : ""}
        />

        <label style={{ marginTop: "12px", display: "block" }}>
  Position der zusätzlichen Lok ab Unterwegsbahnhof
</label>

<select
  value={addedLocoInsertPosition}
  onChange={(e) => {
    setAddedLocoInsertPosition(e.target.value as "1" | "2" | "");
    setAddLocoModalError(false);
  }}
  className={addLocoModalError && addedLocoInsertPosition === "" ? "input-error" : ""}
>
  <option value="" disabled hidden>Bitte wählen</option>
  <option value="1">Pos. 1</option>
  <option value="2">Pos. 2</option>
</select>
      </div>

      <select
  value={addedLocoSoleType}
  onChange={(e) => {
    setAddedLocoSoleType(
      e.target.value as "F" | "D" | "L" | "LL" | "K" | ""
    );
    setAddLocoModalError(false);
  }}
  style={{ marginTop: "12px" }}
  className={addLocoModalError && addedLocoSoleType === "" ? "input-error" : ""}
>
  <option value="">Bremssohlenart zusätzliche Lok</option>
  <option value="F">F</option>
  <option value="D">D</option>
  <option value="L">L</option>
  <option value="LL">LL</option>
  <option value="K">K</option>
</select>

      <div className="modal-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setAddLocoAtStation(false);
            setAddLocoModalOpen(false);
            setAddLocoStation("");
            setAddedLocoSelectedType("list");
            setAddedLocoSelectedName("G1206");
            setAddedLocoVehicleNumber("");
            setAddedLocoInsertPosition("");
            setAddedLocoSoleType("");
            setAddedCustomLocoName("");
            setAddedCustomLocoWeight("");
            setAddedCustomLocoBrakeP("");
            setAddedCustomLocoBrakeG("");
            setAddedCustomLocoLength("");
            setAddedCustomLocoVmax("");
            setAddedCustomLocoAxles("");
            setAddedCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});
            setAddedCustomLocoFestKn("");
            setAddedCustomLocoBrakePE("");
setAddedDynamicBrakeEffective(null);
setAddedDynamicBrakeModalOpen(false);
            setAddLocoModalError(false);
          }}
        >
          Zurück
        </button>

        <button
          type="button"
          className="primary"
          onClick={() => {
            if (
  addLocoStation.trim() === "" ||
  addedLocoVehicleNumber.trim() === "" ||
  addedLocoSoleType === "" ||
  addedLocoInsertPosition === ""
) {
  setAddLocoModalError(true);
  return;
}

            setAddLocoModalOpen(false);
          }}
        >
          Anwenden
        </button>
      </div>
    </div>
  </div>
)}

{addedLocoSelectOpen && (
  <div className="modal-overlay" style={{ zIndex: 1200 }}>
    <div className="modal-card">
      <h2>Zusätzliche Lok auswählen</h2>

      <input
  type="text"
  placeholder="Lok suchen..."
  value={addedLokSearch}
  onChange={(e) => setAddedLokSearch(e.target.value)}
  style={{ marginBottom: "10px" }}
/>

      <div className="lok-list">
        {(() => {
  const filteredLokomotives = locomotives.filter((lok) =>
    lok.name.toLowerCase().includes(addedLokSearch.toLowerCase())
  );

  if (filteredLokomotives.length === 0) {
    return <div className="sub">Keine Lok gefunden</div>;
  }

  return filteredLokomotives.map((lok) => (
    <button
      key={lok.name}
      type="button"
      onClick={() => handleSelectAddedLokFromList(lok.name)}
      className={
        addedLocoSelectedName === lok.name
          ? "lok-list-button active"
          : "lok-list-button"
      }
    >
      {lok.name}
    </button>
  ));
})()}
      </div>

      <div className="modal-actions">
        <button
  type="button"
  className="primary"
  onClick={() => {
    setAddedLocoSelectOpen(false);
    setAddedLokSearch("");
  }}
>
  Schließen
</button>
      </div>
    </div>
  </div>
)}

{addedCustomLocoOpen && (
  <div className="modal-overlay" style={{ zIndex: 1200 }}>
    <div className="modal-card">
      <h2>Zusätzliche eigene Lok</h2>

      <div className="lok-list">
        <input
  type="text"
  placeholder="Lokbezeichnung"
  value={addedCustomLocoName}
  onChange={(e) => setAddedCustomLocoName(e.target.value)}
  className={addedCustomErrors.name ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Gewicht [t]"
  value={addedCustomLocoWeight}
  onChange={(e) => setAddedCustomLocoWeight(e.target.value)}
  className={addedCustomErrors.weight ? "input-error" : ""}
/>

       <input
  type="number"
  placeholder="Bremsgewicht P [t]"
  value={addedCustomLocoBrakeP}
  onChange={(e) => setAddedCustomLocoBrakeP(e.target.value)}
  className={addedCustomErrors.brakeP ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Bremsgewicht P+E [t] (optional)"
  value={addedCustomLocoBrakePE}
  onChange={(e) => setAddedCustomLocoBrakePE(e.target.value)}
/>

        <input
  type="number"
  placeholder="Bremsgewicht G [t]"
  value={addedCustomLocoBrakeG}
  onChange={(e) => setAddedCustomLocoBrakeG(e.target.value)}
  className={addedCustomErrors.brakeG ? "input-error" : ""}
/>

        <input
  type="number"
  placeholder="Länge [m]"
  value={addedCustomLocoLength}
  onChange={(e) => setAddedCustomLocoLength(e.target.value)}
  className={addedCustomErrors.length ? "input-error" : ""}
/>

       <input
  type="number"
  placeholder="Achsenzahl"
  value={addedCustomLocoAxles}
  onChange={(e) => setAddedCustomLocoAxles(e.target.value)}
  className={addedCustomErrors.axles ? "input-error" : ""}
/>

       <input
  type="number"
  placeholder="Zul. Höchstgeschwindigkeit [km/h]"
  value={addedCustomLocoVmax}
  onChange={(e) => setAddedCustomLocoVmax(e.target.value)}
  className={addedCustomErrors.vmax ? "input-error" : ""}
/>

        <input
          type="number"
          placeholder="Festhaltekraft [kN]"
          value={addedCustomLocoFestKn}
          onChange={(e) => setAddedCustomLocoFestKn(e.target.value)}
        />
      </div>

      <div className="modal-actions">
        <button
  type="button"
  className="secondary"
  onClick={() => {
    setAddedCustomLocoOpen(false);
    setAddedCustomErrors({
      name: false,
      weight: false,
      brakeP: false,
      brakeG: false,
      length: false,
      vmax: false,
      axles: false,
    });
  }}
>
  Zurück
</button>

   <button
  type="button"
  className="primary"
  onClick={() => {
    const errors = {
      name: addedCustomLocoName.trim() === "",
      weight: Number(addedCustomLocoWeight) <= 0,
      brakeP: Number(addedCustomLocoBrakeP) <= 0,
      brakeG: Number(addedCustomLocoBrakeG) <= 0,
      length: Number(addedCustomLocoLength) <= 0,
      vmax: Number(addedCustomLocoVmax) <= 0,
      axles: Number(addedCustomLocoAxles) <= 0,
    };

    setAddedCustomErrors(errors);

    const hasError = Object.values(errors).some((e) => e);

    if (hasError) return;
    setAddedCustomErrors({
  name: false,
  weight: false,
  brakeP: false,
  brakeG: false,
  length: false,
  vmax: false,
  axles: false,
});

    setAddedCustomLocoOpen(false);

    if (Number(addedCustomLocoBrakePE) > 0) {
      setAddedDynamicBrakeEffective(null);
      setAddedDynamicBrakeModalOpen(true);
    } else {
      setAddedDynamicBrakeEffective(false);
    }
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

{dynamicBrakeModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Dynamische Bremse</h2>

      <label>Ist die dynamische Bremse wirksam?</label>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          type="button"
          className={dynamicBrakeEffective === true ? "active" : ""}
          onClick={() => setDynamicBrakeEffective(true)}
        >
          Ja
        </button>

        <button
          type="button"
          className={dynamicBrakeEffective === false ? "active" : ""}
          onClick={() => setDynamicBrakeEffective(false)}
        >
          Nein
        </button>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (dynamicBrakeEffective === null) return;
            setDynamicBrakeModalOpen(false);
          }}
        >
          Anwenden
        </button>
      </div>
    </div>
  </div>
)}

{secondDynamicBrakeModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Dynamische Bremse zweite Lok</h2>

      <label>Ist die dynamische Bremse wirksam?</label>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          type="button"
          className={secondDynamicBrakeEffective === true ? "active" : ""}
          onClick={() => setSecondDynamicBrakeEffective(true)}
        >
          Ja
        </button>

        <button
          type="button"
          className={secondDynamicBrakeEffective === false ? "active" : ""}
          onClick={() => setSecondDynamicBrakeEffective(false)}
        >
          Nein
        </button>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (secondDynamicBrakeEffective === null) return;
            setSecondDynamicBrakeModalOpen(false);
          }}
        >
          Anwenden
        </button>
      </div>
    </div>
  </div>
)}

{addedDynamicBrakeModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Dynamische Bremse zusätzliche Lok</h2>

      <label>Ist die dynamische Bremse wirksam?</label>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          type="button"
          className={addedDynamicBrakeEffective === true ? "active" : ""}
          onClick={() => setAddedDynamicBrakeEffective(true)}
        >
          Ja
        </button>

        <button
          type="button"
          className={addedDynamicBrakeEffective === false ? "active" : ""}
          onClick={() => setAddedDynamicBrakeEffective(false)}
        >
          Nein
        </button>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (addedDynamicBrakeEffective === null) return;
            setAddedDynamicBrakeModalOpen(false);
          }}
        >
          Anwenden
        </button>
      </div>
    </div>
  </div>
)}

{internationalModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Internationaler Bremszettel</h2>

      <div className="lok-list">
        <input
  type="text"
  placeholder="Aussteller-EVU"
  value={issuerEvu}
  onChange={(e) => setIssuerEvu(e.target.value)}
/>
    

          <label>Laufweg (max. 3 Länder)</label>

<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
  {availableCountries.map((country) => {
    const isSelected = selectedCountries.some(c => c.code === country.code);

    return (
      <button
        key={country.code}
        type="button"
        style={{
          padding: "8px 12px",
          borderRadius: "10px",
          border: isSelected ? "2px solid #2d6cdf" : "1px solid #ccc",
          background: isSelected ? "#e8f0ff" : "#fff",
          cursor: "pointer",
        }}
        onClick={() => {
          if (isSelected) {
            setSelectedCountries(prev => prev.filter(c => c.code !== country.code));
          } else {
            if (selectedCountries.length >= 3) return;

            setSelectedCountries(prev => [
              ...prev,
              {
                code: country.code,
                label: country.label,
              },
            ]);
          }
        }}
      >
        {country.label} ({country.code})
      </button>
    );
  })}
</div>

{selectedCountries.map((country) => (
  <div key={country.code} style={{ marginBottom: "12px" }}>
    <strong>{country.label}</strong>

  </div>
))}

<label>ETCS?</label>

<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
  <button
    type="button"
    className={etcsEnabled === true ? "active" : ""}
    onClick={() => setEtcsEnabled(true)}
  >
    Ja
  </button>

  <button
    type="button"
    className={etcsEnabled === false ? "active" : ""}
    onClick={() => {
      setEtcsEnabled(false);
      setEtcsLevel("");
    }}
  >
    Nein
  </button>
</div>

{etcsEnabled && (
  <select
    value={etcsLevel}
    onChange={(e) =>
      setEtcsLevel(e.target.value as "L0" | "L1" | "L2" | "L3" | "")
    }
  >
    <option value="">Level wählen</option>
    <option value="L0">L0</option>
    <option value="L1">L1</option>
    <option value="L2">L2</option>
    <option value="L3">L3</option>
  </select>
)}

{selectedCountries.some((country) => country.code === "87") && (
  <>
    <label>Gilt für die Strecke in Frankreich "Freinage forfaitaire"?</label>

    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <button
        type="button"
        className={freinageForfaitaire === true ? "active" : ""}
        onClick={() => setFreinageForfaitaire(true)}
      >
        Ja
      </button>

      <button
        type="button"
        className={freinageForfaitaire === false ? "active" : ""}
        onClick={() => setFreinageForfaitaire(false)}
      >
        Nein
      </button>
    </div>
  </>
)}

<label>Abfalltransport im Zug?</label>

<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
  <button
    type="button"
    className={wasteTransportPresent === true ? "active" : ""}
    onClick={() => setWasteTransportPresent(true)}
  >
    Ja
  </button>

  <button
    type="button"
    className={wasteTransportPresent === false ? "active" : ""}
    onClick={() => setWasteTransportPresent(false)}
  >
    Nein
  </button>
</div>

<label>Außergewöhnliche Sendung?</label>

<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
  <button
    type="button"
    className={exceptionalConsignment === true ? "active" : ""}
    onClick={() => setExceptionalConsignment(true)}
  >
    Ja
  </button>

  <button
    type="button"
    className={exceptionalConsignment === false ? "active" : ""}
    onClick={() => {
      setExceptionalConsignment(false);
      setBzaNumber("");
    }}
  >
    Nein
  </button>
</div>

{exceptionalConsignment && (
  <input
    type="text"
    placeholder="BZA-Nr."
    value={bzaNumber}
    onChange={(e) => setBzaNumber(e.target.value)}
  />
)}

<label>Zusätzliche Dokumente über weitere Einschr. anbei?</label>

<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
  <button
    type="button"
    className={additionalRestrictionDocs === true ? "active" : ""}
    onClick={() => setAdditionalRestrictionDocs(true)}
  >
    Ja
  </button>

  <button
    type="button"
    className={additionalRestrictionDocs === false ? "active" : ""}
    onClick={() => setAdditionalRestrictionDocs(false)}
  >
    Nein
  </button>
</div>

<label>Bemerkungen während der Fahrt</label>
<textarea
  placeholder="z.B. Personalwechsel, Besonderheiten unterwegs"
  value={remarksDuringTrip}
  onChange={(e) => setRemarksDuringTrip(e.target.value)}
/>

<label>Besonderheiten des Zuges</label>
<textarea
  placeholder="z.B. Wagen mit Reisenden besetzt"
  value={trainSpecialties}
  onChange={(e) => setTrainSpecialties(e.target.value)}
/>

       <input
  type="text"
  placeholder="Lokfahrzeugnummer"
  value={locoVehicleNumber}
  onChange={(e) => {
    setLocoVehicleNumber(formatVehicleNumberInput(e.target.value));
    setInternationalModalError(false);
  }}
  className={
    internationalModalError && locoVehicleNumber.trim() === ""
      ? "input-error"
      : ""
  }
  inputMode="numeric"
  maxLength={16}
  autoComplete="off"
/>

        <label>Bremssohlenart der Lok</label>
       <select
  value={locoSoleType}
  onChange={(e) => {
    setLocoSoleType(
      e.target.value as "F" | "D" | "L" | "LL" | "K" | ""
    );
    setInternationalModalError(false);
  }}
  className={
    internationalModalError && locoSoleType === ""
      ? "input-error"
      : ""
  }
>
          <option value="">Bitte wählen</option>
          <option value="F">F</option>
          <option value="D">D</option>
          <option value="L">L</option>
          <option value="LL">LL</option>
          <option value="K">K</option>
        </select>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setPrintMode("national");
            setInternationalModalOpen(false);
            setInternationalModalError(false);
          }}
        >
          Zurück
        </button>

       <button
  type="button"
  className="primary"
  onClick={() => {
    if (locoVehicleNumber.trim() === "" || locoSoleType === "") {
      setInternationalModalError(true);
      return;
    }

    setInternationalModalOpen(false);
  }}
>
  Anwenden
</button>
      </div>
    </div>
  </div>
)}

{legalNoticeOpen && appReady && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Rechtliche Hinweise</h2>

      <div style={{ marginBottom: "16px", lineHeight: 1.6 }}>
        <p>
          Diese App soll den Anwender bei der Erstellung von Bremszetteln unterstützen.
        </p>
        <p>
          Der Entwickler hat diese App nach bestem Wissen umgesetzt.
          Der Entwickler übernimmt jedoch keinerlei Haftung für Schäden, die ggf. durch die Nutzung der App entstehen.
          Dies beinhaltet sowohl die falsche Bedienung der App als auch eventuelle Softwarefehler.
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "16px",
    }}
  >
    <input
      type="checkbox"
      checked={dontShowLegalNoticeAgain}
      onChange={(e) => setDontShowLegalNoticeAgain(e.target.checked)}
      style={{ width: "18px", height: "18px", margin: 0 }}
    />
    <span>Nicht wieder anzeigen</span>
  </label>

  <div className="modal-actions" style={{ marginTop: 0, paddingTop: 0 }}>
    <button
      type="button"
      className="primary"
      style={{ width: "100%" }}
      onClick={() => {
        if (dontShowLegalNoticeAgain) {
          localStorage.setItem("hideLegalNotice", "true");
        }
        setLegalNoticeOpen(false);
      }}
    >
      Verstanden
    </button>
  </div>
</div>
    </div>
  </div>
)}

    </div>
  );
}

export default App;