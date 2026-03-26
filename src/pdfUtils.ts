import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function createPdf(state: any) {
  
  const pngBytes = await fetch("/bremszettel.png").then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 1191]);
  const font = await
  pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await
  pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pngImage = await pdfDoc.embedPng(pngBytes);

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: 842,
    height: 1191,
  });

  const drawCentered = (
  text: string,
  x: number,
  y: number,
  size = 18,
  isRed = false,
  isBold = false
) => {
  if (!text) return;

  const approxWidth = text.length * (size * 0.3);

  page.drawText(text, {
    x: x - approxWidth,
    y: 1191 - y,
    size,
    font: isBold ? boldFont : font,
    color: isRed ? rgb(1, 0, 0) : rgb(0, 0, 0),
  });
};

  const strike = (x: number, y: number) => {
    page.drawLine({
      start: { x: x - 12, y: 1191 - (y - 7) },
      end: { x: x + 12, y: 1191 - (y + 7) },
      thickness: 2,
      color: rgb(0, 0, 0),
    });
  };

  // Kopf
  drawCentered(state.date || "", 420, 60);
  drawCentered(state.trainNumber || "", 308, 167);


  const abBhf = state.zugStart ? "" :
  state.departureStation;
  
  drawCentered(abBhf || "", 713, 166);

  // Zeile 1 Gewicht
  drawCentered(state.wagonWeightTons || "", 599, 308);
  drawCentered(state.locoWeightTons || "", 684, 308);
  drawCentered(state.totalWeightTons || "", 771, 308);

  // Zeile 2 Bremsgewicht
  drawCentered(state.wagonBrakeWeightTons || "", 599, 330);
  drawCentered(state.locoBrakeWeightTons || "", 684, 330);
  drawCentered(state.totalBrakeWeightTons || "", 771, 330);

  // Zeile 3 Achsen
  drawCentered(state.wagonAxles || "", 599, 353);
  drawCentered(state.locoAxles || "", 684, 353);
  drawCentered(state.totalAxles || "", 771, 353);

  // Zeile 4–6
  drawCentered(state.minimumBrakePercentage || "", 771, 378);
  drawCentered(state.availableBrakePercentage || "", 770, 408);
  drawCentered(
  state.missingBrakePercentage || "",
  770,
  439,
  18,
  (state.missingBrakePercentage || "") !== "",
  (state.missingBrakePercentage || "") !== ""
);

  // Zeile 7
  drawCentered(state.lastVehicleNumber || "", 689, 468);

  // Zeile 8–12
  drawCentered("0", 598, 500);
  drawCentered(state.multiReleaseBrakeCount || "", 598, 525);
  drawCentered("0", 598, 550);
  drawCentered(state.kLllBrakeCount || "", 598, 574);
  drawCentered("0", 598, 597);

  // Zeile 13 Länge
  drawCentered(state.wagonLengthMeters || "", 598, 619);
  drawCentered(state.locoLengthMeters || "", 682, 619);
  drawCentered(state.totalLengthMeters || "", 771, 619);

  // Zeile 16 Geschwindigkeit
const lokVmax = Number(state.lokVmax || 0);
const fahrplanVmax = Number(state.fahrplanVmax || 0);
const wagenVmax = Number(state.lowerSpeedKmh || 999);

const lokZuLangsam = lokVmax > 0 && fahrplanVmax > 0 && lokVmax < fahrplanVmax;
const wagenZuLangsam = !!state.speedCheckNo;
const gesamtVmax = Math.min(lokVmax || 999, wagenVmax || 999);
const gesamtZuLangsam = lokZuLangsam || wagenZuLangsam;

// Spalte Lok
if (lokZuLangsam) {
  strike(661, 726); // Lok Nein
  drawCentered(String(lokVmax), 667, 763, 18, true, true);
} else {
  strike(698, 726); // Lok Ja
}

// Spalte Wagenzug
if (wagenZuLangsam) {
  strike(577, 725); // Wagenzug Nein
  drawCentered(
    state.lowerSpeedKmh || "",
    582,
    763,
    18,
    (state.lowerSpeedKmh || "") !== "",
    (state.lowerSpeedKmh || "") !== ""
  );
} else {
  strike(610, 725); // Wagenzug Ja
}

// Spalte Gesamtzug
if (gesamtZuLangsam) {
  strike(747, 726); // Gesamt Nein
  drawCentered(String(gesamtVmax), 750, 763, 18, true, true);
} else {
  strike(782, 726); // Gesamt Ja
}

  // Zeile 31 Gefahrgut
  if (state.dangerousGoodsPresent) {
    strike(586, 1027);
  } else {
    strike(621, 1028);
  }

  // Name
  drawCentered(state.issuedByName || "", 352, 1106);

 
// PDF erzeugen
const pdfBytes = await pdfDoc.save();

// Blob erstellen
const blob = new Blob([pdfBytes as unknown as BlobPart], {
  type: "application/pdf",
});

// URL erzeugen
const url = URL.createObjectURL(blob);

// PDF im neuen Tab öffnen (stabilste Lösung)
window.open(url, "_blank");
  

}