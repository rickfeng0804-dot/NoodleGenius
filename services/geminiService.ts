import { GoogleGenAI } from "@google/genai";
import { RawMenuResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseMenuImage = async (base64Image: string): Promise<RawMenuResponse | null> => {
  try {
    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, the API is generally flexible
              data: base64Data
            }
          },
          {
            text: `You are an expert menu parser. Analyze the provided image of a restaurant menu. 
            Extract all menu categories and items into a structured JSON format.
            
            Return ONLY a valid JSON object with the following structure:
            {
              "categories": [
                {
                  "name": "Category Name (e.g. Noodles, Side Dishes)",
                  "items": [
                    {
                      "name": "Item Name",
                      "price": 100 (number only),
                      "description": "Short description if available",
                      "recommended": true/false (if marked as popular/recommended)
                    }
                  ]
                }
              ]
            }
            
            Do not include any markdown formatting (like \`\`\`json). Just the raw JSON string.`
          }
        ]
      }
    });

    const text = response.text || '';
    // Clean up potential markdown code blocks if the model adds them despite instructions
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString) as RawMenuResponse;
  } catch (error) {
    console.error("Error parsing menu with Gemini:", error);
    return null;
  }
};