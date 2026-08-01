import { Decimal } from "@prisma/client/runtime/client";

import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { createMqttClient } from "./mqtt.client";

type HealthMeasurementPayload = {
	serialNumber: string;
	heartRate?: number;
	spo2?: number;
	temp?: number;
	systolicPressure?: number;
	diastolicPressure?: number;
	respiratoryRate?: number;
	timestamp?: string;
};

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === "number" && Number.isFinite(value);
};

const normalizePayload = (rawPayload: string): HealthMeasurementPayload | null => {
	try {
		const parsedPayload = JSON.parse(rawPayload) as Partial<HealthMeasurementPayload>;

		if (!parsedPayload.serialNumber || typeof parsedPayload.serialNumber !== "string") {
			return null;
		}

		return {
			serialNumber: parsedPayload.serialNumber,
			heartRate: isFiniteNumber(parsedPayload.heartRate) ? parsedPayload.heartRate : undefined,
			spo2: isFiniteNumber(parsedPayload.spo2) ? parsedPayload.spo2 : undefined,
			temp: isFiniteNumber(parsedPayload.temp) ? parsedPayload.temp : undefined,
			systolicPressure: isFiniteNumber(parsedPayload.systolicPressure) ? parsedPayload.systolicPressure : undefined,
			diastolicPressure: isFiniteNumber(parsedPayload.diastolicPressure) ? parsedPayload.diastolicPressure : undefined,
			respiratoryRate: isFiniteNumber(parsedPayload.respiratoryRate) ? parsedPayload.respiratoryRate : undefined,
			timestamp: typeof parsedPayload.timestamp === "string" ? parsedPayload.timestamp : undefined
		};
	} catch {
		return null;
	}
};

const persistMeasurement = async (payload: HealthMeasurementPayload) => {
	const deviceId = await prisma.device.findUnique({
		where: {
			serialNumber: payload.serialNumber
		},
		select: {
			id: true
		}
	});

	if (!deviceId) {
		console.warn(`[mqtt] Unknown serialNumber ${payload.serialNumber}`);
		return;
	}
	const patientDeviceId = await prisma.patientDevice.findFirst({
		where: {
			deviceId: deviceId.id,
			unassignedAt: null
		},
		select: {
			id: true,
		}
	});

	if (!patientDeviceId) {
		console.warn(`[mqtt] Unknown patientDevice for serialNumber ${payload.serialNumber}`);
		return;
	}

	await prisma.healthMeasurement.create({
		data: {
			patientDeviceId: patientDeviceId.id,
			heartRate: payload.heartRate,
			spo2: payload.spo2,
			temp: payload.temp === undefined ? undefined : new Decimal(payload.temp),
			systolicPressure: payload.systolicPressure,
			diastolicPressure: payload.diastolicPressure,
			respiratoryRate: payload.respiratoryRate,
			timestamp: payload.timestamp ? new Date(payload.timestamp) : undefined
		}
	});

	await prisma.device.update({
		where: {
			id: deviceId.id
		},
		data: {
			lastConnected: new Date()
		}
	});

	console.log(`[mqtt] Stored measurement for patientDeviceId=${patientDeviceId.id}`);
};

export const startMqttHealthIngest = () => {
	const client = createMqttClient();

	client.on("connect", () => {
		console.log(`[mqtt] Connected to ${env.MQTT_URL}`);

		client.subscribe(env.MQTT_TOPIC, (error) => {
			if (error) {
				console.error(`[mqtt] Failed to subscribe to ${env.MQTT_TOPIC}`, error);
				return;
			}

			console.log(`[mqtt] Subscribed to ${env.MQTT_TOPIC}`);
		});
	});

	client.on("message", (topic, message) => {
		if (topic !== env.MQTT_TOPIC) {
			return;
		}

		const payload = normalizePayload(message.toString());

		if (!payload) {
			console.warn(`[mqtt] Ignored invalid message on ${topic}`);
			return;
		}

		void persistMeasurement(payload).catch((error) => {
			console.error("[mqtt] Failed to persist measurement", error);
		});
	});

	client.on("error", (error) => {
		console.error("[mqtt] Client error", error);
	});

	client.on("reconnect", () => {
		console.log("[mqtt] Reconnecting...");
	});

	return client;
};
