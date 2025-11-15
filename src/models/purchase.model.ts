import { Schema, model, Document } from "mongoose";

export interface IPromoCampaign extends Document {
  title: string;               
  productName: string;         
  infoText: string;             

  pointsPerUnit: number;        
  entriesPerUnit: number;       

  display4PackPurchases: number; 
  displayDrawEntries: number;    

  grandPrizeTitle: string;       
  grandPrizeDescription: string; // ⭐ NEW FIELD ⭐
  grandPrizeDrawDate: string;    
  grandPrizeEntryRule: string;   

  isActive: boolean;
}

const promoSchema = new Schema<IPromoCampaign>(
  {
    title: { type: String, required: true },
    productName: { type: String, required: true },
    infoText: { type: String, required: true },

    pointsPerUnit: { type: Number, required: true },
    entriesPerUnit: { type: Number, required: true },

    display4PackPurchases: { type: Number, default: 0 },
    displayDrawEntries: { type: Number, default: 0 },

    grandPrizeTitle: { type: String, required: true },
    grandPrizeDescription: { type: String, required: true }, // ⭐ Added
    grandPrizeDrawDate: { type: String, required: true },
    grandPrizeEntryRule: { type: String, required: true },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const PromoCampaign = model<IPromoCampaign>("PromoCampaign", promoSchema);
