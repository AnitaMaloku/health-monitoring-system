import mqtt, { IClientOptions, MqttClient } from "mqtt";

import { env } from "../../config/env";

export const createMqttClient = (options: IClientOptions = {}): MqttClient => {
	return mqtt.connect(env.MQTT_URL, {
		reconnectPeriod: 5000,
		...options
	});
};
