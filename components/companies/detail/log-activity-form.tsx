"use client";

import { useId, useState, type FormEvent } from "react";
import Button from "@/components/_ui/button";
import Field from "@/components/_ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import {
  INTERACTION_TYPES,
  type Company,
  type InteractionType,
} from "@/data/companies";
import type { InteractionChannel } from "@/data/interactions";
import { CHANNEL_LABEL } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";

const CHANNELS: InteractionChannel[] = ["call", "email", "meeting", "note"];

const PAST_TENSE: Record<InteractionChannel, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
};

type LogActivityFormProps = {
  company: Company;
  onDone: () => void;
};

export default function LogActivityForm({
  company,
  onDone,
}: LogActivityFormProps) {
  const id = useId();
  const logActivity = useCompaniesStore((state) => state.logActivity);
  const showToast = useUiStore((state) => state.showToast);
  const [channel, setChannel] = useState<InteractionChannel>("call");
  const [type, setType] = useState<InteractionType>("Discovery");
  const [note, setNote] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    logActivity({ companyId: company.id, type, channel, note });
    showToast(`${PAST_TENSE[channel]} logged for ${company.name}`);
    setNote("");
    onDone();
  }

  return (
    <form onSubmit={submit} className="animate-rise flex flex-col gap-5 pt-1">
      <fieldset className="flex flex-col gap-2">
        <legend className="lead-style mb-2 font-medium">
          How did you get in touch?
        </legend>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-white/5 p-1">
          {CHANNELS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={channel === option}
              onClick={() => setChannel(option)}
              className={cn(
                "lead-style ease-power3-out focus-visible:ring-ring/60 fine:min-h-9 min-h-11 rounded-lg px-1 transition-[background-color,color,transform] duration-150 outline-none focus-visible:ring-2 active:scale-[0.97]",
                channel === option
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-soft hover:text-foreground",
              )}
            >
              {option === "note" ? "Note" : CHANNEL_LABEL[option]}
            </button>
          ))}
        </div>
      </fieldset>

      <Field label="What was it about?" htmlFor={`${id}-type`}>
        <Select
          value={type}
          onValueChange={(value) => setType(value as InteractionType)}
        >
          <SelectTrigger id={`${id}-type`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTERACTION_TYPES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Notes"
        htmlFor={`${id}-note`}
        hint="Optional. A line on what happened or what's next."
      >
        <textarea
          id={`${id}-note`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={280}
          placeholder="e.g. Sent pricing, follow up Friday"
          aria-describedby={`${id}-note-hint`}
          className="border-line-strong bg-secondary text-foreground ease-power3-out placeholder:text-subtle focus-visible:border-ring w-full resize-none rounded-lg border px-3 py-2.5 text-[14px] leading-snug transition-[border-color] duration-150 outline-none"
        />
      </Field>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="subtle"
          size="sm"
          onClick={onDone}
          className="fine:min-h-0 min-h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="fine:min-h-0 min-h-11"
        >
          Save activity
        </Button>
      </div>
    </form>
  );
}
