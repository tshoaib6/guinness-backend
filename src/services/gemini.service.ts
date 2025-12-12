// services/gemini.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isGuinness: boolean;
  isCase: boolean;
}

export interface ParsedReceipt {
  success: boolean;
  items: ReceiptItem[];
  totalAmount: number;
  receiptNumber?: string;
  transactionId?: string;
  dateTime?: string;
  storeName?: string;
  guinnessItems: ReceiptItem[];
  bottleCount: number;
  caseCount: number;
  type: "single" | "case" | "mixed";
  confidence: number;
  rawText?: string;
  notes?: string;
}

export class GeminiReceiptParser {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY not found. AI processing disabled.");
      this.initialized = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // or "gemini-2.0-flash"
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 40,
        },
        // Remove safetySettings or use the correct enum values
        // safetySettings: [
        //   {
        //     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        //   },
        //   {
        //     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        //   }
        // ]
      });
      this.initialized = true;
      console.log("✅ Gemini AI initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Gemini:", error);
      this.initialized = false;
    }
  }

  async parseReceiptFromImage(imageBuffer: Buffer): Promise<ParsedReceipt> {
    // Check if AI is initialized
    if (!this.initialized || !this.model) {
      console.warn("⚠️ Gemini AI not available, using fallback");
      return this.getFallbackResponse("Gemini AI not configured or initialized");
    }

    try {
      console.log("🔍 Starting receipt image analysis with Gemini AI...");

      // Optimize image for better OCR
      const optimizedImage = await this.optimizeImage(imageBuffer);
      console.log(`📊 Image optimized: ${optimizedImage.length} bytes`);

      const prompt = `ANALYZE THIS RECEIPT AND EXTRACT ALL PURCHASE INFORMATION.

CRITICAL: You MUST respond with ONLY valid JSON. No other text, no explanations, no markdown.

SPECIAL GUINNESS DETECTION RULES:
1. Look for these keywords: "Guinness", "Stout", "275ml", "Beer", "Malt", "Beverage", "Drink"
2. Case indicators: "6/", "(6)", "case", "pack", "ctn", "carton"
3. Price patterns: $4.60, TT$4.60, 4.60, USD 4.60
4. Quantity indicators: "1 @", "x1", "Qty: 1", "16" (OCR error for 1 @)

OCR ERROR CORRECTION:
- "16 44.60" → {"quantity": 1, "unitPrice": 4.60}
- "44.60" → {"unitPrice": 4.60}
- "Guinness Stout 275ml" → {"name": "Guinness Stout", "isGuinness": true}
- "(6/$25.40)" → {"isCase": true, "quantity": 1, "unitPrice": 25.40}
- "Guinness (6)" → {"name": "Guinness", "isGuinness": true, "isCase": true}

CALCULATION RULES:
- Total price = quantity × unitPrice
- If total price missing, calculate it
- 1 case = 6 bottles

STORE DETECTION:
- Look for store names at top: "Supermarket", "Grocery", "Liquor", "Bar"
- Look for receipt/transaction numbers
- Extract date and time

RETURN THIS EXACT JSON STRUCTURE (NO OTHER TEXT):
{
  "success": true,
  "storeName": "Store name if found",
  "dateTime": "Date/time if found",
  "receiptNumber": "Receipt number if found",
  "transactionId": "Transaction ID if found",
  "items": [
    {
      "name": "Item name",
      "quantity": 1,
      "unitPrice": 4.60,
      "totalPrice": 4.60,
      "isGuinness": true,
      "isCase": false
    }
  ],
  "totalAmount": 4.60,
  "guinnessItems": [
    // Only Guinness items go here, copy from items array where isGuinness=true
  ],
  "bottleCount": 1,
  "caseCount": 0,
  "type": "single",
  "confidence": 85,
  "notes": "Analysis successful"
}

If NO Guinness is found, return:
{
  "success": false,
  "items": [],
  "totalAmount": 0,
  "guinnessItems": [],
  "bottleCount": 0,
  "caseCount": 0,
  "type": "single",
  "confidence": 0,
  "notes": "No Guinness items detected on receipt"
}

If you cannot parse the receipt clearly, return:
{
  "success": false,
  "items": [],
  "totalAmount": 0,
  "guinnessItems": [],
  "bottleCount": 0,
  "caseCount": 0,
  "type": "single",
  "confidence": 0,
  "notes": "Could not parse receipt clearly"
}

IMPORTANT: Output ONLY the JSON object, nothing else.`;

      console.log("🤖 Sending request to Gemini AI...");

      const startTime = Date.now();
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: optimizedImage.toString("base64"),
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      const endTime = Date.now();

      console.log(`⏱️ Gemini response time: ${endTime - startTime}ms`);
      console.log(`📝 Raw Gemini response (first 500 chars):`, text.substring(0, 500));

      const parsedReceipt = this.parseResponse(text);

      console.log("📊 Parsed receipt result:", {
        success: parsedReceipt.success,
        guinnessItems: parsedReceipt.guinnessItems.length,
        bottleCount: parsedReceipt.bottleCount,
        caseCount: parsedReceipt.caseCount,
        type: parsedReceipt.type,
        confidence: parsedReceipt.confidence,
        notes: parsedReceipt.notes,
      });

      return parsedReceipt;
    } catch (error: any) {
      console.error("❌ Gemini AI processing error:", error.message);
      console.error("Error stack:", error.stack);

      return this.getFallbackResponse(`AI processing failed: ${error.message}`);
    }
  }

  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .grayscale() // Convert to grayscale for better OCR
        .normalize() // Enhance contrast
        .linear(1.2, 0) // Brighten image
        .sharpen({ sigma: 1 }) // Sharpen edges
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toBuffer();
    } catch (error) {
      console.warn("⚠️ Image optimization failed, using original:", error);
      return imageBuffer;
    }
  }

  private parseResponse(text: string): ParsedReceipt {
    try {
      console.log("🔧 Parsing Gemini response...");

      // Clean the response text
      let cleanedText = text.trim();

      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/gi, "");
      cleanedText = cleanedText.replace(/```\s*/gi, "");

      // Remove any non-JSON text before and after
      const jsonStart = cleanedText.indexOf("{");
      const jsonEnd = cleanedText.lastIndexOf("}") + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        console.error("❌ No JSON structure found in response");
        console.error("Cleaned text:", cleanedText.substring(0, 300));
        return this.extractPartialData(text, "No JSON structure found");
      }

      const jsonStr = cleanedText.substring(jsonStart, jsonEnd);
      console.log("📄 JSON string to parse:", jsonStr.substring(0, 300) + "...");

      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (typeof parsed.success !== "boolean") {
        console.warn("⚠️ 'success' field missing or invalid, defaulting to false");
        parsed.success = false;
      }

      // Ensure arrays exist
      if (!Array.isArray(parsed.items)) {
        parsed.items = [];
      }

      if (!Array.isArray(parsed.guinnessItems)) {
        parsed.guinnessItems = [];
      }

      // Calculate derived fields if missing
      if (parsed.success && parsed.guinnessItems.length > 0) {
        // Calculate bottleCount and caseCount if not provided
        if (parsed.bottleCount === undefined || parsed.caseCount === undefined) {
          let bottleCount = 0;
          let caseCount = 0;

          parsed.guinnessItems.forEach((item: ReceiptItem) => {
            if (item.isCase) {
              caseCount += item.quantity;
              bottleCount += item.quantity * 6; // Assuming 6 bottles per case
            } else {
              bottleCount += item.quantity;
            }
          });

          parsed.bottleCount = bottleCount;
          parsed.caseCount = caseCount;
        }

        // Determine type if not specified
        if (!parsed.type) {
          parsed.type = this.determineType(parsed);
        }

        // Calculate confidence if not provided
        if (parsed.confidence === undefined) {
          // Base confidence on quality of data
          let confidence = 70; // Base confidence
          if (parsed.totalAmount && parsed.totalAmount > 0) confidence += 10;
          if (parsed.storeName) confidence += 5;
          if (parsed.receiptNumber) confidence += 5;
          if (parsed.dateTime) confidence += 5;
          if (parsed.guinnessItems.every((item: ReceiptItem) => item.unitPrice > 0))
            confidence += 5;

          parsed.confidence = Math.min(confidence, 95);
        }
      }

      // Build the final response
      const result: ParsedReceipt = {
        success: parsed.success || false,
        items: parsed.items || [],
        totalAmount: parsed.totalAmount || 0,
        receiptNumber: parsed.receiptNumber || "",
        transactionId: parsed.transactionId || "",
        dateTime: parsed.dateTime || "",
        storeName: parsed.storeName || "",
        guinnessItems: parsed.guinnessItems || [],
        bottleCount: parsed.bottleCount || 0,
        caseCount: parsed.caseCount || 0,
        type: this.determineType(parsed),
        confidence: parsed.confidence || 0,
        rawText: text.substring(0, 500), // Store first 500 chars for debugging
        notes: parsed.notes || "AI processing completed",
      };

      return result;
    } catch (error: any) {
      console.error("❌ Failed to parse Gemini response:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Raw response was (first 1000 chars):", text.substring(0, 1000));

      // Try to extract basic information even if parsing fails
      return this.extractPartialData(text, error.message);
    }
  }

  private extractPartialData(text: string, errorMessage: string): ParsedReceipt {
    console.log("🔄 Attempting to extract partial data from response...");

    const lowercaseText = text.toLowerCase();

    // Check for Guinness indicators
    const guinnessIndicators = [
      "guinness",
      "stout",
      "275ml",
      "275 ml",
      "malt",
      "beer",
      "beverage",
      "drink",
    ];

    const hasGuinness = guinnessIndicators.some((indicator) => lowercaseText.includes(indicator));

    // Try to extract price information
    let bottleCount = 0;
    let caseCount = 0;
    let totalAmount = 0;
    let confidence = 0;

    if (hasGuinness) {
      // Look for quantity patterns
      const quantityMatch = text.match(/(\d+)\s*(?:@|x|ctn|case|pack|bottle)/i);
      if (quantityMatch) {
        bottleCount = parseInt(quantityMatch[1]);
        confidence += 20;
      } else {
        // Assume at least 1 if Guinness is mentioned
        bottleCount = 1;
        confidence += 10;
      }

      // Look for price patterns
      const pricePatterns = [
        /\$(\d+\.?\d*)/g,
        /TT\$(\d+\.?\d*)/g,
        /USD\s*(\d+\.?\d*)/g,
        /(\d+\.?\d{2})\s*(?:total|amount|sum)/gi,
      ];

      for (const pattern of pricePatterns) {
        const matches = text.match(pattern);
        if (matches) {
          // Get the last match (often the total)
          const lastMatch = matches[matches.length - 1];
          const priceMatch = lastMatch.match(/(\d+\.?\d*)/);
          if (priceMatch) {
            totalAmount = parseFloat(priceMatch[1]);
            confidence += 15;
            break;
          }
        }
      }

      // Look for case indicators
      if (
        text.includes("6/") ||
        text.includes("(6)") ||
        text.includes("case") ||
        text.includes("pack")
      ) {
        caseCount = 1;
        bottleCount = 6;
        confidence += 10;
      }

      confidence = Math.min(confidence, 50); // Cap at 50% for partial data
    }

    const fallbackResponse: ParsedReceipt = {
      success: hasGuinness,
      items: [],
      totalAmount,
      guinnessItems: hasGuinness
        ? [
            {
              name: "Guinness Stout",
              quantity: caseCount > 0 ? caseCount : bottleCount,
              unitPrice: totalAmount / (caseCount > 0 ? caseCount : bottleCount) || 4.6,
              totalPrice: totalAmount,
              isGuinness: true,
              isCase: caseCount > 0,
            },
          ]
        : [],
      bottleCount,
      caseCount,
      type: caseCount > 0 ? "case" : bottleCount > 0 ? "single" : "single",
      confidence,
      rawText: text.substring(0, 500),
      notes: `Partial extraction: ${errorMessage}. Guinness detected: ${hasGuinness}`,
    };

    console.log("🔄 Partial extraction result:", {
      hasGuinness,
      bottleCount,
      caseCount,
      totalAmount,
      confidence,
      notes: fallbackResponse.notes,
    });

    return fallbackResponse;
  }

  private determineType(parsed: any): "single" | "case" | "mixed" {
    const bottleCount = parsed.bottleCount || 0;
    const caseCount = parsed.caseCount || 0;

    if (caseCount > 0 && bottleCount === caseCount * 6) {
      return "case"; // Only full cases
    } else if (caseCount > 0 && bottleCount > 0) {
      return "mixed"; // Mix of singles and cases
    } else if (bottleCount > 0) {
      return "single"; // Only single bottles
    }

    return "single";
  }

  private getFallbackResponse(notes: string): ParsedReceipt {
    return {
      success: false,
      items: [],
      totalAmount: 0,
      guinnessItems: [],
      bottleCount: 0,
      caseCount: 0,
      type: "single",
      confidence: 0,
      notes,
    };
  }

  // Helper method to test parsing without image
  async testParseWithText(receiptText: string): Promise<ParsedReceipt> {
    if (!this.initialized || !this.model) {
      return this.getFallbackResponse("Gemini AI not available");
    }

    try {
      const prompt = `Parse this receipt text and extract information:

${receiptText}

Return ONLY valid JSON in the format specified in the main prompt.`;

      const result = await this.model.generateContent([prompt]);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text);
    } catch (error: any) {
      console.error("Test parsing error:", error);
      return this.getFallbackResponse(`Test parsing failed: ${error.message}`);
    }
  }

  // Check if service is ready
  isReady(): boolean {
    return this.initialized && this.model !== null;
  }

  // Get service status
  getStatus(): {
    initialized: boolean;
    modelName: string;
    apiKeyConfigured: boolean;
  } {
    return {
      initialized: this.initialized,
      modelName: "gemini-2.5-flash",
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    };
  }
}

// Export a singleton instance
export const geminiParser = new GeminiReceiptParser();
