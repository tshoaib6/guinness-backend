// controllers/qrSession.controller.ts
import { Request, Response } from "express";
import {
  createSingleQrSessionService,
  createRoundQrSessionService,
  createWholesaleQrSessionService, // ✅ NEW
  redeemQrSessionService,
  getSingleQrSessionsService,
  getRoundQrSessionsService,
  getWholesaleQrSessionsService, // ✅ NEW
  createBarQrSessionService,
  uploadReceiptSessionService,
} from "../services/earningSession.service";
import { upload } from "../middlewares/upload";
import { GeminiReceiptParser } from "../services/gemini.service";

const geminiParser = new GeminiReceiptParser();

// ------------------- Single QR -------------------
export const createSingleQrSessionController = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: "businessId is required" });
    }

    const result = await createSingleQrSessionService(businessId);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating Single QR session:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------- Round QR -------------------
export const createRoundQrSessionController = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: "businessId is required" });
    }

    const result = await createRoundQrSessionService(businessId);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating Round QR session:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------- Wholesale QR (NEW) -------------------
export const createWholesaleQrSessionController = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: "businessId is required" });
    }

    const result = await createWholesaleQrSessionService(businessId);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating Wholesale QR session:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------- Redeem QR (Single/Round/Wholesale) -------------------
export const redeemQrSessionController = async (req: Request, res: Response) => {
  try {
    const { consumerId, qrValue } = req.body;
    if (!consumerId || !qrValue) {
      return res
        .status(400)
        .json({ success: false, message: "consumerId and qrValue are required" });
    }

    const result = await redeemQrSessionService(consumerId, qrValue);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error redeeming QR session:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------- Get Single QR Sessions -------------------
export const getSingleQrSessionsController = async (req: Request, res: Response) => {
  try {
    const result = await getSingleQrSessionsService();
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- Get Round QR Sessions -------------------
export const getRoundQrSessionsController = async (req: Request, res: Response) => {
  try {
    const result = await getRoundQrSessionsService();
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- Get Wholesale QR Sessions (NEW) -------------------
export const getWholesaleQrSessionsController = async (req: Request, res: Response) => {
  try {
    const result = await getWholesaleQrSessionsService();
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBarQrSessionController = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ success: false, message: "businessId is required" });
    }

    // Call service with fixed 5 points
    const result = await createBarQrSessionService(businessId, 15);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error creating Bar QR session:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const uploadReceiptSessionController = async (req: Request, res: Response) => {
//     try {
//         const { consumerId, businessId, receiptData } = req.body;

//         if (!consumerId || !businessId || !receiptData) {
//             return res.status(400).json({
//                 success: false,
//                 message: "consumerId, businessId and receiptData are required"
//             });
//         }

//         // Call service
//         const result = await uploadReceiptSessionService(consumerId, businessId, receiptData);

//         if (!result.success) {
//             return res.status(400).json(result);
//         }

//         return res.status(200).json(result);

//     } catch (error) {
//         console.error("Error uploading receipt session:", error);
//         return res.status(500).json({ success: false, message: "Server error" });
//     }
// };

export const uploadReceiptSessionController = [
  upload.single("receiptImage"),
  async (req: Request, res: Response) => {
    console.log("📥 Receipt upload request received");

    try {
      const { consumerId, businessId, receiptData: receiptDataStr } = req.body;

      // Validate required fields
      if (!consumerId || !businessId) {
        console.error("❌ Missing required fields:", { consumerId, businessId });
        return res.status(400).json({
          success: false,
          message: "consumerId and businessId are required",
        });
      }

      let receiptData: any;

      // CASE 1: Image uploaded (AI Processing)
      if (req.file) {
        console.log("📷 Receipt image received, processing with AI...");
        console.log(
          `📊 File info: ${req.file.originalname}, ${req.file.size} bytes, ${req.file.mimetype}`,
        );

        // Check if AI service is ready
        const aiStatus = geminiParser.getStatus();
        console.log("🤖 AI Service Status:", aiStatus);

        if (!aiStatus.initialized) {
          console.warn("⚠️ AI service not initialized, using manual fallback");
          return res.status(400).json({
            success: false,
            message: "Receipt analysis service is currently unavailable",
            details: {
              success: false,
              items: [],
              totalAmount: 0,
              guinnessItems: [],
              bottleCount: 0,
              caseCount: 0,
              type: "single",
              confidence: 0,
              notes: "AI service not initialized. Please try again later or contact support.",
            },
          });
        }

        // Process image with Gemini AI
        console.log("🔍 Starting AI analysis...");
        const parsedReceipt = await geminiParser.parseReceiptFromImage(req.file.buffer);

        console.log("📋 Gemini parsing result:", {
          success: parsedReceipt.success,
          guinnessItems: parsedReceipt.guinnessItems.length,
          bottleCount: parsedReceipt.bottleCount,
          caseCount: parsedReceipt.caseCount,
          type: parsedReceipt.type,
          confidence: parsedReceipt.confidence,
          notes: parsedReceipt.notes,
        });

        // Check if parsing was successful
        if (!parsedReceipt.success) {
          console.log("❌ No Guinness detected or parsing failed");

          // Provide helpful error messages based on confidence
          let userMessage = "No Guinness purchase detected on receipt";

          if (parsedReceipt.confidence > 30) {
            userMessage =
              "Guinness may be present but couldn't be confirmed. Please upload a clearer image.";
          } else if (parsedReceipt.notes?.includes("Partial extraction")) {
            userMessage =
              "Receipt detected but analysis incomplete. Please ensure the receipt shows Guinness purchases clearly.";
          }

          return res.status(400).json({
            success: false,
            message: userMessage,
            details: parsedReceipt,
          });
        }

        // Convert Gemini format to your format
        receiptData = {
          items: parsedReceipt.guinnessItems.map((item: any) => ({
            name: item.isCase ? "Guinness Case" : "Guinness Bottle",
            quantity: item.quantity,
          })),
          totalAmount: parsedReceipt.totalAmount,
          type: parsedReceipt.type === "case" ? "case" : "single",
          bottleCount: parsedReceipt.bottleCount,
          caseCount: parsedReceipt.caseCount,
          metadata: {
            receiptNumber: parsedReceipt.receiptNumber,
            transactionId: parsedReceipt.transactionId,
            dateTime: parsedReceipt.dateTime,
            storeName: parsedReceipt.storeName,
            totalAmount: parsedReceipt.totalAmount,
            purchaseType: parsedReceipt.type,
            guinnessCount: parsedReceipt.bottleCount + parsedReceipt.caseCount * 6,
            confidence: parsedReceipt.confidence,
            aiProcessed: true,
            aiEngine: "gemini",
            validation: {
              seemsReasonable: parsedReceipt.confidence > 60,
              pricePerItem:
                parsedReceipt.guinnessItems.length > 0 &&
                parsedReceipt.guinnessItems[0].unitPrice > 0
                  ? parsedReceipt.guinnessItems[0].unitPrice.toFixed(2)
                  : "N/A",
            },
          },
        };

        console.log("✅ AI processing complete, extracted data:", {
          itemCount: receiptData.items.length,
          type: receiptData.type,
          bottleCount: receiptData.bottleCount,
          caseCount: receiptData.caseCount,
          totalAmount: receiptData.totalAmount,
        });
      }
      // CASE 2: Receipt data provided (Backward Compatibility)
      else if (receiptDataStr) {
        console.log("📄 Manual receipt data provided");
        try {
          // Parse receiptData (could be string or object)
          receiptData =
            typeof receiptDataStr === "string" ? JSON.parse(receiptDataStr) : receiptDataStr;

          // Ensure metadata exists
          receiptData.metadata = {
            ...receiptData.metadata,
            aiProcessed: false,
            source: "manual_upload",
          };

          console.log("✅ Manual data parsed successfully");
        } catch (parseError: any) {
          console.error("❌ Failed to parse receiptData:", parseError);
          return res.status(400).json({
            success: false,
            message: "Invalid receiptData format. Must be valid JSON.",
            details: { error: parseError.message },
          });
        }
      }
      // CASE 3: Neither provided
      else {
        console.error("❌ No receipt data or image provided");
        return res.status(400).json({
          success: false,
          message: "Either receipt image or receiptData is required",
        });
      }

      // Validate receipt data structure
      if (!receiptData.items || !Array.isArray(receiptData.items)) {
        console.error("❌ Invalid receipt data structure");
        return res.status(400).json({
          success: false,
          message: "Invalid receipt data: items array is required",
        });
      }

      // Call the service to process the receipt
      console.log("🔄 Processing receipt session with service...");
      const result = await uploadReceiptSessionService(consumerId, businessId, receiptData);

      if (!result.success) {
        console.error("❌ Service returned error:", result.message);
        return res.status(400).json(result);
      }

      // Add AI metadata to response if image was processed
      const response: any = { ...result };
      if (req.file && receiptData.metadata?.aiProcessed) {
        response.aiMetadata = {
          confidence: receiptData.metadata.confidence || 0,
          engine: receiptData.metadata.aiEngine || "gemini",
          storeName: receiptData.metadata.storeName || "",
          receiptNumber: receiptData.metadata.receiptNumber || "",
          itemsDetected: receiptData.items.length,
          type: receiptData.type,
          validation: receiptData.metadata.validation,
        };
      }

      console.log("✅ Receipt processed successfully!");
      return res.status(200).json(response);
    } catch (error: any) {
      console.error("💥 Error uploading receipt session:", error);
      console.error("Error stack:", error.stack);

      return res.status(500).json({
        success: false,
        message: "Server error while processing receipt",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
];

// Health check endpoint
export const checkAiServiceHealth = async (req: Request, res: Response) => {
  try {
    const status = geminiParser.getStatus();

    return res.status(200).json({
      success: true,
      aiService: {
        ...status,
        ready: status.initialized,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    return res.status(500).json({
      success: false,
      message: "AI service health check failed",
      error: error.message,
    });
  }
};
