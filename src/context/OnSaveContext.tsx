import { createContext } from "react";

export interface OnSaveContextType {
  onSaveDate: Date | null;
  setOnSaveDate: (date: Date | null) => void;
}

export const OnSaveContext = createContext<OnSaveContextType | null>(null);