import { PDFDocument, rgb } from "pdf-lib";

export async function createPdf(state: any) {
  const pngBytes = await fetch("/bremszettel.png").then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 1191]);

  const pngImage = await pdfDoc.embedPng(pngBytes);

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: 842,
    height: 1191,
  });

  const drawCentered = (text: string, x: number, y: number, size = 16) => {
    if (!text) return;

    const approxWidth = text.length * (size * 0.3);

    page.drawText(text, {
      x: x - approxWidth,
      y: 1191 - y,
      size,
      color: rgb(0, 0, 0),
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
  drawCentered(state.date || "", 420, 56);
  drawCentered(state.trainNumber || "", 308, 162);
  drawCentered(state.departureStation || "", 710, 163);

  // Zeile 1 Gewicht
  drawCentered(state.wagonWeightTons || "", 599, 305);
  drawCentered(state.locoWeightTons || "", 684, 305);
  drawCentered(state.totalWeightTons || "", 771, 305);

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
  drawCentered(state.missingBrakePercentage || "", 770, 439);

  // Zeile 7
  drawCentered(state.lastVehicleNumber || "", 686, 465);

  // Zeile 8–12
  drawCentered("---", 598, 493);
  drawCentered(state.multiReleaseBrakeCount || "", 598, 522);
  drawCentered("0", 598, 547);
  drawCentered(state.kLllBrakeCount || "", 598, 571);
  drawCentered("0", 598, 596);

  // Zeile 13 Länge
  drawCentered(state.wagonLengthMeters || "", 598, 619);
  drawCentered(state.locoLengthMeters || "", 682, 619);
  drawCentered(state.totalLengthMeters || "", 771, 619);

  // Zeile 16 Geschwindigkeit
  if (state.speedCheckNo) {
    strike(577, 725);
    drawCentered(state.lowerVehicleSpeedKmh || "", 582, 758);
  } else {
    strike(610, 725);
  }

  // Zeile 31 Gefahrgut
  if (state.dangerousGoodsPresent) {
    strike(586, 1027);
  } else {
    strike(621, 1028);
  }

  // Name
  drawCentered(state.issuedByName || "", 352, 1101);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], {type: "application/pdf"} );
  const url = URL.createObjectURL(blob);

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