"use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

type Props = {
  onSave: () => void;
  saving?: boolean;
};

const PlaygroundHeader = ({ onSave, saving }: Props) => {
  return (
    <div className="flex items-center justify-between border-b p-4 shadow-md">
      <h1 className="text-2xl font-bold">AI Website Creator</h1>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <UserButton />
      </div>
    </div>
  );
};

export default PlaygroundHeader;
