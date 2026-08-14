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

  // 15% chance of generating critical data
  const isCritical = Math.random() < 0.15;

  let heartRate;
  let spo2;
  let temp;
  let systolicPressure;
  let diastolicPressure;
  let respiratoryRate;

  if (isCritical) {
    // Choose which vital will be critical (0-8: 5 "high" types, 4 "low" types)
    const criticalType = randomInteger(0, 8);

    if (criticalType === 0) {
      // Critical: high heart rate (tachycardia)
      heartRate = randomInteger(130, 160);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.5, 1);
      systolicPressure = randomInteger(104, 138);
      diastolicPressure = randomInteger(64, 88);
      respiratoryRate = randomInteger(12, 20);

    } else if (criticalType === 1) {
      // Critical: low SpO2 (hypoxemia)
      heartRate = randomInteger(70, 120);
      spo2 = randomInteger(85, 90);
      temp = randomDecimal(36.5, 37.5, 1);
      systolicPressure = randomInteger(104, 138);
      diastolicPressure = randomInteger(64, 88);
      respiratoryRate = randomInteger(12, 20);

    } else if (criticalType === 2) {
      // Critical: high temperature (hyperpyrexia)
      heartRate = randomInteger(80, 120);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(39.0, 40.5, 1);
      systolicPressure = randomInteger(104, 138);
      diastolicPressure = randomInteger(64, 88);
      respiratoryRate = randomInteger(15, 22);

    } else if (criticalType === 3) {
      // Critical: high respiratory rate (severe tachypnea)
      heartRate = randomInteger(90, 120);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.5, 1);
      systolicPressure = randomInteger(104, 138);
      diastolicPressure = randomInteger(64, 88);
      respiratoryRate = randomInteger(24, 30);

    } else if (criticalType === 4) {
      // Critical: high blood pressure (hypertensive crisis)
      heartRate = randomInteger(70, 120);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.5, 1);
      systolicPressure = randomInteger(180, 210);
      diastolicPressure = randomInteger(120, 135);
      respiratoryRate = randomInteger(12, 22);

    } else if (criticalType === 5) {
      // Critical: low heart rate (severe bradycardia)
      heartRate = randomInteger(25, 40);
      spo2 = randomInteger(90, 96);
      temp = randomDecimal(36.0, 37.0, 1);
      systolicPressure = randomInteger(100, 130);
      diastolicPressure = randomInteger(60, 85);
      respiratoryRate = randomInteger(12, 20);

    } else if (criticalType === 6) {
      // Critical: low blood pressure (shock / hypotension)
      heartRate = randomInteger(90, 130);
      spo2 = randomInteger(90, 96);
      temp = randomDecimal(36.0, 37.0, 1);
      systolicPressure = randomInteger(70, 89);
      diastolicPressure = randomInteger(40, 55);
      respiratoryRate = randomInteger(12, 22);

    } else if (criticalType === 7) {
      // Critical: low temperature (hypothermia)
      heartRate = randomInteger(50, 90);
      spo2 = randomInteger(90, 96);
      temp = randomDecimal(32.0, 34.9, 1);
      systolicPressure = randomInteger(100, 130);
      diastolicPressure = randomInteger(60, 85);
      respiratoryRate = randomInteger(10, 18);

    } else {
      // Critical: low respiratory rate (respiratory depression)
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(88, 94);
      temp = randomDecimal(36.0, 37.5, 1);
      systolicPressure = randomInteger(100, 130);
      diastolicPressure = randomInteger(60, 85);
      respiratoryRate = randomInteger(4, 8);
    }

  } else {
    // Normal / warning data
    heartRate = randomInteger(58, 108);
    spo2 = randomInteger(94, 100);
    temp = randomDecimal(35.9, 38.0, 1);
    respiratoryRate = randomInteger(11, 22);

    // Occasionally generate warning-level readings instead of pure normal
    const warningRoll = Math.random();

    if (warningRoll < 0.10) {
      // Warning: elevated blood pressure
      systolicPressure = randomInteger(140, 170);
      diastolicPressure = randomInteger(90, 105);
    } else if (warningRoll < 0.15) {
      // Warning: low-ish blood pressure
      systolicPressure = randomInteger(90, 100);
      diastolicPressure = randomInteger(55, 62);
    } else {
      systolicPressure = randomInteger(104, 138);
      diastolicPressure = randomInteger(64, 88);
    }
  }

  return {
    serialNumber,
    heartRate,
    spo2,
    temp,
    systolicPressure,
    diastolicPressure,
    respiratoryRate,
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