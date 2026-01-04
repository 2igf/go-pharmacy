import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  getProducts,
  getProductsByCategory,
  getProductById,
  searchProducts,
  getDoctors,
  getDoctorsBySpecialty,
  getDoctorById,
  getDoctorTimeSlots,
  getUserAppointments,
  getAppointmentById,
  getDoctorAppointments,
  getUserOrders,
  getOrderById,
  getUserCartItems,
  getCartItemById,
  getUserMedicationReminders,
  getMedicationReminderById,
  getMedicationReminderLogs,
  getUserAddresses,
  getAddressById,
  getUserPrescriptions,
  getPrescriptionById,
} from "./db";
import {
  products,
  appointments,
  cartItems,
  orders,
  orderItems,
  medicationReminders,
  medicationReminderLogs,
  userAddresses,
  prescriptions,
} from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= PRODUCTS ROUTER =============
  products: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await getProducts(input.limit, input.offset);
      }),

    byCategory: publicProcedure
      .input(z.object({
        category: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await getProductsByCategory(input.category, input.limit, input.offset);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProductById(input.id);
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await searchProducts(input.query, input.limit);
      }),
  }),

  // ============= DOCTORS ROUTER =============
  doctors: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await getDoctors(input.limit, input.offset);
      }),

    bySpecialty: publicProcedure
      .input(z.object({
        specialty: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await getDoctorsBySpecialty(input.specialty, input.limit, input.offset);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDoctorById(input.id);
      }),

    timeSlots: publicProcedure
      .input(z.object({ doctorId: z.number() }))
      .query(async ({ input }) => {
        return await getDoctorTimeSlots(input.doctorId);
      }),
  }),

  // ============= APPOINTMENTS ROUTER =============
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserAppointments(ctx.user.id);
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getAppointmentById(input.id);
      }),

    byDoctor: publicProcedure
      .input(z.object({ doctorId: z.number() }))
      .query(async ({ input }) => {
        return await getDoctorAppointments(input.doctorId);
      }),

    create: protectedProcedure
      .input(z.object({
        doctorId: z.number(),
        appointmentDate: z.date(),
        consultationType: z.enum(["in_clinic", "video", "chat"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(appointments).values({
          userId: ctx.user.id,
          doctorId: input.doctorId,
          appointmentDate: input.appointmentDate,
          consultationType: input.consultationType,
          notes: input.notes,
          status: "scheduled",
        });

        return result;
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const appointment = await getAppointmentById(input.id);
        if (!appointment || appointment.userId !== ctx.user.id) {
          throw new Error("Appointment not found or unauthorized");
        }

        await db.update(appointments)
          .set({ status: "cancelled" })
          .where(eq(appointments.id, input.id));

        return { success: true };
      }),
  }),

  // ============= CART ROUTER =============
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCartItems(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        prescriptionId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if product exists
        const product = await getProductById(input.productId);
        if (!product) throw new Error("Product not found");

        // Check if item already in cart
        const existing = await db.select().from(cartItems)
          .where(
            eq(cartItems.userId, ctx.user.id) &&
            eq(cartItems.productId, input.productId)
          );

        if (existing.length > 0) {
          // Update quantity
          await db.update(cartItems)
            .set({ quantity: existing[0].quantity + input.quantity })
            .where(eq(cartItems.id, existing[0].id));
        } else {
          // Add new item
          await db.insert(cartItems).values({
            userId: ctx.user.id,
            productId: input.productId,
            quantity: input.quantity,
            prescriptionId: input.prescriptionId,
          });
        }

        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const item = await getCartItemById(input.id);
        if (!item || item.userId !== ctx.user.id) {
          throw new Error("Cart item not found or unauthorized");
        }

        await db.delete(cartItems).where(eq(cartItems.id, input.id));
        return { success: true };
      }),

    updateQuantity: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const item = await getCartItemById(input.id);
        if (!item || item.userId !== ctx.user.id) {
          throw new Error("Cart item not found or unauthorized");
        }

        await db.update(cartItems)
          .set({ quantity: input.quantity })
          .where(eq(cartItems.id, input.id));

        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(cartItems).where(eq(cartItems.userId, ctx.user.id));
      return { success: true };
    }),
  }),

  // ============= ORDERS ROUTER =============
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOrders(ctx.user.id);
    }),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new Error("Order not found or unauthorized");
        }
        return order;
      }),

    create: protectedProcedure
      .input(z.object({
        addressId: z.number(),
        paymentMethod: z.enum(["cash", "card"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get cart items
        const userCartItems = await getUserCartItems(ctx.user.id);
        if (userCartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        // Get address
        const address = await getAddressById(input.addressId);
        if (!address || address.userId !== ctx.user.id) {
          throw new Error("Address not found or unauthorized");
        }

        // Calculate total
        let totalAmount = "0";
        for (const cartItem of userCartItems) {
          const product = await getProductById(cartItem.productId);
          if (product) {
            totalAmount = (parseFloat(totalAmount) + parseFloat(product.price) * cartItem.quantity).toString();
          }
        }

        // Create order
        const orderNumber = `ORD-${Date.now()}`;
        const [orderResult] = await db.insert(orders).values({
          userId: ctx.user.id,
          orderNumber,
          totalAmount: totalAmount as any,
          status: "pending",
          deliveryAddress: address.address,
          deliveryLatitude: address.latitude,
          deliveryLongitude: address.longitude,
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
        });

        // Add order items
        for (const cartItem of userCartItems) {
          const product = await getProductById(cartItem.productId);
          if (product) {
            await db.insert(orderItems).values({
              orderId: orderResult?.insertId || 0,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: product.price as any,
            });
          }
        }

        // Clear cart
        await db.delete(cartItems).where(eq(cartItems.userId, ctx.user.id));

        return { orderId: orderResult?.insertId || 0, orderNumber };
      }),
  }),

  // ============= MEDICATION REMINDERS ROUTER =============
  medicationReminders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserMedicationReminders(ctx.user.id);
    }),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const reminder = await getMedicationReminderById(input.id);
        if (!reminder || reminder.userId !== ctx.user.id) {
          throw new Error("Reminder not found or unauthorized");
        }
        return reminder;
      }),

    logs: protectedProcedure
      .input(z.object({ reminderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const reminder = await getMedicationReminderById(input.reminderId);
        if (!reminder || reminder.userId !== ctx.user.id) {
          throw new Error("Reminder not found or unauthorized");
        }
        return await getMedicationReminderLogs(input.reminderId);
      }),

    create: protectedProcedure
      .input(z.object({
        medicationName: z.string(),
        dosage: z.string().optional(),
        frequency: z.enum([
          "once_daily",
          "twice_daily",
          "three_times_daily",
          "four_times_daily",
          "every_6_hours",
          "every_8_hours",
          "every_12_hours",
          "weekly",
          "as_needed"
        ]),
        startDate: z.date(),
        endDate: z.date().optional(),
        reminderTimes: z.array(z.string()),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [result] = await db.insert(medicationReminders).values({
          userId: ctx.user.id,
          medicationName: input.medicationName,
          dosage: input.dosage,
          frequency: input.frequency,
          startDate: input.startDate,
          endDate: input.endDate,
          reminderTimes: JSON.stringify(input.reminderTimes),
          notes: input.notes,
          isActive: true,
        });

        return { id: result.insertId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const reminder = await getMedicationReminderById(input.id);
        if (!reminder || reminder.userId !== ctx.user.id) {
          throw new Error("Reminder not found or unauthorized");
        }

        await db.update(medicationReminders)
          .set({
            isActive: input.isActive !== undefined ? input.isActive : reminder.isActive,
            notes: input.notes !== undefined ? input.notes : reminder.notes,
          })
          .where(eq(medicationReminders.id, input.id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const reminder = await getMedicationReminderById(input.id);
        if (!reminder || reminder.userId !== ctx.user.id) {
          throw new Error("Reminder not found or unauthorized");
        }

        await db.delete(medicationReminders).where(eq(medicationReminders.id, input.id));
        return { success: true };
      }),
  }),

  // ============= ADDRESSES ROUTER =============
  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserAddresses(ctx.user.id);
    }),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const address = await getAddressById(input.id);
        if (!address || address.userId !== ctx.user.id) {
          throw new Error("Address not found or unauthorized");
        }
        return address;
      }),

    create: protectedProcedure
      .input(z.object({
        label: z.string().optional(),
        address: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [result] = await db.insert(userAddresses).values({
          userId: ctx.user.id,
          label: input.label,
          address: input.address,
          latitude: input.latitude as any,
          longitude: input.longitude as any,
          isDefault: input.isDefault || false,
        });

        return { id: result.insertId };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const address = await getAddressById(input.id);
        if (!address || address.userId !== ctx.user.id) {
          throw new Error("Address not found or unauthorized");
        }

        await db.delete(userAddresses).where(eq(userAddresses.id, input.id));
        return { success: true };
      }),
  }),

  // ============= NOTIFICATIONS ROUTER =============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserNotifications } = await import("./db");
      return await getUserNotifications(ctx.user.id);
    }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const { getUnreadNotificationCount } = await import("./db");
      return await getUnreadNotificationCount(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { markNotificationAsRead } = await import("./db");
        return await markNotificationAsRead(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteNotification } = await import("./db");
        return await deleteNotification(input.id);
      }),
  }),

  // ============= PRESCRIPTIONS ROUTER =============
  prescriptions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPrescriptions(ctx.user.id);
    }),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const prescription = await getPrescriptionById(input.id);
        if (!prescription || prescription.userId !== ctx.user.id) {
          throw new Error("Prescription not found or unauthorized");
        }
        return prescription;
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Import eq from drizzle-orm for use in mutations
import { eq } from "drizzle-orm";
