import Tag from "@/components/_ui/tag";
import { TAG_TONES, type Company } from "@/data/companies";
import { splitTags } from "@/lib/companies";

type CompanyTagListProps = {
  tags: Company["tags"];
  size?: "sm" | "md";
};

/**
 * A company's segment/stage tags, trimmed to what fits (see `splitTags`)
 * with a "+N" chip for the rest. Renders the tags only — the caller owns the
 * wrapper, because layout differs per surface (table cell, card, command row).
 */
export default function CompanyTagList({ tags, size }: CompanyTagListProps) {
  const { visible, hidden } = splitTags(tags);
  return (
    <>
      {visible.map((tag) => (
        <Tag key={tag} tone={TAG_TONES[tag]} size={size}>
          {tag}
        </Tag>
      ))}
      {hidden > 0 && (
        <Tag tone="neutral" size="sm">
          +{hidden}
        </Tag>
      )}
    </>
  );
}
