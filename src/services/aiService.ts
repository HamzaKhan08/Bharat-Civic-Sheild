import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  credibilityScore: number;
  classification: 'Real' | 'Misleading' | 'Satire' | 'Manipulated' | 'Outdated' | 'Partially True' | 'False';
  reasoning: string;
  confidence: number;
  sources: string[];
  suspiciousSegments: string[];
  communalTone: boolean;
  hateSpeechDetected: boolean;
  // New detailed fields
  claimExtraction: string[];
  ideologicalFraming: {
    politicalBias: string;
    religiousBias: string;
    propagandaPatterns: string[];
  };
  sentimentPolarity: string;
  communalIntensityScore: number; // 0-100
  rhetoricalPatterns: string[];
  logicalFallacies: string[];
  timelineVerification: string;
  detectedLanguage: string;
}

export async function analyzeContent(content: string, targetLanguage: string): Promise<AnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are Bharat Civic Shield AI, a specialized misinformation detection system for the Indian context.
    Analyze the provided content for fake news, communal incitement, hate speech, and manipulation.
    
    CRITICAL: 
    1. Detect the language of the input content.
    2. Provide the entire analysis in the user's selected target language: ${targetLanguage}.
    
    Output must be a JSON object with the following schema:
    {
      "credibilityScore": number (0-100),
      "classification": "Real" | "Misleading" | "Satire" | "Manipulated" | "Outdated" | "Partially True" | "False",
      "reasoning": "Detailed explanation in ${targetLanguage}",
      "confidence": number (0-100),
      "sources": ["List of verified sources or types of sources to check"],
      "suspiciousSegments": ["Specific parts of text that are problematic"],
      "communalTone": boolean,
      "hateSpeechDetected": boolean,
      "claimExtraction": ["List of core claims found in text"],
      "ideologicalFraming": {
        "politicalBias": "Description of political bias if any",
        "religiousBias": "Description of religious bias if any",
        "propagandaPatterns": ["List of propaganda techniques used"]
      },
      "sentimentPolarity": "Positive/Negative/Neutral with nuance",
      "communalIntensityScore": number (0-100),
      "rhetoricalPatterns": ["List of rhetorical manipulation patterns"],
      "logicalFallacies": ["List of logical fallacies detected"],
      "timelineVerification": "Analysis of whether the content is outdated or current",
      "detectedLanguage": "The language detected in the input"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: content,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            credibilityScore: { type: Type.NUMBER },
            classification: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
            suspiciousSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
            communalTone: { type: Type.BOOLEAN },
            hateSpeechDetected: { type: Type.BOOLEAN },
            claimExtraction: { type: Type.ARRAY, items: { type: Type.STRING } },
            ideologicalFraming: {
              type: Type.OBJECT,
              properties: {
                politicalBias: { type: Type.STRING },
                religiousBias: { type: Type.STRING },
                propagandaPatterns: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["politicalBias", "religiousBias", "propagandaPatterns"]
            },
            sentimentPolarity: { type: Type.STRING },
            communalIntensityScore: { type: Type.NUMBER },
            rhetoricalPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            logicalFallacies: { type: Type.ARRAY, items: { type: Type.STRING } },
            timelineVerification: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING }
          },
          required: [
            "credibilityScore", "classification", "reasoning", "confidence", 
            "sources", "suspiciousSegments", "communalTone", "hateSpeechDetected",
            "claimExtraction", "ideologicalFraming", "sentimentPolarity", 
            "communalIntensityScore", "rhetoricalPatterns", "logicalFallacies", 
            "timelineVerification", "detectedLanguage"
          ]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze content");
  }
}
