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
exports.resolveAlert = exports.getAlertsByPatientId = exports.getAlerts = exports.createAlert = void 0;
const alertService = __importStar(require("./service"));
const createAlert = async (req, res, next) => {
    try {
        const alert = await alertService.createAlert(req.body);
        res.status(201).json(alert);
    }
    catch (error) {
        next(error);
    }
};
exports.createAlert = createAlert;
const getAlerts = async (req, res, next) => {
    try {
        const alerts = await alertService.getAlerts();
        res.status(200).json(alerts);
    }
    catch (error) {
        next(error);
    }
};
exports.getAlerts = getAlerts;
const getAlertsByPatientId = async (req, res, next) => {
    try {
        const alerts = await alertService.getAlertsByPatientId(req.params.patientId);
        res.status(200).json(alerts);
    }
    catch (error) {
        next(error);
    }
};
exports.getAlertsByPatientId = getAlertsByPatientId;
const resolveAlert = async (req, res, next) => {
    try {
        const alert = await alertService.resolveAlert(req.params.id);
        res.status(200).json(alert);
    }
    catch (error) {
        next(error);
    }
};
exports.resolveAlert = resolveAlert;
