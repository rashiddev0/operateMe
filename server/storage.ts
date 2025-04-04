import type { Session } from "express-session";
import type { SessionData } from "express-session";
import createMemoryStore from "memorystore";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { User, Vehicle, OperationOrder, Passenger, InsertUser } from "@shared/schema";
import { db } from "./db";
import { users, vehicles, operationOrders, passengers } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

// Function to generate unique identifier with max 7 chars after prefix
function generateUID(role: string, id: number): string {
  const prefix = role === 'admin' ? 'ADM' : 'DRV';
  // Get last 4 chars of timestamp in base36
  const timestamp = Date.now().toString(36).slice(-4);
  // Get 3 random chars
  const randomSuffix = Math.random().toString(36).substring(2, 5);
  return `${prefix}-${timestamp}${randomSuffix}`.toUpperCase();
}

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: User): Promise<User>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByDriver(driverId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle>;
  getOperationOrder(id: number): Promise<OperationOrder | undefined>;
  getOperationOrdersByDriver(driverId: number): Promise<OperationOrder[]>;
  createOperationOrder(order: Omit<OperationOrder, "id">, passengers: Omit<Passenger, "id" | "orderId">[]): Promise<OperationOrder>;
  getPendingDrivers(): Promise<User[]>;
  getActiveDrivers(): Promise<User[]>;
  getSuspendedDrivers(): Promise<User[]>;
  updateDriverStatus(id: number, status: string): Promise<User | undefined>;
  updateVehicleStatus(id: number, driverId: number, isActive: boolean): Promise<Vehicle | undefined>;
  getDriverDetails(id: number): Promise<{
    driver: User,
    vehicles: Vehicle[],
    orders: OperationOrder[]
  } | undefined>;
  updateOperationOrder(order: OperationOrder): Promise<OperationOrder>;
  getPassengersByOrder(orderId: number): Promise<Passenger[]>;
  getAllOperationOrders(): Promise<OperationOrder[]>;
  updateDriver(id: number, updates: { status: string; isApproved: boolean }): Promise<User | undefined>;
  getVehicleByOrder(orderId: number): Promise<Vehicle | undefined>;
  deleteDriver(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });

    // Create default users if they don't exist
    this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    const adminUser = await this.getUserByUsername("admin");

    if (!adminUser) {
      const adminSalt = randomBytes(16).toString("hex");
      const adminBuf = (await scryptAsync("admin123", adminSalt, 64)) as Buffer;
      const adminHashedPassword = `${adminBuf.toString("hex")}.${adminSalt}`;

      await db.insert(users).values({
        username: "admin",
        password: adminHashedPassword,
        role: "admin",
        status: "active",
        isApproved: true,
        fullName: "Admin User",
        uid: generateUID('admin', 1),
        createdAt: new Date()
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: insertUser.role || 'driver',
      status: insertUser.status || 'pending',
      isApproved: insertUser.isApproved || false,
      uid: generateUID(insertUser.role || 'driver', Date.now()),
      createdAt: new Date()
    }).returning();
    return user;
  }

  async updateUser(user: User): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, user.id))
      .returning();
    return updatedUser;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.driverId, driverId));
  }

  async createVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicleStatus(id: number, driverId: number, isActive: boolean): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set({ isActive })
      .where(and(eq(vehicles.id, id), eq(vehicles.driverId, driverId)))
      .returning();
    return vehicle;
  }

  async getOperationOrder(id: number): Promise<OperationOrder | undefined> {
    const [order] = await db.select().from(operationOrders).where(eq(operationOrders.id, id));
    return order;
  }

  async getOperationOrdersByDriver(driverId: number): Promise<OperationOrder[]> {
    return db.select().from(operationOrders).where(eq(operationOrders.driverId, driverId));
  }

  async createOperationOrder(
    order: Omit<OperationOrder, "id">,
    passengersList: Omit<Passenger, "id" | "orderId">[]
  ): Promise<OperationOrder> {
    const [newOrder] = await db.insert(operationOrders).values(order).returning();

    // Create passengers for this order
    for (const passenger of passengersList) {
      await db.insert(passengers).values({
        ...passenger,
        orderId: newOrder.id
      });
    }

    return newOrder;
  }

  async getPendingDrivers(): Promise<User[]> {
    return db.select().from(users).where(and(
      eq(users.role, "driver"),
      eq(users.status, "pending")
    ));
  }

  async getActiveDrivers(): Promise<User[]> {
    return db.select().from(users).where(and(
      eq(users.role, "driver"),
      eq(users.status, "active")
    ));
  }

  async getSuspendedDrivers(): Promise<User[]> {
    return db.select().from(users).where(and(
      eq(users.role, "driver"),
      eq(users.status, "suspended")
    ));
  }

  async updateDriverStatus(id: number, status: string): Promise<User | undefined> {
    return this.updateDriver(id, { status, isApproved: status === "active" });
  }

  async getDriverDetails(id: number): Promise<{
    driver: User;
    vehicles: Vehicle[];
    orders: OperationOrder[];
  } | undefined> {
    const driver = await this.getUser(id);
    if (!driver) return undefined;

    const vehicles = await this.getVehiclesByDriver(id);
    const orders = await this.getOperationOrdersByDriver(id);

    return {
      driver,
      vehicles,
      orders
    };
  }

  async updateOperationOrder(order: OperationOrder): Promise<OperationOrder> {
    const [updatedOrder] = await db
      .update(operationOrders)
      .set(order)
      .where(eq(operationOrders.id, order.id))
      .returning();
    return updatedOrder;
  }

  async getPassengersByOrder(orderId: number): Promise<Passenger[]> {
    return db.select().from(passengers).where(eq(passengers.orderId, orderId));
  }

  async getAllOperationOrders(): Promise<OperationOrder[]> {
    return db.select().from(operationOrders);
  }

  async updateDriver(id: number, updates: { status: string; isApproved: boolean }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(and(eq(users.id, id), eq(users.role, "driver")))
      .returning();
    return updatedUser;
  }

  async getVehicleByOrder(orderId: number): Promise<Vehicle | undefined> {
    const [order] = await db.select().from(operationOrders).where(eq(operationOrders.id, orderId));
    if (!order || !order.vehicleId) return undefined;

    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, order.vehicleId));
    return vehicle;
  }

  async deleteDriver(id: number): Promise<boolean> {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // Get driver's orders first to cascade delete passengers
        const orders = await tx
          .select()
          .from(operationOrders)
          .where(eq(operationOrders.driverId, id));

        // Delete all passengers from driver's orders
        for (const order of orders) {
          await tx
            .delete(passengers)
            .where(eq(passengers.orderId, order.id));
        }

        // Delete all orders associated with the driver
        await tx
          .delete(operationOrders)
          .where(eq(operationOrders.driverId, id));

        // Delete all vehicles associated with the driver
        await tx
          .delete(vehicles)
          .where(eq(vehicles.driverId, id));

        // Finally delete the driver user record
        const [deletedUser] = await tx
          .delete(users)
          .where(and(
            eq(users.id, id),
            eq(users.role, "driver")
          ))
          .returning();

        if (!deletedUser) {
          throw new Error('No driver found with the specified ID');
        }

        return true;
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw new Error('Failed to delete driver and associated data');
    }
  }
}

export const storage = new DatabaseStorage();