import React, { useEffect, useState } from "react";
import {
  bootstrapCameraKit,
  Transform2D,
  createUserMediaSource,
} from "@snap/camera-kit";

function CameraComponent() {
  const [lenses, setLenses] = useState([]);


function createLensSelect(selectId, lenses, onChangeHandler) {
  const selectElement = document.getElementById(selectId);

  // Clear the select options
  selectElement.innerHTML = "";

  // Create and append option elements for each lens
  lenses.forEach((lens) => {
    const optionElement = document.createElement("option");
    optionElement.value = lens.id;
    optionElement.textContent = lens.name;
    selectElement.appendChild(optionElement);
  });

  // Add event listener for the lens selection change
  selectElement.addEventListener("change", async (event) => {
    const selectedLensId = event.target.value;
    const selectedLens = lenses.find((lens) => lens.id === selectedLensId);
    const source = await createUserMediaSource({ video: true });

    // Only call the onChangeHandler if a lens is selected
    if (selectedLens) {
      await onChangeHandler(selectedLens);
    }
  });
}

function createSourceSelect(selectId, onChangeHandler) {
  const selectElement = document.getElementById(selectId);
  let infoLine = document.getElementById("info-line");

  // Clear the select options
  selectElement.innerHTML = "";

  document
    .getElementById("lens-select")
    .addEventListener("change", async (event) => {
      const selectedSourceId = event.target.value;
      infoLine.style.display = "none";
      const source = await createUserMediaSource({ video: true });

      // Create a CameraKitSource with the selected source ID

      // Call the provided onChangeHandler with the created source
      if (source) {
        await onChangeHandler(source);
      }
    });
}
  
  useEffect(() => {
    async function initializeCamera() {
    try {
      const JSON_WEB_TOKEN =
        "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NjE3MTA3LCJzdWIiOiIzN2ZlNzU2Yi05NjlmLTQ5YTUtOWIyNS04OWQ2NTZmNmQ2ZTJ-U1RBR0lOR340OTk1Mjg2Ni0zNDU1LTQ2ZjYtODQ3NS0xZTAwMTVlZGM2YjIifQ.sOji1Tak1lCGjDGcYGBuonKZq_LUdVULQqhpF91a3ww";
      const cameraKit = await bootstrapCameraKit({
        apiToken: JSON_WEB_TOKEN,
        logger: "console",
      });

      const session = await cameraKit.createSession();
      session.events.addEventListener("error", (event) =>
        console.error(event.detail)
      );

      const canvasOutput = document.getElementById("canvas-output");
      if (canvasOutput) {
        canvasOutput.replaceWith(session.output.live);
      }

      const { lenses } = await cameraKit.lensRepository.loadLensGroups([
        "ec930849-285f-4fac-9649-478483eac285",
      ]); //DEFAULT_GROUP_KEY

      // Automatically select the first lens and apply it to the session
      if (lenses.length > 0) {
        await session.applyLens(lenses[0]);
      }

      createLensSelect("lens-select", lenses, async (lens) => {
        await session.applyLens(lens);
      });

      createSourceSelect("source-select", async (source) => {
        try {
          await session.setSource(source);

          console.log(
            "🚀 ~ file: index.js:104 ~ createSourceSelect ~ source:",
            source
          );

          source.setTransform(Transform2D.MirrorX);

          session.play("live");
        } catch (error) {
          console.error(error);
          throw error;
        }
      });
    } catch (error) {
      console.error(error);
    }
    }

    initializeCamera();
  }, []);

  return (
    <div>
      <h1>
        <strong>Camera Kit Web SDK - FL DEMO</strong>
      </h1>
      <div id="info-line">
        Please choose an effect from the dropdown to start enjoying the Web AR
        experience
      </div>
      <div class="container">
        <div class="selector-container">
          <label class="selector-label">Select Lens:</label>

          <select class="selector-select" id="lens-select"></select>
        </div>
        <div id="source-select" style={{ display: "none" }}>
          <option value="" disabled selected>
            Select Source
          </option>
        </div>
      </div>
      <div id="canvas-output"></div>{" "}
    </div>
  );
}

export default CameraComponent;
