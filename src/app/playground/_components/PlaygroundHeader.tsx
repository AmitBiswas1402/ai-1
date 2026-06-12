import { Button } from "@/components/ui/button"

type Props = {
  onSave: () => void;
  saving?: boolean;
};

const PlaygroundHeader = ({ onSave, saving }: Props) => {
  return (
    <div className='flex justify-between items-center p-4 shadow-md border-b'>
      <h1 className="text-2xl font-bold">AI Website Creator</h1>

      <Button onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  )
}
export default PlaygroundHeader