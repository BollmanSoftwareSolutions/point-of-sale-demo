import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberPad } from "../components/NumberPad";

describe("NumberPad", () => {
  it("renders digits and the A–D column when includeLetters is set", () => {
    render(<NumberPad onKey={() => {}} includeLetters />);
    for (const label of ["A", "B", "C", "D", "0", "5", "9"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("omits the letter column when includeLetters is not set", () => {
    render(<NumberPad onKey={() => {}} />);
    expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "7" })).toBeInTheDocument();
  });

  it("calls onKey with the pressed value", async () => {
    const onKey = vi.fn();
    const user = userEvent.setup();
    render(<NumberPad onKey={onKey} includeLetters />);

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "A" }));

    expect(onKey).toHaveBeenNthCalledWith(1, "5");
    expect(onKey).toHaveBeenNthCalledWith(2, "A");
  });

  it("calls onBackspace when the backspace key is pressed", async () => {
    const onBackspace = vi.fn();
    const user = userEvent.setup();
    render(<NumberPad onKey={() => {}} onBackspace={onBackspace} />);

    await user.click(screen.getByRole("button", { name: "Backspace" }));

    expect(onBackspace).toHaveBeenCalledOnce();
  });

  it("disables all keys when disabled", () => {
    render(<NumberPad onKey={() => {}} includeLetters disabled />);
    expect(screen.getByRole("button", { name: "1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "A" })).toBeDisabled();
  });
});
