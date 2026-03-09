import { format } from "date-fns";
import { parseAppDate } from "../../lib/date";

type Props = { status?: string; lastSeen?: number | null };

export default function UserPresence({ status, lastSeen }: Props) {
  const parsedLastSeen = parseAppDate(lastSeen);

  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
      {status === "online" ? (
        <span className="block h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-background" />
      ) : null}
      {status === "online"
        ? "Online"
        : parsedLastSeen
          ? `Last seen ${format(parsedLastSeen, "p")}`
          : ""}
    </span>
  );
}
