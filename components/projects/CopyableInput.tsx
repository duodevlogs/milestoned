"use client";

export function CopyableInput({ value }: { value: string }) {
  return (
    <input
      className="ms-field font-mono text-[12.5px]"
      type="text"
      readOnly
      value={value}
      onFocus={(e) => e.target.select()}
    />
  );
}
