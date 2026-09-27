"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  LoaderCircle,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const EXAMPLES = [
  "Bhai mai rasta bhatak gayi hu sunsaan jagah par",
  "Engine se achanak dhuan nikalne laga aur awaz aa rahi hai",
  "Car start nahi ho rahi, dashboard lights flicker kar rahi hain",
  "My steering wheel is shaking violently, what should I do?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* --------------------------------
   MESSAGE TEXT RENDERER
--------------------------------- */

function renderText(text: string): ReactNode {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return (
        <div
          key={index}
          className="h-2"
        />
      );
    }

    const inline = (value: string) =>
      value
        .split(/(\*\*[^\*]+\*\*)/g)
        .map((segment, segmentIndex) =>
          segment.startsWith("**") &&
          segment.endsWith("**") ? (
            <strong
              key={segmentIndex}
              className="font-semibold text-foreground"
            >
              {segment.slice(2, -2)}
            </strong>
          ) : (
            <span key={segmentIndex}>
              {segment}
            </span>
          ),
        );

    return (
      <p
        key={index}
        className="text-sm leading-relaxed"
      >
        {inline(trimmed)}
      </p>
    );
  });
}

/* --------------------------------
   AI DIAGNOSIS COMPONENT
--------------------------------- */

export default function AiDiagnosis() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* --------------------------------
     AUTO SCROLL
  --------------------------------- */

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  /* --------------------------------
     SUBMIT MESSAGE
  --------------------------------- */

  async function submit(text: string) {
    const value = text.trim();

    if (!value || busy) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: value,
    };

    const updatedHistory = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedHistory);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch(
        "/api/diagnose",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: value,
            history: updatedHistory
              .slice(-6)
              .map((message) => ({
                role: message.role,
                content: message.content,
              })),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.reply) {
        throw new Error(
          data.error || "Network error",
        );
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.reply,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "AI diagnosis request failed:",
        error,
      );

      /* --------------------------------
         OFFLINE / API FALLBACK
      --------------------------------- */

      const isHindi =
        /[\u0900-\u097F]|mai|bhatak|gayi|gaya|bhai|gadi|dhuan|kya|nahi|raha|madad|sunsaan/i.test(
          value,
        );

      let fallbackReply = "";

      /* LOST / UNSAFE LOCATION */

      if (
        /bhatak|lost|route|rasta|sunsaan/i.test(
          value,
        )
      ) {
        fallbackReply = isHindi
          ? "Ghabrayiye mat, bilkul shaant rahiye. Sabse pehle apni gaadi ke saare doors lock kar lijiye aur kisi well-lit spot (jaise petrol pump, toll plaza ya dhabe) ki taraf gaadi slow speed me badhayein. Kisi anjaan sunsaan jagah par gaadi rok kar niche mat utariye. Turant WhatsApp ya Google Maps se apni live location kisi family member ko bhej dijiye, aur zaroorat pade toh Emergency 112 button par tap karein."
          : "Stay calm and don't panic. Lock all vehicle doors immediately and keep moving slowly towards a well-lit area like a toll booth, fuel station, or highway eatery. Avoid stopping in dark or isolated spots. Share your live GPS location with a trusted contact right now, or use Emergency 112 if you feel unsafe.";

      /* ENGINE SMOKE / OVERHEATING */

      } else if (
        /smoke|dhuan|heat|garam/i.test(
          value,
        )
      ) {
        fallbackReply = isHindi
          ? "Gaadi ko turant left shoulder par safely rokiye aur hazard flashers on kar lijiye. Engine band karein aur kam se kam 25 minute thanda hone dein. Bonnet ya radiator cap bilkul mat kholna, steam se haath jal sakta hai. Neeche available services me se tow truck ya mechanic ko call kar lijiye."
          : "Pull over to the left shoulder immediately and turn on your hazard lights. Turn off the engine and let it cool for at least 25 minutes. Never open the radiator cap while hot. Contact a tow service or mechanic from the available services.";

      /* GENERIC */

      } else {
        fallbackReply = isHindi
          ? "Main aapki pareshani samajh sakta hoon. Kripya thoda detail me batayein ki aapke saath abhi kya ho raha hai—kya gaadi me mechanical fault hai, ya aap kisi unsafe jagah par fas gaye hain? Main turant sahi solution batata hoon."
          : "I understand your concern. Please share a little more detail about what is happening. Let me know whether this is a vehicle breakdown or a safety/navigation issue so I can guide you right away.";
      }

      const fallbackMessage: Message = {
        id: `${Date.now()}-fallback`,
        role: "assistant",
        content: fallbackReply,
      };

      setMessages((previous) => [
        ...previous,
        fallbackMessage,
      ]);
    } finally {
      setBusy(false);
    }
  }

  /* --------------------------------
     UI
  --------------------------------- */

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

      {/* =========================
          AI HEADER
      ========================== */}

      <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4 text-foreground transition-colors duration-300">

        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Sparkles
            className="size-5 text-primary-foreground"
            aria-hidden
          />
        </span>

        <div className="min-w-0">
<h3 className="font-display text-base font-bold leading-tight !text-slate-900 dark:!text-white">
  ResQRoute AI Emergency Assistant
</h3>

<p className="text-xs text-slate-600 dark:text-slate-300">
  Real-time Conversational Roadside &amp; Highway Support
</p>

        </div>
      </div>

      {/* =========================
          CHAT AREA
      ========================== */}

      <div
        ref={scrollRef}
        className="h-80 space-y-4 overflow-y-auto px-5 py-4"
        aria-live="polite"
      >

        {/* EMPTY STATE */}

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">

            <ShieldAlert
              className="size-8 text-primary"
              aria-hidden
            />

            <p className="max-w-xs text-balance text-sm text-muted-foreground">
              Kuch bhi pareshani ho, seedhe batayein.
              Hindi ya English me baat karein:
            </p>

            <div className="flex flex-wrap justify-center gap-2">

              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  disabled={busy}
                  onClick={() => submit(example)}
                  className="
                    rounded-full
                    border
                    border-border
                    bg-secondary
                    px-3
                    py-1.5
                    text-left
                    text-xs
                    font-medium
                    text-secondary-foreground
                    transition-colors
                    hover:border-primary/40
                    hover:text-primary
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {example}
                </button>
              ))}

            </div>
          </div>
        )}

        {/* MESSAGES */}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                  : "max-w-[92%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-secondary-foreground"
              }
            >
              {renderText(message.content)}
            </div>
          </div>
        ))}

        {/* TYPING */}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle
              className="size-4 animate-spin"
              aria-hidden
            />
            ResQRoute AI is typing…
          </div>
        )}

      </div>

      {/* =========================
          INPUT
      ========================== */}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >

        <textarea
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              submit(input);
            }
          }}
          rows={1}
          disabled={busy}
          placeholder="Hindi ya English me type karein (e.g. Mai rasta bhatak gayi hu...)"
          className="
            max-h-32
            min-h-11
            flex-1
            resize-none
            rounded-lg
            border
            border-border
            bg-background
            px-3
            py-2.5
            text-sm
            text-foreground
            outline-none
            placeholder:text-muted-foreground
            focus-visible:border-ring
            focus-visible:ring-2
            focus-visible:ring-ring/40
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        <Button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-11 gap-2 px-4 font-semibold"
        >
          <Send
            className="size-4"
            aria-hidden
          />

          <span className="sr-only sm:not-sr-only">
            Send
          </span>
        </Button>

      </form>

    </div>
  );
}