import { useEffect, useRef, useState } from "react";
import { createPdf } from "./pdfUtils";
import { extractPdfText, parseTrainCheckerText, type ParsedSummary } from "./parser";
type InternationalCountry = {
  code: string;
  label: string;
  trainCategory: string;
  vmax: string;
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

  function updateTimetableSpeedFromCountries(countries: InternationalCountry[]) {
  const vmaxValues = countries
    .map((country) => Number(country.vmax))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (vmaxValues.length === 0) return;

  const maxVmax = Math.max(...vmaxValues);
  setTimetableSpeedInput(String(maxVmax));
}

const [addLocoAtStation, setAddLocoAtStation] = useState(false);
const [addLocoModalOpen, setAddLocoModalOpen] = useState(false);

const [addLocoStation, setAddLocoStation] = useState("");

const [addedLocoSelectedType, setAddedLocoSelectedType] = useState<"list" | "custom">("list");
const [addedLocoSelectedName, setAddedLocoSelectedName] = useState("G1206");
const [addedLocoSelectOpen, setAddedLocoSelectOpen] = useState(false);
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
  const locomotives = [
  {
    name: "G1206",
    weightTons: 88,
    brakeWeightP: 88,
    brakeWeightG: 75,
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
    lengthMeters: 17,
    vmax: 120,
    axles: 4,
    festKn: 41,
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
const [customLokFestKn, setCustomLokFestKn] = useState("");
const [secondCustomLokFestKn, setSecondCustomLokFestKn] = useState("");
const [directionModalOpen, setDirectionModalOpen] = useState(false);

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

  const locoBrakeWeight = determineLocoBrakeWeight(
  activeLok,
  parsedSummary.totalWeightTons,
  parsedSummary.totalLengthMeters,
  mode
);

const secondLocoBrakeWeight =
  tractionSecondLok
    ? determineLocoBrakeWeight(
        tractionSecondLok,
        parsedSummary.totalWeightTons,
        parsedSummary.totalLengthMeters,
        mode
      )
    : 0;

    const addedLocoBrakeWeight =
  addedActiveLok
    ? determineLocoBrakeWeight(
        addedActiveLok,
        parsedSummary.totalWeightTons,
        parsedSummary.totalLengthMeters,
        mode
      )
    : 0;

const addedLocoFestKn =
  addedActiveLok ? addedActiveLok.festKn || 0 : 0;



    const firstLocoStaysAfterDirectionChange =
  !(doubleTraction &&
    directionChange &&
    reduceToOneLocoAfterDirectionChange &&
    removedLocoAfterDirectionChange === "loco1");

const secondLocoStaysAfterDirectionChange =
  tractionSecondLok
    ? !(doubleTraction &&
        directionChange &&
        reduceToOneLocoAfterDirectionChange &&
        removedLocoAfterDirectionChange === "loco2")
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

  const directionChangeLocoCount =
  (firstLocoStaysAfterDirectionChange ? 1 : 0) +
  (secondLocoStaysAfterDirectionChange ? 1 : 0);

const directionChangeLocoWeight =
  (firstLocoStaysAfterDirectionChange ? activeLok.weightTons : 0) +
  (secondLocoStaysAfterDirectionChange && tractionSecondLok ? tractionSecondLok.weightTons : 0);

const directionChangeLocoBrakeWeight =
  (firstLocoStaysAfterDirectionChange ? locoBrakeWeight : 0) +
  (secondLocoStaysAfterDirectionChange && tractionSecondLok ? secondLocoBrakeWeight : 0);

const directionChangeLocoLength =
  (firstLocoStaysAfterDirectionChange ? activeLok.lengthMeters : 0) +
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

const directionChangeLocoFestKn =
  (firstLocoStaysAfterDirectionChange ? locoFestKn : 0) +
  (secondLocoStaysAfterDirectionChange && tractionSecondLok ? secondLocoFestKn : 0);

const directionChangeTotalFestKn =
  parsedSummary.totalFestKn + directionChangeLocoFestKn;

  let stateToGenerate: any = null;
let reversedStateToGenerate: any = null;

if (printMode === "international") {
  const internationalState = {
    issuerEvu,
    countries: selectedCountries,
    etcsDisplay,
    ntcDisplay,
    dangerousGoodsPresent: parsedSummary.dangerousGoodsPresent,
    wasteTransportPresent,
    exceptionalConsignment,
    doubleTraction,

    firstVehicleNumber: parsedSummary.firstVehicleNumber,
    lastVehicleNumber: parsedSummary.lastVehicleNumber,

    bzaNumber,
    remarksDuringTrip,
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
    secondLocoMode: mode,
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
  directionChange &&
  reduceToOneLocoAfterDirectionChange &&
  removedLocoAfterDirectionChange === "loco1" &&
  directionStation.trim() !== ""
    ? `nur bis ${directionStation}`
    : "",

secondLocoRemark:
  doubleTraction &&
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
firstLocoMode: mode,
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
  printMode === "international" && addLocoAtStation;

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
              setAddedCustomLocoFestKn("");
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

{secondLokSelectOpen && (
  <div className="modal-overlay" style={{ zIndex: 1100 }}>
    <div className="modal-card">
      <h2>Zweite Lok auswählen</h2>

      <div className="lok-list">
        {locomotives.map((lok) => (
          <button
            key={lok.name}
            type="button"
            onClick={() => setSecondSelectedLokName(lok.name)}
            className={
              secondSelectedLokName === lok.name
                ? "lok-list-button active"
                : "lok-list-button"
            }
          >
            {lok.name}
          </button>
        ))}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="primary"
          onClick={() => setSecondLokSelectOpen(false)}
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
        />

        <input
          type="number"
          placeholder="Gewicht [t]"
          value={secondCustomLokWeight}
          onChange={(e) => setSecondCustomLokWeight(e.target.value)}
        />

        <input
          type="number"
          placeholder="Bremsgewicht P [t]"
          value={secondCustomLokBrakeP}
          onChange={(e) => setSecondCustomLokBrakeP(e.target.value)}
        />

        <input
          type="number"
          placeholder="Bremsgewicht G [t]"
          value={secondCustomLokBrakeG}
          onChange={(e) => setSecondCustomLokBrakeG(e.target.value)}
        />

        <input
          type="number"
          placeholder="Länge [m]"
          value={secondCustomLokLength}
          onChange={(e) => setSecondCustomLokLength(e.target.value)}
        />

        <input
          type="number"
          placeholder="Achsenzahl"
          value={secondCustomLokAxles}
          onChange={(e) => setSecondCustomLokAxles(e.target.value)}
        />

        <input
          type="number"
          placeholder="Zul. Höchstgeschwindigkeit [km/h]"
          value={secondCustomLokVmax}
          onChange={(e) => setSecondCustomLokVmax(e.target.value)}
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
          onClick={() => setSecondCustomLokOpen(false)}
        >
          Zurück
        </button>

        <button
          type="button"
          className="primary"
          onClick={() => setSecondCustomLokOpen(false)}
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
  setSecondSelectedLok("list");
  setSecondSelectedLokName("G1206");
  setSecondCustomLokName("");
  setSecondCustomLokWeight("");
  setSecondCustomLokBrakeP("");
  setSecondCustomLokBrakeG("");
  setSecondCustomLokLength("");
  setSecondCustomLokVmax("");
  setSecondCustomLokAxles("");
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
  onChange={(e) =>
    setSecondLocoVehicleNumber(formatVehicleNumberInput(e.target.value))
  }
  style={{ marginTop: "12px" }}
  inputMode="numeric"
  maxLength={16}
  autoComplete="off"
/>

    <select
      value={secondLocoSoleType}
      onChange={(e) =>
        setSecondLocoSoleType(
          e.target.value as "F" | "D" | "L" | "LL" | "K" | ""
        )
      }
      style={{ marginTop: "12px" }}
    >
      <option value="">Bremssohlenart zweite Lok</option>
      <option value="F">F</option>
      <option value="D">D</option>
      <option value="L">L</option>
      <option value="LL">LL</option>
      <option value="K">K</option>
    </select>

    <select
      value={secondLocoInsertPosition}
      onChange={(e) => {
        setSecondLocoInsertPosition(e.target.value as "1" | "2" | "");
        setSecondLocoInsertPositionError(false);
      }}
      className={secondLocoInsertPositionError ? "input-error" : ""}
      style={{ marginTop: "12px" }}
    >
      <option value="">Position der zweiten Lok nach Richtungswechsel</option>
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
  className={doubleTractionModalError ? "input-error" : ""}
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
          className={doubleTractionModalError ? "input-error" : ""}
        >
          <option value="">Bremssohlenart zweite Lok</option>
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

        <select
          value={addedLocoInsertPosition}
          onChange={(e) => {
            setAddedLocoInsertPosition(e.target.value as "1" | "2" | "");
            setAddLocoModalError(false);
          }}
          style={{ marginTop: "12px" }}
          className={addLocoModalError && addedLocoInsertPosition === "" ? "input-error" : ""}
        >
          <option value="">Position der zusätzlichen Lok ab Unterwegsbahnhof</option>
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
            setAddedCustomLocoFestKn("");
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

      <div className="lok-list">
        {locomotives.map((lok) => (
          <button
            key={lok.name}
            type="button"
            onClick={() => setAddedLocoSelectedName(lok.name)}
            className={
              addedLocoSelectedName === lok.name
                ? "lok-list-button active"
                : "lok-list-button"
            }
          >
            {lok.name}
          </button>
        ))}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="primary"
          onClick={() => setAddedLocoSelectOpen(false)}
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
        />

        <input
          type="number"
          placeholder="Gewicht [t]"
          value={addedCustomLocoWeight}
          onChange={(e) => setAddedCustomLocoWeight(e.target.value)}
        />

        <input
          type="number"
          placeholder="Bremsgewicht P [t]"
          value={addedCustomLocoBrakeP}
          onChange={(e) => setAddedCustomLocoBrakeP(e.target.value)}
        />

        <input
          type="number"
          placeholder="Bremsgewicht G [t]"
          value={addedCustomLocoBrakeG}
          onChange={(e) => setAddedCustomLocoBrakeG(e.target.value)}
        />

        <input
          type="number"
          placeholder="Länge [m]"
          value={addedCustomLocoLength}
          onChange={(e) => setAddedCustomLocoLength(e.target.value)}
        />

        <input
          type="number"
          placeholder="Achsenzahl"
          value={addedCustomLocoAxles}
          onChange={(e) => setAddedCustomLocoAxles(e.target.value)}
        />

        <input
          type="number"
          placeholder="Zul. Höchstgeschwindigkeit [km/h]"
          value={addedCustomLocoVmax}
          onChange={(e) => setAddedCustomLocoVmax(e.target.value)}
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
          onClick={() => setAddedCustomLocoOpen(false)}
        >
          Zurück
        </button>

        <button
          type="button"
          className="primary"
          onClick={() => setAddedCustomLocoOpen(false)}
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
                trainCategory: "",
                vmax: "",
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

{selectedCountries.map((country, index) => (
  <div key={country.code} style={{ marginBottom: "12px" }}>
    <strong>{country.label}</strong>

    <input
      type="text"
      placeholder="Zugkategorie"
      value={country.trainCategory}
      onChange={(e) => {
        const updated = [...selectedCountries];
        updated[index].trainCategory = e.target.value;
        setSelectedCountries(updated);
      }}
    />

    <input
      type="number"
      placeholder="Vmax (km/h)"
      value={country.vmax}
      onChange={(e) => {
        const updated = [...selectedCountries];
        updated[index].vmax = e.target.value;
        setSelectedCountries(updated);
        updateTimetableSpeedFromCountries(updated);
      }}
    />
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
  onChange={(e) => setLocoVehicleNumber(formatVehicleNumberInput(e.target.value))}
  inputMode="numeric"
  maxLength={16}
  autoComplete="off"
/>

        <label>Bremssohlenart der Lok</label>
        <select
          value={locoSoleType}
          onChange={(e) =>
            setLocoSoleType(
              e.target.value as "F" | "D" | "L" | "LL" | "K" | ""
            )
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
          }}
        >
          Zurück
        </button>

        <button
          type="button"
          className="primary"
          onClick={() => {
            setInternationalModalOpen(false);
          }}
        >
          Anwenden
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default App;