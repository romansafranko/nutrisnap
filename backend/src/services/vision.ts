import axios from "axios";

const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

/**
 * Pošle obrázok (buffer) na Google Cloud Vision API
 * a vráti zoznam rozpoznaných labelov (napr. ["pizza", "salad", "cheese"])
 */
export async function detectFoodLabels(imageBuffer: Buffer): Promise<string[]> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("Chýba GOOGLE_VISION_API_KEY v .env");

  const base64Image = imageBuffer.toString("base64");

  const response = await axios.post(
    `${VISION_API_URL}?key=${apiKey}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: "LABEL_DETECTION", maxResults: 15 },
            { type: "OBJECT_LOCALIZATION", maxResults: 10 },
          ],
        },
      ],
    }
  );

  const labels: string[] = [];
  const annotations = response.data.responses[0];

  // Zozbieraj label annotations
  if (annotations.labelAnnotations) {
    for (const label of annotations.labelAnnotations) {
      // Filtruj len relevantné food labely s vysokou istotou
      if (label.score > 0.7) {
        labels.push(label.description.toLowerCase());
      }
    }
  }

  // Zozbieraj object localization
  if (annotations.localizedObjectAnnotations) {
    for (const obj of annotations.localizedObjectAnnotations) {
      if (obj.score > 0.7) {
        labels.push(obj.name.toLowerCase());
      }
    }
  }

  // Odstráň duplicity
  return [...new Set(labels)];
}
