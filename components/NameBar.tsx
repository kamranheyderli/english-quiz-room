"use client";

import { chakra, Input, NativeSelect } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { AgeGroup } from "@/lib/types";
import { Card } from "./ui/kit";

type Props = {
  name: string;
  onName: (value: string) => void;
  missing?: boolean;
  /** When given, an age select is shown next to the name. */
  ages?: { list: AgeGroup[]; value: string | null; onChange: (id: string) => void; missing?: boolean };
};

const field = { bg: "page", borderColor: "line", rounded: "10px", fontSize: "15px", color: "ink" } as const;

const NameBar = forwardRef<HTMLInputElement, Props>(function NameBar({ name, onName, missing, ages }, ref) {
  return (
    <Card display="flex" flexWrap="wrap" gap="10px" alignItems="center" px="14px" py="12px">
      <chakra.label htmlFor="student-name" fontWeight="500">
        Adın və soyadın
      </chakra.label>
      <Input
        id="student-name"
        ref={ref}
        {...field}
        flex="1 1 200px"
        minW="0"
        w="auto"
        borderColor={missing ? "bad" : "line"}
        placeholder={missing ? "Əvvəlcə adını yaz" : "məs. Rəşidə Həqiqətli"}
        value={name}
        autoComplete="name"
        onChange={(e) => onName(e.target.value)}
      />
      {ages && (
        <NativeSelect.Root w="auto">
          <NativeSelect.Field
            id="student-age"
            aria-label="Yaş qrupu"
            {...field}
            borderColor={ages.missing ? "bad" : "line"}
            value={ages.value ?? ""}
            onChange={(e) => ages.onChange(e.target.value)}
          >
            <option value="" disabled>
              Yaşın
            </option>
            {ages.list.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} yaş
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      )}
    </Card>
  );
});

export default NameBar;
