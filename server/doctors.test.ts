import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("doctors router", () => {
  it("should list doctors", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.doctors.list({ limit: 10, offset: 0 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("should filter doctors by specialty", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.doctors.bySpecialty({
      specialty: "dermatology",
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get doctor by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First, get a list to find a valid doctor ID
    const doctors = await caller.doctors.list({ limit: 1, offset: 0 });

    if (doctors.length > 0) {
      const doctor = await caller.doctors.byId({ id: doctors[0].id });
      expect(doctor).toBeDefined();
      expect(doctor?.id).toBe(doctors[0].id);
    }
  });

  it("should get doctor time slots", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First, get a list to find a valid doctor ID
    const doctors = await caller.doctors.list({ limit: 1, offset: 0 });

    if (doctors.length > 0) {
      const timeSlots = await caller.doctors.timeSlots({ doctorId: doctors[0].id });
      expect(Array.isArray(timeSlots)).toBe(true);
    }
  });
});
