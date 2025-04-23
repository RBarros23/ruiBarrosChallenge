import { Request, Response } from "express";
import { PoiService } from "../services/poi.service";
import { prisma } from "../utils/prisma/prisma";

/**
 * Controller class handling POI-related HTTP requests.
 * Manages operations for creating, retrieving, updating, and managing Points of Interest.
 */
export class PoiController {
  private poiService: PoiService;

  constructor(poiService: PoiService = new PoiService(prisma)) {
    this.poiService = poiService;
  }

  async createPoi(req: Request, res: Response) {
    try {
      const poiData = req.body;
      const newPoi = await this.poiService.createPoi(poiData);

      return res.status(201).json(newPoi);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to create POI" });
    }
  }

  async getPoiById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const poi = await this.poiService.getPoiById(id);

      if (!poi) {
        return res.status(404).json({ error: "POI not found" });
      }

      return res.status(200).json(poi);
    } catch (error) {
      console.error("Error getting POI by id:", error);
      return res.status(500).json({ error: "Failed to retrieve POI" });
    }
  }

  async listPois(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const pois = await prisma.pOI.findMany({
        skip,
        take: limit,
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

      const total = await prisma.pOI.count();

      return res.status(200).json({
        data: pois,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error listing POIs:", error);
      return res.status(500).json({ error: "Failed to retrieve POIs" });
    }
  }

  async updatePoi(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedPoi = await this.poiService.updatePoi(id, updateData);

      return res.status(200).json(updatedPoi);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update POI" });
    }
  }

  async deletePoi(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.poiService.deletePoi(id);

      return res.status(200).json({ message: "POI deleted successfully" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete POI" });
    }
  }

  async updatePoiStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedPoi = await this.poiService.updatePoiStatus(id, status);

      return res.status(200).json(updatedPoi);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update POI status" });
    }
  }
}
