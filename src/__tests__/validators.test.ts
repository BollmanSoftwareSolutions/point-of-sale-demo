import { isEmployeeIdChar, isPinChar, isValidEmployeeId, isValidPin } from "../lib/validators";

describe("isValidEmployeeId", () => {
  it("accepts 6 chars from [0-9A-D]", () => {
    expect(isValidEmployeeId("ABC123")).toBe(true);
    expect(isValidEmployeeId("1A2B3C")).toBe(true);
    expect(isValidEmployeeId("DDDD00")).toBe(true);
  });

  it("rejects invalid ids", () => {
    expect(isValidEmployeeId("ABCEFG")).toBe(false); // E, F not allowed
    expect(isValidEmployeeId("ABC12")).toBe(false); // too short
    expect(isValidEmployeeId("ABC1234")).toBe(false); // too long
    expect(isValidEmployeeId("abc123")).toBe(false); // lowercase
    expect(isValidEmployeeId("")).toBe(false);
  });
});

describe("isValidPin", () => {
  it("accepts exactly 4 digits", () => {
    expect(isValidPin("0000")).toBe(true);
    expect(isValidPin("1234")).toBe(true);
  });

  it("rejects non-4-digit pins", () => {
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("12A4")).toBe(false);
    expect(isValidPin("")).toBe(false);
  });
});

describe("character guards", () => {
  it("isEmployeeIdChar allows 0-9 and A-D only", () => {
    expect(isEmployeeIdChar("A")).toBe(true);
    expect(isEmployeeIdChar("D")).toBe(true);
    expect(isEmployeeIdChar("5")).toBe(true);
    expect(isEmployeeIdChar("E")).toBe(false);
    expect(isEmployeeIdChar("a")).toBe(false);
  });

  it("isPinChar allows only digits", () => {
    expect(isPinChar("7")).toBe(true);
    expect(isPinChar("0")).toBe(true);
    expect(isPinChar("A")).toBe(false);
  });
});
