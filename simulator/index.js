const mqtt = require("mqtt");

const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "health/measurements";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 5000);

const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000
});

// Simulated IoT devices
const devices = [
  "SIM-1001",
  "SIM-1002",
  "SIM-1003",
  "SIM-1004"
];

// Random integer
const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Random decimal
const randomDecimal = (min, max, digits = 1) => {
  const factor = 10 ** digits;

  return (
    Math.round(
      (min + Math.random() * (max - min)) * factor
    ) / factor
  );
};

// Build health measurement for a specific device
const buildMeasurement = (serialNumber) => {
  const now = new Date().toISOString();

  return {
    serialNumber: serialNumber,

    heartRate: randomInteger(62, 108),

    spo2: randomInteger(94, 100),

    temp: randomDecimal(36.2, 38.0, 1),

    systolicPressure: randomInteger(104, 138),

    diastolicPressure: randomInteger(64, 88),

    respiratoryRate: randomInteger(12, 22),

    timestamp: now
  };
};

// Publish measurement
const publishMeasurement = (serialNumber) => {
  const measurement = buildMeasurement(serialNumber);

  const payload = JSON.stringify(measurement);

  client.publish(
    MQTT_TOPIC,
    payload,
    { qos: 0 },
    (error) => {
      if (error) {
        console.error(
          `[simulator] Failed to publish ${serialNumber}:`,
          error.message
        );

        return;
      }

      console.log(
        `[simulator] ${serialNumber} published to ${MQTT_TOPIC}:`
      );

      console.log(payload);
    }
  );
};

// When connected to MQTT broker
client.on("connect", () => {
  console.log(`[simulator] connected to ${MQTT_URL}`);

  // Send immediately for all devices
  devices.forEach((serialNumber) => {
    publishMeasurement(serialNumber);
  });

  // Send measurements every 5 seconds
  setInterval(() => {
    devices.forEach((serialNumber) => {
      publishMeasurement(serialNumber);
    });
  }, INTERVAL_MS);
});

// Reconnecting
client.on("reconnect", () => {
  console.log("[simulator] reconnecting...");
});

// MQTT error
client.on("error", (error) => {
  console.error("[simulator] client error:", error.message);
});