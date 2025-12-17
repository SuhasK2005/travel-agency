import { type ActionFunctionArgs, data } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToJson } from "~/lib/utils";
import { appwriteConfig, database } from "~/appwrite/client";
import { ID } from "appwrite";

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId,
  } = await request.json();

  const geminiKey = process.env.GEMINI_API_KEY;
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!geminiKey) {
    console.error("GEMINI_API_KEY is not set");
    return data(
      {
        error: "Server configuration error",
        message: "GEMINI_API_KEY not configured",
      },
      { status: 500 }
    );
  }

  if (!unsplashApiKey) {
    console.error("UNSPLASH_ACCESS_KEY is not set");
    return data(
      {
        error: "Server configuration error",
        message: "UNSPLASH_ACCESS_KEY not configured",
      },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(geminiKey);

  try {
    console.log("Starting trip generation for:", {
      country,
      numberOfDays,
      userId,
    });

    const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${interests},
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          '🌸 Season (from month to month): reason to visit',
          '☀️ Season (from month to month): reason to visit',
          '🍁 Season (from month to month): reason to visit',
          '❄️ Season (from month to month): reason to visit'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        },
        ...
        ]
    }`;

    console.log("Calling Gemini API...");
    const textResult = await genAI
      .getGenerativeModel({ model: "gemini-2.5-flash" })
      .generateContent([prompt]);

    console.log("Gemini response received, parsing...");
    const trip = parseMarkdownToJson(textResult.response.text());
    console.log("Trip parsed successfully");

    console.log("Fetching images from Unsplash...");
    const imageResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`
    );

    const imageData = await imageResponse.json();
    const imageUrls = imageData.results
      .slice(0, 3)
      .map((result: any) => result.urls?.regular || null)
      .filter((url: string | null) => url !== null);
    console.log("Images fetched:", imageUrls.length);

    console.log("Saving to Appwrite database...");
    const result = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripsCollectionId,
      ID.unique(),
      {
        tripDetail: JSON.stringify(trip),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId,
      }
    );

    console.log("Trip saved successfully with ID:", result.$id);
    return data({ id: result.$id });
  } catch (e: any) {
    console.error("Error generating travel plan: ", e);
    console.error("Error details:", {
      message: e.message,
      code: e.code,
      type: e.type,
      stack: e.stack,
    });
    return data(
      {
        error: "Failed to generate trip",
        message: e.message || String(e),
        details: e.code || e.type || "Unknown error",
      },
      { status: 500 }
    );
  }
};
