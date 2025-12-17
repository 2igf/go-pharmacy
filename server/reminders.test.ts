import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("medication reminders router", () => {
  it("should list user medication reminders", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.medicationReminders.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a medication reminder", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await caller.medicationReminders.create({
      medicationName: "Aspirin",
      dosage: "500mg",
      frequency: "twice_daily",
      startDate: new Date(),
      reminderTimes: ["08:00", "20:00"],
      notes: "Take with food",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});

describe("addresses router", () => {
  it("should list user addresses", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.addresses.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create an address", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.addresses.create({
      label: "Home",
      address: "123 Main Street, Amman",
      latitude: "31.9454",
      longitude: "35.9284",
      isDefault: true,
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});
