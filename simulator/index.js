const mqtt = require("mqtt");

const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "health/measurements";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 5000);

const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000
});

const devices = [
  "SIM-1001",
  "SIM-1002",
  "SIM-1003",
  "SIM-1004"
];

const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomDecimal = (min, max, digits = 1) => {
  const factor = 10 ** digits;

  return (
    Math.round(
      (min + Math.random() * (max - min)) * factor
    ) / factor
  );
};

const buildMeasurement = (serialNumber) => {
  const now = new Date().toISOString();

  // 15% Critical
  const isCritical = Math.random() < 0.15;

  let heartRate;
  let spo2;
  let temp;
  let systolicPressure;
  let diastolicPressure;
  let respiratoryRate;

  if (isCritical) {
    const criticalType = randomInteger(0, 8);

    // Critical: high heart rate
    if (criticalType === 0) {
      heartRate = randomInteger(130, 160);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(12, 18);

    // Critical: low SpO2
    } else if (criticalType === 1) {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(85, 90);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(12, 18);

    // Critical: high temperature
    } else if (criticalType === 2) {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(39.0, 40.5, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(12, 18);

    // Critical: high respiratory rate
    } else if (criticalType === 3) {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(24, 30);

    // Critical: high blood pressure
    } else if (criticalType === 4) {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(180, 210);
      diastolicPressure = randomInteger(120, 135);
      respiratoryRate = randomInteger(12, 18);

    // Critical: low heart rate
    } else if (criticalType === 5) {
      heartRate = randomInteger(25, 40);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(12, 18);

    // Critical: low blood pressure
    } else if (criticalType === 6) {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(70, 90);
      diastolicPressure = randomInteger(40, 50);
      respiratoryRate = randomInteger(12, 18);

    // Critical: low temperature
    } else if (criticalType === 7) {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(32.0, 35.0, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(12, 18);

    // Critical: low respiratory rate
    } else {
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(4, 8);
    }

  } else {
    /*
      Remaining 85%:
      ~15% overall Warning
      ~70% overall Normal

      0.15 / 0.85 = 0.1765
    */
    const isWarning = Math.random() < 0.1765;

    if (isWarning) {
      const warningType = randomInteger(0, 8);

      // Warning: high heart rate
      if (warningType === 0) {
        heartRate = randomInteger(101, 129);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(12, 18);

      // Warning: low heart rate
      } else if (warningType === 1) {
        heartRate = randomInteger(41, 59);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(12, 18);

      // Warning: low SpO2
      } else if (warningType === 2) {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(91, 94);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(12, 18);

      // Warning: high temperature
      } else if (warningType === 3) {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(37.3, 38.9, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(12, 18);

      // Warning: low temperature
      } else if (warningType === 4) {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(35.1, 36.4, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(12, 18);

      // Warning: high respiratory rate
      } else if (warningType === 5) {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(19, 23);

      // Warning: low respiratory rate
      } else if (warningType === 6) {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(100, 119);
        diastolicPressure = randomInteger(60, 79);
        respiratoryRate = randomInteger(9, 11);

      // Warning: high blood pressure
      } else if (warningType === 7) {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(120, 179);
        diastolicPressure = randomInteger(80, 119);
        respiratoryRate = randomInteger(12, 18);

      // Warning: low blood pressure
      } else {
        heartRate = randomInteger(60, 100);
        spo2 = randomInteger(95, 100);
        temp = randomDecimal(36.5, 37.2, 1);
        systolicPressure = randomInteger(91, 99);
        diastolicPressure = randomInteger(51, 59);
        respiratoryRate = randomInteger(12, 18);
      }

    } else {
      // Normal data
      heartRate = randomInteger(60, 100);
      spo2 = randomInteger(95, 100);
      temp = randomDecimal(36.5, 37.2, 1);
      systolicPressure = randomInteger(100, 119);
      diastolicPressure = randomInteger(60, 79);
      respiratoryRate = randomInteger(12, 18);
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

client.on("connect", () => {
  console.log(`[simulator] connected to ${MQTT_URL}`);

  // Send one measurement immediately for each device
  devices.forEach((serialNumber) => {
    publishMeasurement(serialNumber);
  });

  // Send new measurements every 5 seconds
  setInterval(() => {
    devices.forEach((serialNumber) => {
      publishMeasurement(serialNumber);
    });
  }, INTERVAL_MS);
});

client.on("reconnect", () => {
  console.log("[simulator] reconnecting...");
});

client.on("error", (error) => {
  console.error("[simulator] client error:", error.message);
});