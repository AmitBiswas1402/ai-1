"use client";

import AIModelsList, { AIModel } from "../../shared/AIModelsList";
import Image from "next/image";
import { useContext, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Lock, LockIcon, MessageSquare } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseDB";
import { useUser } from "@clerk/nextjs";
import {
  AISelectedModelContext,
  AIModelsType,
} from "@/context/AISelectedModels";
import { Button } from "@/components/ui/button";

const AIMultiModels = () => {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState<AIModel[]>(AIModelsList);

  const context = useContext(AISelectedModelContext);
  if (!context)
    throw new Error("AISelectedModelContext must be used within a provider");

  const { aiSelectedModels, setAiSelectedModels } = context;

  // Toggle model enable/disable
  const onToggleChange = (model: string, value: boolean) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );
  };

  // Handle model selection and sync to Firestore
  const onSelectValue = async (
    parentModel: keyof AIModelsType,
    value: string
  ) => {
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
                  defaultValue={
                    aiSelectedModels[model.model as keyof AIModelsType]?.modelId
                  }
                  onValueChange={(value) =>
                    onSelectValue(model.model as keyof AIModelsType, value)
                  }
                  disabled={model.premium}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={
                        aiSelectedModels[model.model as keyof AIModelsType]
                          ?.modelId ||
                        model.subModel[0]?.name ||
                        "Select a Model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-sm text-gray-400">
                        Free
                      </SelectLabel>
                      {model.subModel.map(
                        (subModel, i) =>
                          subModel.premium == false && (
                            <SelectItem key={i} value={subModel.id}>
                              {subModel.name}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-sm text-gray-400">
                        Premium
                      </SelectLabel>
                      {model.subModel.map(
                        (subModel, i) =>
                          subModel.premium == true && (
                            <SelectItem
                              key={i}
                              value={subModel.id}
                              disabled={subModel.premium}
                            >
                              {subModel.name} <LockIcon />
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              {model.enable ? (
                <Switch
                  checked={model.enable}
                  onCheckedChange={(v: boolean) =>
                    onToggleChange(model.model, v)
                  }
                />
              ) : (
                <MessageSquare
                  onClick={() => onToggleChange(model.model, true)}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>
          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full">
              <Button>
                {" "}
                <Lock /> Upgrade to unlock
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AIMultiModels;
