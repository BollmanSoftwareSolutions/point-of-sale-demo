// Reusable number pad (Login uses 0-9 + A-D; Payment uses 0-9 only).
// See design-docs/03-ui-components.md (Shared Components).

import { Box, Button } from "@mui/material";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";

export interface NumberPadProps {
  onKey: (value: string) => void;
  onBackspace?: () => void;
  includeLetters?: boolean; // adds the A–D column (Login)
  disabled?: boolean;
}

const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "back"],
];

const LETTERS = ["A", "B", "C", "D"];

type Cell = { key: string; label: string; kind: "letter" | "digit" | "back" | "empty" };

export function NumberPad({
  onKey,
  onBackspace,
  includeLetters = false,
  disabled = false,
}: NumberPadProps) {
  const columns = includeLetters ? 4 : 3;

  const cells: Cell[] = [];
  DIGIT_ROWS.forEach((row, rowIndex) => {
    if (includeLetters) {
      const letter = LETTERS[rowIndex];
      cells.push({ key: `letter-${letter}`, label: letter, kind: "letter" });
    }
    row.forEach((value, colIndex) => {
      if (value === "") cells.push({ key: `empty-${rowIndex}-${colIndex}`, label: "", kind: "empty" });
      else if (value === "back") cells.push({ key: "back", label: "", kind: "back" });
      else cells.push({ key: value, label: value, kind: "digit" });
    });
  });

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1.5 }}>
      {cells.map((cell) => {
        if (cell.kind === "empty") return <Box key={cell.key} />;

        if (cell.kind === "back") {
          return (
            <Button
              key={cell.key}
              variant="outlined"
              color="inherit"
              disabled={disabled || !onBackspace}
              onClick={() => onBackspace?.()}
              aria-label="Backspace"
              sx={{ height: 64 }}
            >
              <BackspaceOutlinedIcon />
            </Button>
          );
        }

        const isLetter = cell.kind === "letter";
        return (
          <Button
            key={cell.key}
            variant={isLetter ? "contained" : "outlined"}
            color={isLetter ? "secondary" : "primary"}
            disabled={disabled}
            onClick={() => onKey(cell.label)}
            sx={{ height: 64, fontSize: "1.5rem", fontWeight: 600 }}
          >
            {cell.label}
          </Button>
        );
      })}
    </Box>
  );
}
