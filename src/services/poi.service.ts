import { PoiStatus, POI, PrismaClient } from "@prisma/client";
import { prisma } from "../utils/prisma/prisma";
import { CreatePoiDto } from "../models/poi.model";

export class PoiService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createPoi(data: CreatePoiDto): Promise<POI> {
    try {
      const poi = await this.prisma.pOI.create({
        data: {
          name: data.name,
          status: data.status,
          address: data.address
            ? {
                create: {
                  country: data.address.country,
                  zipCode: data.address.zipCode,
                  city: data.address.city,
                  street: data.address.street,
                  houseNumber: data.address.houseNumber,
                },
              }
            : undefined,
          openingHours: data.openingHours
            ? {
                createMany: {
                  data: data.openingHours.map((hours) => ({
                    dayOfWeek: hours.dayOfWeek,
                    openTime: hours.openTime,
                    closeTime: hours.closeTime,
                    isClosed: hours.isClosed,
                  })),
                },
              }
            : undefined,
        },
      });
      return new POI(
        poi.id,
        poi.name,
        poi.status,
        poi.createdAt,
        poi.updatedAt
      );
    } catch (error) {
      throw new Error("Failed to create POI");
    }
  }

  async getPoiById(id: string): Promise<POI> {
    const poi = await prisma.pOI.findUnique({
      where: { id },
      include: {
        address: true,
        openingHours: true,
        pumps: {
          include: {
            fuelProducts: {
              include: {
                prices: true,
              },
            },
          },
        },
      },
    });

    if (!poi) {
      throw new Error(`POI with ID ${id} not found`);
    }

    return poi;
  }

  async updatePoi(id: string, data: Partial<CreatePoiDto>): Promise<POI> {
    const poiExists = await prisma.pOI.findUnique({ where: { id } });
    if (!poiExists) {
      throw new Error(`POI with ID ${id} not found`);
    }

    return prisma.$transaction(async (tx) => {
      if (data.name || data.status !== undefined) {
        await tx.pOI.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.status !== undefined && { status: data.status }),
          },
        });
      }

      if (data.address) {
        const existingAddress = await tx.address.findUnique({
          where: { poiId: id },
        });

        if (existingAddress) {
          await tx.address.update({
            where: { poiId: id },
            data: data.address,
          });
        } else {
          await tx.address.create({
            data: {
              ...data.address,
              poiId: id,
            },
          });
        }
      }

      if (data.openingHours && data.openingHours.length > 0) {
        await tx.openingHours.deleteMany({
          where: { poiId: id },
        });

        await tx.openingHours.createMany({
          data: data.openingHours.map((hours) => ({
            dayOfWeek: hours.dayOfWeek,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isClosed: hours.isClosed,
            poiId: id,
          })),
        });
      }

      return this.getPoiById(id);
    });
  }

  async deletePoi(id: string): Promise<void> {
    const poiExists = await prisma.pOI.findUnique({ where: { id } });
    if (!poiExists) {
      throw new Error(`POI with ID ${id} not found`);
    }

    await prisma.pOI.delete({
      where: { id },
    });
  }

  async updatePoiStatus(id: string, status: PoiStatus): Promise<POI> {
    const poiExists = await prisma.pOI.findUnique({ where: { id } });
    if (!poiExists) {
      throw new Error(`POI with ID ${id} not found`);
    }

    await prisma.pOI.update({
      where: { id },
      data: { status },
    });

    return this.getPoiById(id);
  }
}
