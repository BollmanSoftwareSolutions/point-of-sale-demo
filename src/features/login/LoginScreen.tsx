// Login screen — id then PIN entry via number pad.
// See design-docs/03-ui-components.md §1.

import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { NumberPad } from "../../components/NumberPad";
import { EmployeeIdField } from "./EmployeeIdField";
import { PinField } from "./PinField";
import { DemoCredentialHint } from "./DemoCredentialHint";
import { employeeExists } from "../../api/auth";
import { ApiRequestError } from "../../api/client";
import { useLogin } from "../../queries/useLogin";
import {
  isEmployeeIdChar,
  isPinChar,
  isValidEmployeeId,
  isValidPin,
} from "../../lib/validators";

const EMPLOYEE_ID_LENGTH = 6;
const PIN_LENGTH = 4;

export function LoginScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"id" | "pin">("id");
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [idError, setIdError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const existsMutation = useMutation({ mutationFn: employeeExists });
  const loginMutation = useLogin();

  const isPinStep = step === "pin";
  const busy = existsMutation.isPending || loginMutation.isPending;

  function handleKey(value: string) {
    if (isPinStep) {
      if (pin.length >= PIN_LENGTH || !isPinChar(value)) return;
      setPinError(null);
      setPin((prev) => prev + value);
    } else {
      if (employeeId.length >= EMPLOYEE_ID_LENGTH || !isEmployeeIdChar(value)) return;
      setIdError(null);
      setEmployeeId((prev) => prev + value);
    }
  }

  function handleBackspace() {
    if (isPinStep) {
      setPinError(null);
      setPin((prev) => prev.slice(0, -1));
    } else {
      setIdError(null);
      setEmployeeId((prev) => prev.slice(0, -1));
    }
  }

  function submitPin() {
    if (!isValidPin(pin)) {
      setPinError("Enter a 4-digit PIN");
      return;
    }
    loginMutation.mutate(
      { employeeId, pin },
      {
        onSuccess: () => navigate("/order"),
        onError: (error) => {
          const code = error instanceof ApiRequestError ? error.code : "";
          setPin("");
          setPinError(code === "invalid_pin" ? "Incorrect PIN" : "Login failed. Try again.");
        },
      },
    );
  }

  function submitId() {
    if (!isValidEmployeeId(employeeId)) {
      setIdError("Enter a 6-character employee ID");
      return;
    }
    existsMutation.mutate(employeeId, {
      onSuccess: (exists) => {
        if (exists) setStep("pin");
        else setIdError("Employee not found");
      },
      onError: () => setIdError("Something went wrong. Try again."),
    });
  }

  function handleSubmit() {
    if (busy) return;
    if (isPinStep) submitPin();
    else submitId();
  }

  const submitDisabled =
    busy ||
    (isPinStep ? pin.length !== PIN_LENGTH : employeeId.length !== EMPLOYEE_ID_LENGTH);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Stack spacing={3}>
          <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 700 }}>
            POS Login
          </Typography>

          <EmployeeIdField value={employeeId} error={idError} disabled={isPinStep} />
          {isPinStep && <PinField value={pin} error={pinError} />}

          <NumberPad
            onKey={handleKey}
            onBackspace={handleBackspace}
            includeLetters={!isPinStep}
            disabled={busy}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitDisabled}
            startIcon={busy ? <CircularProgress size={20} color="inherit" /> : undefined}
            sx={{ height: 56, fontSize: "1.1rem" }}
          >
            {isPinStep ? "Sign In" : "Submit"}
          </Button>

          <DemoCredentialHint />
        </Stack>
      </Paper>
    </Box>
  );
}
