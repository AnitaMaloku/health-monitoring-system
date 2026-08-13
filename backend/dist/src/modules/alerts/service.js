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
exports.resolveAlert = exports.getAlertById = exports.getAlertsByPatientId = exports.getAlerts = exports.createAlert = void 0;
const api_error_1 = require("../../utils/api-error");
const alertRepository = __importStar(require("./repository"));
const createAlert = async (data) => {
    if (!data.patientId) {
        throw new api_error_1.ApiError(400, "patientId is required");
    }
    if (data.level !== "WARNING" && data.level !== "CRITICAL") {
        throw new api_error_1.ApiError(400, "level must be WARNING or CRITICAL");
    }
    return alertRepository.create(data);
};
exports.createAlert = createAlert;
const getAlerts = async () => {
    return alertRepository.findAll();
};
exports.getAlerts = getAlerts;
const getAlertsByPatientId = async (patientId) => {
    return alertRepository.findByPatientId(patientId);
};
exports.getAlertsByPatientId = getAlertsByPatientId;
const getAlertById = async (id) => {
    const alert = await alertRepository.findById(id);
    if (!alert) {
        throw new api_error_1.ApiError(404, "Alert not found");
    }
    return alert;
};
exports.getAlertById = getAlertById;
const resolveAlert = async (id) => {
    await (0, exports.getAlertById)(id);
    return alertRepository.resolve(id);
};
exports.resolveAlert = resolveAlert;
