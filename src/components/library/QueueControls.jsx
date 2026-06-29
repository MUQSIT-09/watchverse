import { ArrowUp, ArrowDown } from "lucide-react";

const QueueControls = ({ onMoveUp, onMoveDown }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onMoveUp}
        className="rounded-lg bg-slate-700 p-2"
      >
        <ArrowUp size={16} />
      </button>

      <button
        onClick={onMoveDown}
        className="rounded-lg bg-slate-700 p-2"
      >
        <ArrowDown size={16} />
      </button>
    </div>
  );
};

export default QueueControls;