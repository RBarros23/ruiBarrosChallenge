import { Router, Request, Response } from "express";
import { PoiController } from "../controllers/poi.controller";

/**
 * Creates and configures a router for POI-related endpoints
 * @param poiController - The POI controller instance to use
 */
export const createPoiRouter = (poiController: PoiController) => {
  const router = Router();

  /**
   * Creates a new POI
   * @route POST /api/poi
   * @param {Object} body.required - POI data including name, status, and optional address and opening hours
   * @returns {Object} 201 - Created POI object
   * @returns {Error} 400 - Invalid input data
   */
  router.post("/", poiController.createPoi.bind(poiController));

  /**
   * Lists POIs with pagination
   * @route GET /api/poi
   * @param {number} page.query - Page number (default: 1)
   * @param {number} limit.query - Results per page (default: 10)
   * @returns {Object} 200 - List of POIs with pagination info
   * @returns {Error} 500 - Server error
   */
  router.get("/", poiController.listPois);

  /**
   * Gets a POI by ID
   * @route GET /api/poi/:id
   * @param {string} id.path.required - The ID of the POI to retrieve
   * @returns {Object} 200 - POI object with all related data
   * @returns {Error} 404 - POI not found
   */
  router.get("/:id", poiController.getPoiById);

  /**
   * Updates a POI
   * @route PUT /api/poi/:id
   * @param {string} id.path.required - The ID of the POI to update
   * @param {Object} body.required - POI data to update
   * @returns {Object} 200 - Updated POI object
   * @returns {Error} 404 - POI not found
   * @returns {Error} 400 - Invalid input data
   */
  router.put("/:id", poiController.updatePoi);

  /**
   * Deletes a POI
   * @route DELETE /api/poi/:id
   * @param {string} id.path.required - The ID of the POI to delete
   * @returns {Object} 200 - Success message
   * @returns {Error} 404 - POI not found
   */
  router.delete("/:id", poiController.deletePoi);

  /**
   * Updates a POI's status
   * @route PATCH /api/poi/:id/status
   * @param {string} id.path.required - The ID of the POI
   * @param {string} status.body.required - The new status (ONLINE, OFFLINE, or MAINTENANCE)
   * @returns {Object} 200 - Updated POI object
   * @returns {Error} 404 - POI not found
   * @returns {Error} 400 - Invalid status
   * @returns {Error} 500 - Server error
   */
  router.patch("/:id/status", poiController.updatePoiStatus);

  return router;
};
