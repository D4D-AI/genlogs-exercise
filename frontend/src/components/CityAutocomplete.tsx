import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (city: string) => void;
}

/**
 * A city text input with Google Places autocomplete (restricted to cities).
 *
 * Uses the classic `google.maps.places.Autocomplete` widget: its API has been stable for
 * years, which makes it the reliable choice here. It can be swapped for the newer
 * `PlaceAutocompleteElement` if the deprecation warning becomes a concern.
 */
export default function CityAutocomplete({
  id,
  label,
  value,
  placeholder,
  onChange,
}: Props) {
  const places = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  // Keep the latest onChange without re-running the binding effect on every render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const autocomplete = new places.Autocomplete(inputRef.current, {
      types: ["(cities)"],
      fields: ["name"],
    });
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      onChangeRef.current(place.name ?? inputRef.current?.value ?? "");
    });
    return () => listener.remove();
  }, [places]);

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
