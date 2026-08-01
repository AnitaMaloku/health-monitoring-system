const mqtt = require("mqtt");

const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "health/measurements";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 5000);


const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000
});

const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomDecimal = (min, max, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round((min + Math.random() * (max - min)) * factor) / factor;
};

const buildMeasurement = () => {
  const now = new Date().toISOString();

  return {
    serialNumber: "SIM-1001",
    heartRate: randomInteger(62, 108),
    spo2: randomInteger(94, 100),
    temp: randomDecimal(36.2, 38.0, 1),
    systolicPressure: randomInteger(104, 138),
    diastolicPressure: randomInteger(64, 88),
    respiratoryRate: randomInteger(12, 22),
    timestamp: now
  };
};

const publishMeasurement = () => {
  const payload = JSON.stringify(buildMeasurement());

  client.publish(MQTT_TOPIC, payload, { qos: 0 }, (error) => {
    if (error) {
      console.error("Failed to publish measurement", error.message);
      return;
    }

    console.log(`[simulator] published to ${MQTT_TOPIC}: ${payload}`);
  });
};

client.on("connect", () => {
  console.log(`[simulator] connected to ${MQTT_URL}`);
  publishMeasurement();
  setInterval(publishMeasurement, INTERVAL_MS);
});

client.on("reconnect", () => {
  console.log("[simulator] reconnecting...");
});

client.on("error", (error) => {
  console.error("[simulator] client error", error.message);
});