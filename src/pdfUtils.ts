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

  //Datum bauen
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = 
  String(now.getFullYear()).slice(-2);

  //Dateiname
  const fileName = `brezel_$
  {state.trainNumber || "unbekannt"}_${day}$
  {month}${year}.pdf`;

  // Neuer Vorschau-Tab mit eigenem Speichern-Button
const previewWindow = window.open("", "_blank");

if (!previewWindow) {
  alert("Popup blockiert. Bitte Popups für diese Seite erlauben.");
  return;
}

previewWindow.document.write(`
  <!DOCTYPE html>
  <html lang="de">
    <head>
      <meta charset="UTF-8" />
      <title>${fileName}</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f3f3f3;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: #6E53B3;
          color: white;
          box-sizing: border-box;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        button {
          background: white;
          color: #6E53B3;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        }
        iframe {
          width: 100%;
          height: calc(100vh - 60px);
          border: none;
          display: block;
          background: white;
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <div class="title">${fileName}</div>
        <div class="actions">
          <button id="saveBtn">PDF speichern</button>
        </div>
      </div>
      <iframe src="${url}"></iframe>

      <script>
        const pdfUrl = ${JSON.stringify(url)};
        const downloadName = ${JSON.stringify(fileName)};

        document.getElementById("saveBtn").addEventListener("click", () => {
          const a = document.createElement("a");
          a.href = pdfUrl;
          a.download = downloadName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      </script>
    </body>
  </html>
`);

previewWindow.document.close()
  

}