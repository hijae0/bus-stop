
import { GoogleGenAI } from "@google/genai";
import { BusStopInfo } from "../types";

export const fetchBusStopData = async (stopId: string): Promise<{ stop: BusStopInfo, sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Find the exact GPS coordinates (latitude, longitude) and the official name for the South Korean bus stop with ID "${stopId}". 
  Provide the information in JSON format with the following keys: name, latitude, longitude, city. 
  If the ID is partially incomplete or standard (like 5 digits), find the most likely match.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const data = JSON.parse(text);
    
    return {
      stop: {
        id: stopId,
        name: data.name || "Unknown Stop",
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        city: data.city || "Unknown City",
        description: data.description
      },
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch bus stop data. Please check the ID.");
  }
};
