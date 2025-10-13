"use client";

import AIModelsList, { AIModel, SubModel } from "../../shared/AIModelsList";
import Image from "next/image";
import { useContext, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MessageSquare } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseDB";
import { useUser } from "@clerk/nextjs";
import { AISelectedModelContext, AIModelsType } from "@/context/AISelectedModels";

const AIMultiModels = () => {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState<AIModel[]>(AIModelsList);

  const context = useContext(AISelectedModelContext);
  if (!context) throw new Error("AISelectedModelContext must be used within a provider");

  const { aiSelectedModels, setAiSelectedModels } = context;

  // Toggle model enable/disable
  const onToggleChange = (model: string, value: boolean) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );
  };

  // Handle model selection and sync to Firestore
  const onSelectValue = async (parentModel: keyof AIModelsType, value: string) => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.id);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress || "",
        selectedModelPref: { [parentModel]: { modelId: value } },
        createdAt: new Date(),
      });
    } else {
      await updateDoc(userDocRef, {
        [`selectedModelPref.${parentModel}`]: { modelId: value },
      });
    }

    // Update context
    setAiSelectedModels((prev) => ({
      ...prev,
      [parentModel]: { modelId: value },
    }));

    console.log(`✅ Updated model: ${parentModel} -> ${value}`);
  };

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r h-full overflow-auto transition-all ${
            model.enable ? "flex-1 min-w-[400px]" : "w-[100px] flex-none"
          }`}
        >
          <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <Image
                src={model.icon}
                alt={model.model}
                width={24}
                height={24}
              />

              {model.enable && (
                <Select
                  defaultValue={aiSelectedModels[model.model as keyof AIModelsType]?.modelId}
                  onValueChange={(value) => onSelectValue(model.model as keyof AIModelsType, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={
                        aiSelectedModels[model.model as keyof AIModelsType]?.modelId ||
                        "Select a Model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {model.subModel.map((subModel: SubModel, subIndex: number) => (
                      <SelectItem key={subIndex} value={subModel.name}>
                        {subModel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              {model.enable ? (
                <Switch
                  checked={model.enable}
                  onCheckedChange={(v: boolean) => onToggleChange(model.model, v)}
                />
              ) : (
                <MessageSquare
                  onClick={() => onToggleChange(model.model, true)}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIMultiModels;
