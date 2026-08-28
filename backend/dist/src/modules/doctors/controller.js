"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctors = getDoctors;
exports.getDoctorById = getDoctorById;
exports.createDoctor = createDoctor;
exports.updateDoctor = updateDoctor;
exports.deleteDoctor = deleteDoctor;
const service = __importStar(require("./service"));
async function getDoctors(_req, res, next) { try {
    res.json(await service.getDoctors());
}
catch (error) {
    next(error);
} }
async function getDoctorById(req, res, next) { try {
    res.json(await service.getDoctorById(req.params.id));
}
catch (error) {
    next(error);
} }
async function createDoctor(req, res, next) { try {
    res.status(201).json(await service.createDoctor(req.body));
}
catch (error) {
    next(error);
} }
async function updateDoctor(req, res, next) { try {
    res.json(await service.updateDoctor(req.params.id, req.body));
}
catch (error) {
    next(error);
} }
async function deleteDoctor(req, res, next) { try {
    await service.deleteDoctor(req.params.id);
    res.status(204).send();
}
catch (error) {
    next(error);
} }
