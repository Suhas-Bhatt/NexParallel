// src/api/simulate.js

const API_BASE =
  import.meta.env.VITE_API_URL ?? "";

// ========================================
// BASE REQUEST HELPER
// ========================================
async function request(
  path,
  options = {}
) {
  try {
    const res = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers ?? {}),
        },
      }
    );

    // Handle failed responses
    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({
          message: `HTTP ${res.status}`,
        }));

      throw new Error(
        err.message ??
          `HTTP ${res.status}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error(
      `API Request Failed: ${path}`,
      error
    );

    throw error;
  }
}

// ========================================
// START SIMULATION
// ========================================
export const startSimulation = (
  scenario
) =>
  request("/simulate", {
    method: "POST",
    body: JSON.stringify({
      scenario,
    }),
  });

// ========================================
// GET SINGLE SIMULATION
// ========================================
export const getSimulation = (
  id
) => request(`/simulation/${id}`);

// ========================================
// GET HISTORY
// ========================================
export const getHistory = () =>
  request("/history");

// ========================================
// GENERATE REPORT
// ========================================
export const generateReport = (
  simulationId
) =>
  request("/report", {
    method: "POST",
    body: JSON.stringify({
      simulationId,
    }),
  });

// ========================================
// POLL SIMULATION
// ========================================
export function pollSimulation(
  id,
  onUpdate = () => {},
  maxTries = 60,
  intervalMs = 2000
) {
  return new Promise(
    (resolve, reject) => {
      let tries = 0;

      const interval =
        setInterval(async () => {
          try {
            tries++;

            const data =
              await getSimulation(id);

            // Send full data to UI
            onUpdate(data);

            // COMPLETE
            if (
              data.status ===
              "COMPLETE"
            ) {
              clearInterval(
                interval
              );

              resolve(
                data.result ??
                  data
              );
            }

            // ERROR / FAILED
            else if (
              data.status ===
                "ERROR" ||
              data.status ===
                "FAILED"
            ) {
              clearInterval(
                interval
              );

              reject(
                new Error(
                  data.error ??
                    data.message ??
                    "Simulation failed"
                )
              );
            }

            // TIMEOUT
            else if (
              tries >= maxTries
            ) {
              clearInterval(
                interval
              );

              reject(
                new Error(
                  "Simulation timed out"
                )
              );
            }
          } catch (e) {
            clearInterval(interval);
            reject(e);
          }
        }, intervalMs);
    }
  );
}