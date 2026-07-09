import { render, screen } from "@testing-library/react";
import { EmployeeIdField } from "../features/login/EmployeeIdField";
import { PinField } from "../features/login/PinField";
import { DemoCredentialHint } from "../features/login/DemoCredentialHint";
import { demoCredential } from "../mocks/seed/employees";

describe("EmployeeIdField", () => {
  it("renders the current value", () => {
    render(<EmployeeIdField value="ABC12" />);
    expect(screen.getByLabelText("Employee ID")).toHaveValue("ABC12");
  });

  it("is read-only (driven by the number pad)", () => {
    render(<EmployeeIdField value="" />);
    expect(screen.getByLabelText("Employee ID")).toHaveAttribute("readonly");
  });

  it("shows an error message when provided", () => {
    render(<EmployeeIdField value="999999" error="Employee not found" />);
    expect(screen.getByText("Employee not found")).toBeInTheDocument();
  });
});

describe("PinField", () => {
  it("masks the PIN input", () => {
    render(<PinField value="12" />);
    const input = screen.getByLabelText("PIN");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("12");
  });

  it("shows an error message when provided", () => {
    render(<PinField value="00" error="Incorrect PIN" />);
    expect(screen.getByText("Incorrect PIN")).toBeInTheDocument();
  });
});

describe("DemoCredentialHint", () => {
  it("shows the seeded demo credentials", () => {
    render(<DemoCredentialHint />);
    expect(screen.getByText(demoCredential.employeeId)).toBeInTheDocument();
    expect(screen.getByText(demoCredential.pin)).toBeInTheDocument();
  });
});
