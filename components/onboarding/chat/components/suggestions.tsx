import { Button } from "@/components/ui";

export function Suggestions(props: {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {props.suggestions.map((suggestion) => (
        <Button
          variant="outline"
          key={suggestion}
          onClick={() => props.onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
