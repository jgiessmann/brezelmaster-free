import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function wrapTextByChars(text: string, maxCharsPerLine: number): string {
  if (!text) return "";

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}

export async function createPdf(
  state: any,
  reversedState?: any,
  internationalState?: any
) {
  if (internationalState) {
    const pngBytes = await fetch("/interbremszettel.png").then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(pngBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage([842, 1191]);

    // Hintergrund (Formular)
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 842,
      height: 1191,
    });

    // Aussteller-EVU
    page.drawText(internationalState.issuerEvu || "", {
      x: 50,
      y: 1191 - 110,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Zugnummer
    page.drawText(internationalState.trainNumber || "", {
      x: 175,
      y: 1191 - 110,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Datum
    page.drawText(internationalState.date || "", {
      x: 290,
      y: 1191 - 110,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Zugnummer oben rechts
    page.drawText(internationalState.trainNumber || "", {
      x: 620,
      y: 1191 - 18,
      size: 12,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Datum oben rechts
    page.drawText(internationalState.date || "", {
      x: 756,
      y: 1191 - 18,
      size: 12,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 4a Gültig ab Bahnhof
    page.drawText(internationalState.departureStation || "", {
      x: 50,
      y: 1191 - 150,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    internationalState.countries?.slice(0, 3).forEach((country: any, index: number) => {
      const xPositions = [520, 572, 622];

      page.drawText(country.code || "", {
        x: xPositions[index],
        y: 1191 - 68,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    });

    internationalState.countries?.slice(0, 3).forEach((country: any, index: number) => {
      const xPositions = [511, 567, 617];

      page.drawText(country.trainCategory || "", {
        x: xPositions[index],
        y: 1191 - 100,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    });

    internationalState.countries?.slice(0, 3).forEach((country: any, index: number) => {
      const xPositions = [514, 567, 617];

      page.drawText(country.vmax || "", {
        x: xPositions[index],
        y: 1191 - 141,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    });

    // ETCS-Level
    page.drawText(internationalState.etcsDisplay || "", {
      x: 777,
      y: 1191 - 101,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // NTC
    page.drawText(internationalState.ntcDisplay || "", {
      x: 770,
      y: 1191 - 143,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    const wrappedRemarks = wrapTextByChars(
  internationalState.remarksDuringTrip || "",
  42
);

const wrappedVmaxRemark = wrapTextByChars(
  internationalState.vmaxRemark || "",
  42
);

let remarksY = 1191 - 210;
const lineHeight = 16;

// normale Bemerkungen (blau)
if (wrappedRemarks) {
  page.drawText(wrappedRemarks, {
    x: 45,
    y: remarksY,
    size: 14,
    font,
    color: rgb(8 / 255, 12 / 255, 218 / 255),
    lineHeight,
  });

  const remarksLineCount = wrappedRemarks.split("\n").length;

  // unter dem blauen Text eine Leerzeile Abstand
  remarksY = remarksY - remarksLineCount * lineHeight - lineHeight;
}

// Vmax-Hinweis (rot)
if (wrappedVmaxRemark) {
  page.drawText(wrappedVmaxRemark, {
    x: 45,
    y: remarksY,
    size: 14,
    font,
    color: rgb(220 / 255, 0, 0),
    lineHeight,
  });
}

    const baseText = internationalState.trainSpecialties || "";
    let yStart = 1191 - 210;

    if (baseText) {
      const wrappedBase = wrapTextByChars(baseText, 42);

      page.drawText(wrappedBase, {
        x: 393,
        y: yStart,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
        lineHeight: 16,
      });

      const lineCount = wrappedBase.split("\n").length;
      yStart = yStart - lineCount * 16 - 16;
    }

    if (internationalState.exceptionalConsignment && internationalState.bzaNumber) {
      const bzaText = `BZA-Nr.: ${internationalState.bzaNumber}`;
      const wrappedBza = wrapTextByChars(bzaText, 42);

      page.drawText(wrappedBza, {
        x: 393,
        y: yStart,
        size: 14,
        font,
        color: rgb(220 / 255, 0, 0),
        lineHeight: 16,
      });
    }

    if (internationalState.dangerousGoodsPresent) {
      page.drawText("X", {
        x: 30,
        y: 1191 - 417,
        size: 16,
        font,
        color: rgb(1, 0, 0),
      });
    }

    if (internationalState.exceptionalConsignment) {
      page.drawText("X", {
        x: 30,
        y: 1191 - 438,
        size: 16,
        font,
        color: rgb(220 / 255, 0, 0),
      });
    }

    if (internationalState.additionalRestrictionDocs) {
      page.drawText("X", {
        x: 30,
        y: 1191 - 476,
        size: 16,
        font,
        color: rgb(220 / 255, 0, 0),
      });
    }

    if (internationalState.wasteTransportPresent) {
      page.drawText("X", {
        x: 30,
        y: 1191 - 513,
        size: 16,
        font,
        color: rgb(220 / 255, 0, 0),
      });
    }

    if (internationalState.mode === "P") {
      page.drawText("X", {
        x: 140,
        y: 1191 - 723,
        size: 16,
        font,
        color: rgb(220 / 255, 0, 0),
      });
    }

    if (internationalState.mode === "G") {
      page.drawText("X", {
        x: 140,
        y: 1191 - 707,
        size: 16,
        font,
        color: rgb(220 / 255, 0, 0),
      });
    }

    // 17a erster Wagen
    page.drawText(internationalState.firstVehicleNumber || "", {
      x: 260,
      y: 1191 - 465,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 18a letzter Wagen
    page.drawText(internationalState.lastVehicleNumber || "", {
      x: 403,
      y: 1191 - 465,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 20b Wagenlänge gesamt
    page.drawText(internationalState.wagonLengthMeters || "", {
      x: 376,
      y: 1191 - 583,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 22b Wagenbremsgewicht gesamt
    page.drawText(internationalState.wagonBrakeWeightTons || "", {
      x: 376,
      y: 1191 - 640,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 23b Wagenzuggewicht gesamt
    page.drawText(internationalState.wagonWeightTons || "", {
      x: 376,
      y: 1191 - 669,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 24 Vorhandene Bremshundertstel
    page.drawText(internationalState.availableBrakePercentage || "", {
      x: 470,
      y: 1191 - 700,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 25 Erforderliche Bremshundertstel
    page.drawText(internationalState.minimumBrakePercentage || "", {
      x: 471,
      y: 1191 - 730,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - Fahrzeugnummer
    page.drawText(internationalState.firstLocoVehicleNumber || "", {
      x: 110,
      y: 1191 - 923,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - Bremssohlenart
    page.drawText(internationalState.firstLocoSoleType || "", {
      x: 500,
      y: 1191 - 923,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Überprüft von
    page.drawText(internationalState.issuedByName || "", {
      x: 450,
      y: 1191 - 1085,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 40 Erstellt von
    page.drawText("App BREZEL-Master", {
      x: 415,
      y: 1191 - 1058,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    const now = new Date();
    const timeString = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    page.drawText(timeString, {
      x: 230,
      y: 1191 - 1058,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    const dateString = new Date().toLocaleDateString("de-DE");

    page.drawText(dateString, {
      x: 70,
      y: 1191 - 1058,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    page.drawText(dateString, {
      x: 70,
      y: 1191 - 1093,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    page.drawText(timeString, {
      x: 230,
      y: 1191 - 1093,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 14 Erforderliche Streckenklasse
    const highestRouteClass = internationalState.highestRouteClass || "";
    const highestRouteClassWidth = highestRouteClass.length * 7;

    page.drawText(highestRouteClass, {
      x: 74 - highestRouteClassWidth / 2,
      y: 1191 - 748,
      size: 28,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 26 Fehlende Bremshundertstel
    page.drawText(internationalState.missingBrakePercentage || "", {
      x: 472,
      y: 1191 - 763,
      size: 14,
      font,
      color: rgb(220 / 255, 0, 0),
    });

    // Pos. 1 - 33 Lokgewicht
    page.drawText(internationalState.firstLocoWeightTons || "", {
      x: 442,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - 32 Loklänge
    page.drawText(internationalState.firstLocoLengthMeters || "", {
      x: 383,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - 36 Lokbremsgewicht
    page.drawText(internationalState.firstLocoBrakeWeightTons || "", {
      x: 583,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 22a+b Gesamtbremsgewicht
    page.drawText(internationalState.totalBrakeWeightTons || "", {
      x: 468,
      y: 1191 - 640,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - 35 Bremsstellung
    page.drawText(internationalState.firstLocoMode || "", {
      x: 543,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - 31 Anzahl der Radsätze
    page.drawText(internationalState.firstLocoAxles || "", {
      x: 332,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 1 - 30 Baureihe / Lokbezeichnung
    page.drawText(internationalState.firstLocoName || "", {
      x: 259,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // Pos. 2 - zweite Lok bei Doppeltraktion oder Richtungswechsel
    if (
      internationalState.secondLocoVehicleNumber &&
      (internationalState.doubleTraction || internationalState.directionChange)
    ) {
      page.drawText(internationalState.secondLocoVehicleNumber || "", {
        x: 110,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoName || "", {
        x: 259,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoAxles || "", {
        x: 332,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoLengthMeters || "", {
        x: 383,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoWeightTons || "", {
        x: 442,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoSoleType || "", {
        x: 500,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoMode || "", {
        x: 543,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoBrakeWeightTons || "", {
        x: 583,
        y: 1191 - 945,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });

      page.drawText(internationalState.secondLocoRemark || "", {
        x: 675,
        y: 1191 - 945,
        size: 12,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 23 Gesamtzuggewicht (Lok + Wagen)
    page.drawText(internationalState.totalWeightTons || "", {
      x: 468,
      y: 1191 - 670,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 23a Lokgewicht / Summe arbeitende Tfz oben
    page.drawText(internationalState.locoWeightTons || "", {
      x: 285,
      y: 1191 - 670,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 22a Bremsgewicht Lok / Summe arbeitende Tfz oben
    page.drawText(internationalState.locoBrakeWeightTons || "", {
      x: 285,
      y: 1191 - 640,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 20a Loklänge / Summe arbeitende Tfz oben
    page.drawText(internationalState.locoLengthMeters || "", {
      x: 285,
      y: 1191 - 583,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 20a+b Gesamtlänge Zug
    page.drawText(internationalState.totalLengthMeters || "", {
      x: 466,
      y: 1191 - 583,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 19a Anzahl der arbeitenden Loks
    page.drawText(internationalState.workingLocoCount || "1", {
      x: 290,
      y: 1191 - 552,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 19b Anzahl der Wagen
    page.drawText(internationalState.wagonCount || "", {
      x: 383,
      y: 1191 - 552,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 19a+b Summe aller Fahrzeuge
    page.drawText(internationalState.totalVehicleCount || "", {
      x: 469,
      y: 1191 - 552,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeLocoCount || "", {
        x: 572,
        y: 1191 - 552,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.wagonCount || "", {
        x: 665,
        y: 1191 - 552,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeTotalVehicleCount || "", {
        x: 753,
        y: 1191 - 552,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeLocoLengthMeters || "", {
        x: 572,
        y: 1191 - 583,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.wagonLengthMeters || "", {
        x: 660,
        y: 1191 - 583,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeTotalLengthMeters || "", {
        x: 750,
        y: 1191 - 583,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeLocoBrakeWeightTons || "", {
        x: 572,
        y: 1191 - 640,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.wagonBrakeWeightTons || "", {
        x: 660,
        y: 1191 - 640,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeTotalBrakeWeightTons || "", {
        x: 750,
        y: 1191 - 640,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeLocoWeightTons || "", {
        x: 572,
        y: 1191 - 670,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.wagonWeightTons || "", {
        x: 660,
        y: 1191 - 670,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeTotalWeightTons || "", {
        x: 750,
        y: 1191 - 670,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 16a Gültig ab Bahnhof
    page.drawText(internationalState.departureStation || "", {
      x: 255,
      y: 1191 - 424,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 4b Gültig bis Bahnhof
    page.drawText(internationalState.destinationStation || "", {
      x: 240,
      y: 1191 - 150,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 16b Gültig bis Bahnhof
    page.drawText(
      internationalState.directionChange && internationalState.directionChangeStation
        ? internationalState.directionChangeStation
        : internationalState.destinationStation || "",
      {
        x: 400,
        y: 1191 - 424,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      }
    );

    // 16c Gültig ab Bahnhof
    if (internationalState.directionChange && internationalState.directionChangeStation) {
      page.drawText(internationalState.directionChangeStation || "", {
        x: 540,
        y: 1191 - 424,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 16d Gültig bis Bahnhof
    if (internationalState.directionChange) {
      page.drawText(internationalState.destinationStation || "", {
        x: 680,
        y: 1191 - 424,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 17c
    if (internationalState.directionChange) {
      page.drawText(internationalState.lastVehicleNumber || "", {
        x: 540,
        y: 1191 - 465,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 18c
    if (internationalState.directionChange) {
      page.drawText(internationalState.firstVehicleNumber || "", {
        x: 680,
        y: 1191 - 465,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 24 rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeAvailableBrakePercentage || "", {
        x: 750,
        y: 1191 - 700,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 25 rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.minimumBrakePercentage || "", {
        x: 753,
        y: 1191 - 730,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 26 rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeMissingBrakePercentage || "", {
        x: 753,
        y: 1191 - 763,
        size: 14,
        font,
        color: rgb(220 / 255, 0, 0),
      });
    }

    // 21b Wagenzug
    page.drawText(internationalState.wagonFestKn || "", {
      x: 377,
      y: 1191 - 612,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 21d Wagenzug rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeWagonFestKn || "", {
        x: 659,
        y: 1191 - 612,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 21a arbeitende Tfz oben
    page.drawText(internationalState.locoFestKn || "", {
      x: 285,
      y: 1191 - 612,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 21a+b gesamt oben
    page.drawText(internationalState.totalFestKn || "", {
      x: 468,
      y: 1191 - 612,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 21c rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeLocoFestKn || "", {
        x: 572,
        y: 1191 - 612,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // 21c+d rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.directionChangeTotalFestKn || "", {
        x: 750,
        y: 1191 - 612,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    // Kreuz bei kN in Feld 21
    page.drawText("X", {
      x: 176,
      y: 1191 - 618,
      size: 12,
      font,
      color: rgb(1, 0, 0),
    });

    // Feld 36a - kN immer ankreuzen
    page.drawText("X", {
      x: 651,
      y: 1191 - 905,
      size: 10,
      font,
      color: rgb(1, 0, 0),
    });

    // 36a Pos. 1 Festhaltekraft Einzellok
    page.drawText(internationalState.firstLocoFestKn || "", {
      x: 630,
      y: 1191 - 924,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    page.drawText(internationalState.firstLocoRemark || "", {
  x: 675,
  y: 1191 - 924,
  size: 12,
  font,
  color: rgb(8 / 255, 12 / 255, 218 / 255),
});

    // 36a Pos. 2 Festhaltekraft zweite Lok
    page.drawText(internationalState.secondLocoFestKn || "", {
      x: 630,
      y: 1191 - 945,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 27 links
    page.drawText(internationalState.fSoleBrakeWeightTons || "", {
      x: 470,
      y: 1191 - 792,
      size: 14,
      font,
      color: rgb(8 / 255, 12 / 255, 218 / 255),
    });

    // 27 rechts
    if (internationalState.directionChange) {
      page.drawText(internationalState.fSoleBrakeWeightTons || "", {
        x: 753,
        y: 1191 - 792,
        size: 14,
        font,
        color: rgb(8 / 255, 12 / 255, 218 / 255),
      });
    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    return;
  }

  const pngBytes = await fetch("/bremszettel.png").then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pngImage = await pdfDoc.embedPng(pngBytes);

  const drawPage = (page: any, state: any) => {
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

    drawCentered(state.date || "", 420, 60);
    drawCentered(state.trainNumber || "", 308, 167);

    const abBhf =
      state.directionChange && state.directionChangeStation.trim() !== ""
        ? state.departureStation
        : state.zugStart
        ? ""
        : state.departureStation;

    drawCentered(abBhf || "", 713, 166);

    drawCentered(state.wagonWeightTons || "", 599, 308);
    drawCentered(state.locoWeightTons || "", 684, 308);
    drawCentered(state.totalWeightTons || "", 771, 308);

    drawCentered(state.wagonBrakeWeightTons || "", 599, 330);
    drawCentered(state.locoBrakeWeightTons || "", 684, 330);
    drawCentered(state.totalBrakeWeightTons || "", 771, 330);

    drawCentered(state.wagonAxles || "", 599, 353);
    drawCentered(state.locoAxles || "", 684, 353);
    drawCentered(state.totalAxles || "", 771, 353);

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

    drawCentered(state.lastVehicleNumber || "", 689, 468);

    drawCentered("0", 598, 500);
    drawCentered(state.multiReleaseBrakeCount || "", 598, 525);
    drawCentered("0", 598, 550);
    drawCentered(state.kLllBrakeCount || "", 598, 574);
    drawCentered("0", 598, 597);

    drawCentered(state.wagonLengthMeters || "", 598, 619);
    drawCentered(state.locoLengthMeters || "", 682, 619);
    drawCentered(state.totalLengthMeters || "", 771, 619);

    const lokVmax = Number(state.lokVmax || 0);
    const fahrplanVmax = Number(state.fahrplanVmax || 0);
    const wagenVmax = Number(state.lowerSpeedKmh || 999);

    const lokZuLangsam = lokVmax > 0 && fahrplanVmax > 0 && lokVmax < fahrplanVmax;
    const wagenZuLangsam = !!state.speedCheckNo;
    const gesamtVmax = Math.min(lokVmax || 999, wagenVmax || 999);
    const gesamtZuLangsam = lokZuLangsam || wagenZuLangsam;

    if (lokZuLangsam) {
      strike(661, 726);
      drawCentered(String(lokVmax), 667, 763, 18, true, true);
    } else {
      strike(698, 726);
    }

    if (wagenZuLangsam) {
      strike(577, 725);
      drawCentered(
        state.lowerSpeedKmh || "",
        582,
        763,
        18,
        (state.lowerSpeedKmh || "") !== "",
        (state.lowerSpeedKmh || "") !== ""
      );
    } else {
      strike(610, 725);
    }

    if (gesamtZuLangsam) {
      strike(747, 726);
      drawCentered(String(gesamtVmax), 750, 763, 18, true, true);
    } else {
      strike(782, 726);
    }

    if (state.dangerousGoodsPresent) {
      strike(586, 1027);
    } else {
      strike(621, 1028);
    }

    drawCentered(state.issuedByName || "", 352, 1106);
  };

  const firstPage = pdfDoc.addPage([842, 1191]);
  drawPage(firstPage, state);

  if (reversedState) {
    const secondPage = pdfDoc.addPage([842, 1191]);
    drawPage(secondPage, reversedState);
  }

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes as unknown as BlobPart], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}