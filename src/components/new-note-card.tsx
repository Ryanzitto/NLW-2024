import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true);

  const [content, setContent] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleClickStartEditor = () => {
    setShouldShowOnBoarding(false);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    if (e.target.value === "") {
      setShouldShowOnBoarding(true);
    }
  };

  const handleSaveNote = (e: FormEvent) => {
    e.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);
    setContent("");
    setShouldShowOnBoarding(true);
    toast.success("Nota criada com sucesso!");
  };

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a APIde gravação");
      return;
    }

    setIsRecording(true);
    setShouldShowOnBoarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (e) => {
      const transcription = Array.from(e.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };

    speechRecognition.onerror = (e) => {
      console.log(e);
    };
    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 text-left gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible: ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          Adcionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50">
          <Dialog.Content className="overflow-hidden fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
            <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
              <X className="size-5" />
            </Dialog.Close>

            <form className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-sm font-medium text-slate-300">
                  Adcionar nota
                </span>
                {shouldShowOnBoarding ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece{" "}
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="font-medium text-lime-400 hover:underline"
                    >
                      gravando uma nota
                    </button>{" "}
                    em áudio ou se preferir{" "}
                    <button
                      type="button"
                      onClick={handleClickStartEditor}
                      className="font-medium text-lime-400 hover:underline"
                    >
                      utilize apenas texto.
                    </button>
                  </p>
                ) : (
                  <textarea
                    onChange={handleContentChange}
                    autoFocus
                    value={content}
                    className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  ></textarea>
                )}
              </div>
              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex items-center justify-center gap-2 font-medium w-full bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none hover:text-slate-100"
                >
                  <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                  Gravando (clique p/ interromper)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="font-medium w-full bg-lime-400 py-4 text-center text-sm text-slate-950 outline-none hover:bg-lime-500"
                >
                  Salvar nota
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
