import "reflect-metadata";
import { describe, it, expect } from "vitest";
import type { ConfigService } from "@nestjs/config";
import type { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";

const guard = new AuthGuard({ get: () => "secret123" } as unknown as ConfigService);
const check = (authorization?: string) =>
  guard.canActivate({
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization }, ip: "test" }) }),
  } as unknown as ExecutionContext);

describe("AuthGuard", () => {
  it.each(["Bearer secret123", "bearer secret123", "Bearer  secret123 "])("accepts %j", (h) => {
    expect(check(h)).toBe(true);
  });

  it.each([
    [undefined, "Missing authorization header"],
    ["Bearer ", "Invalid authorization format"],
    ["Basic secret123", "Invalid authorization format"],
    ["Bearer nope", "Invalid token"],
    ["Bearer secret1234", "Invalid token"],
  ])("rejects %j", (h, message) => {
    expect(() => check(h)).toThrow(message);
  });
});
