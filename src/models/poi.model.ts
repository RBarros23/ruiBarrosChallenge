import { PoiStatus, DayOfWeek } from "@prisma/client";
import { z } from "zod";

export const CreateAddressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  houseNumber: z.string().min(1, "House number is required"),
});

export const CreateOpeningHoursSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek, {
    errorMap: () => ({
      message: `Day of week must be one of: ${Object.values(DayOfWeek).join(
        ", "
      )}`,
    }),
  }),
  openTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Open time must be in HH:MM format"),
  closeTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Close time must be in HH:MM format"),
  isClosed: z.boolean(),
});

export const CreatePoiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.nativeEnum(PoiStatus, {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(PoiStatus).join(", ")}`,
    }),
  }),
  address: CreateAddressSchema.optional(),
  openingHours: z.array(CreateOpeningHoursSchema).optional(),
});

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type CreateOpeningHoursDto = z.infer<typeof CreateOpeningHoursSchema>;
export type CreatePoiDto = z.infer<typeof CreatePoiSchema>;

export class POI {
  public id: string;
  public name: string;
  public status: PoiStatus;
  public createdAt: Date;
  public updatedAt: Date;
  public address?: Address;
  public openingHours?: OpeningHours[];
  public pumps?: Pump[];

  constructor(
    id: string,
    name: string,
    status: PoiStatus,
    createdAt: Date,
    updatedAt: Date,
    address?: Address,
    openingHours?: OpeningHours[],
    pumps?: Pump[]
  ) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.address = address;
    this.openingHours = openingHours;
    this.pumps = pumps;
  }

  public open(): void {
    this.status = PoiStatus.ONLINE;
  }

  public close(): void {
    this.status = PoiStatus.OFFLINE;
  }

  public maintenance(): void {
    this.status = PoiStatus.MAINTENANCE;
  }

  public addPump(pump: Pump): void {
    if (!this.pumps) {
      this.pumps = [];
    }
    this.pumps.push(pump);
  }

  public removePump(pumpId: string): void {
    if (this.pumps) {
      this.pumps = this.pumps.filter((pump) => pump.id !== pumpId);
    }
  }
}

export class Address {
  public id: string;
  public country: string;
  public zipCode: string;
  public city: string;
  public street: string;
  public houseNumber: string;
  public poiId: string;

  constructor(
    id: string,
    country: string,
    zipCode: string,
    city: string,
    street: string,
    houseNumber: string,
    poiId: string
  ) {
    this.id = id;
    this.country = country;
    this.zipCode = zipCode;
    this.city = city;
    this.street = street;
    this.houseNumber = houseNumber;
    this.poiId = poiId;
  }
}

export class OpeningHours {
  public id: string;
  public dayOfWeek: DayOfWeek;
  public openTime: string;
  public closeTime: string;
  public isClosed: boolean;
  public poiId: string;

  constructor(
    id: string,
    dayOfWeek: DayOfWeek,
    openTime: string,
    closeTime: string,
    isClosed: boolean,
    poiId: string
  ) {
    this.id = id;
    this.dayOfWeek = dayOfWeek;
    this.openTime = openTime;
    this.closeTime = closeTime;
    this.isClosed = isClosed;
    this.poiId = poiId;
  }
}

export class Pump {
  public id: string;
  public pumpName: string;
  public poiId: string;
  public fuelProducts?: FuelProduct[];

  constructor(
    id: string,
    pumpName: string,
    poiId: string,
    fuelProducts?: FuelProduct[]
  ) {
    this.id = id;
    this.pumpName = pumpName;
    this.poiId = poiId;
    this.fuelProducts = fuelProducts;
  }

  public addFuelProduct(fuelProduct: FuelProduct): void {
    if (!this.fuelProducts) {
      this.fuelProducts = [];
    }
    this.fuelProducts.push(fuelProduct);
  }

  public removeFuelProduct(fuelProductId: string): void {
    if (this.fuelProducts) {
      this.fuelProducts = this.fuelProducts.filter(
        (fp) => fp.id !== fuelProductId
      );
    }
  }
}

export class FuelProduct {
  public id: string;
  public name: string;
  public pumpId: string;
  public prices?: Price[];

  constructor(id: string, name: string, pumpId: string, prices?: Price[]) {
    this.id = id;
    this.name = name;
    this.pumpId = pumpId;
    this.prices = prices;
  }

  public addPrice(price: Price): void {
    if (!this.prices) {
      this.prices = [];
    }
    this.prices.push(price);
  }
}

export class Price {
  public id: string;
  public amount: number;
  public currency: string;
  public fuelProductId: string;

  constructor(
    id: string,
    amount: number,
    currency: string,
    fuelProductId: string
  ) {
    this.id = id;
    this.amount = amount;
    this.currency = currency;
    this.fuelProductId = fuelProductId;
  }
}
