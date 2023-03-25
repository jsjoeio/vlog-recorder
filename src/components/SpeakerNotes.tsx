import { STATE } from "@/pages";

type SpeakerNotesProps = {
  state: STATE;
};

const VISIBLE_STATES: STATE[] = ["isRecording", "isConnectedWebcam"];
export function SpeakerNotes({ state }: SpeakerNotesProps) {
  if (VISIBLE_STATES.includes(state)) {
    return (
      <div className="form-control mx-auto w-[32rem] mt-4 ">
        <textarea
          className="textarea textarea-ghost h-48"
          placeholder="Add your notes here..."
        ></textarea>
      </div>
    );
  }
  return null;
}
