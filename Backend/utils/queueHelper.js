import Service from "../models/Service.js";
import QueueToken from "../models/QueueToken.js";

/* ── Helper: recalculate estimated wait for all waiting tokens ──────────── */
export const recalcWaits = async (serviceId) => {
    const waiting = await QueueToken.find({
        serviceId,
        status: { $in: ["waiting", "next"] }
    }).sort({ position: 1 });
 
    const avgWait = (await Service.findById(serviceId))?.avgWait || 10;
 
    for (let i = 0; i < waiting.length; i++) {
        waiting[i].estimatedWait = i * avgWait;
        await waiting[i].save();
    }
};
 
/* ── Helper: generate next token number e.g. "H-A-089" ──────────────────── */
export const generateTokenNumber = async (service) => {
    service.tokenSequence += 1;
    await service.save();
    const prefix = service.tokenPrefix || service.counter;
    return `${prefix}-${String(service.tokenSequence).padStart(3, "0")}`;
};