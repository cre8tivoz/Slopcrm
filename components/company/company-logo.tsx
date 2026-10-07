import Asset from "@/kit/asset";
import type { Company } from "@/data/companies";
import { cn } from "@/lib/utils";

const RING = "shadow-[0px_0px_0px_1px_#232323]";

/** Tile, image and fallback-initial styling per size — one place to tune. */
const SIZES = {
  /** 16px badge, e.g. overlapping an avatar. */
  "2xs": {
    tile: cn("size-4 rounded-[5px]", RING),
    image: "size-2.5",
    initial: "caption-style",
  },
  /** 24px — command menu rows. */
  xs: { tile: cn("size-6 rounded-md", RING), image: "size-3.5", initial: "caption-style" },
  /** 28px — deal cards. */
  sm: { tile: cn("size-7 rounded-lg", RING), image: "size-4", initial: "caption-style" },
  /** 32px — compact list rows. */
  md: { tile: cn("size-8 rounded-lg", RING), image: "size-4", initial: "caption-style" },
  /** 36px — cards and feed rows. */
  lg: {
    tile: "size-9 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(15,15,15,0.24),0px_0px_0px_1px_#232323]",
    image: "size-6",
    initial: "lead-style",
  },
  /** 50px — detail sheet header. */
  xl: {
    tile: "size-[50px] rounded-[12.5px] shadow-[0px_6.25px_6.25px_0px_rgba(15,15,15,0.24),0px_0px_0px_1.563px_#232323]",
    image: "size-8",
    initial: "h2-style",
  },
} as const;

export type CompanyLogoSize = keyof typeof SIZES;

type CompanyLogoProps = {
  /** Missing company renders a neutral "?" tile (e.g. a deleted account). */
  company?: Pick<Company, "name" | "logo">;
  size?: CompanyLogoSize;
  /**
   * Announce the logo to screen readers. Off by default because the company
   * name is almost always printed right next to it.
   */
  labelled?: boolean;
  className?: string;
};

/** Company logo tile, falling back to the name's initial. */
export default function CompanyLogo({
  company,
  size = "md",
  labelled = false,
  className,
}: CompanyLogoProps) {
  const style = SIZES[size];

  return (
    <span
      className={cn(
        "bg-muted flex shrink-0 items-center justify-center overflow-hidden",
        style.tile,
        className,
      )}
    >
      {company?.logo ? (
        <Asset
          type="image"
          src={company.logo}
          alt={labelled ? `${company.name} logo` : ""}
          width={1}
          height={1}
          fit="contain"
          className={style.image}
        />
      ) : (
        <span aria-hidden={!labelled} className={cn(style.initial, "text-soft")}>
          {company?.name.slice(0, 1) ?? "?"}
        </span>
      )}
    </span>
  );
}
