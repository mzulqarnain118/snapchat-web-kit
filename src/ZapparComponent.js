import React, { useEffect, useState } from "react";
import * as Zappar from "@zappar/zappar";

function ZapparComponent() {

  useEffect(() => {
    async function initializeCamera() {
      try {
        // Initialize Zappar pipeline
        const pipeline = new Zappar.Pipeline();

        // Get a reference to your canvas element
        const canvas = document.getElementById("zappar-canvas");
        // Set up the WebGL context
        const gl = canvas.getContext("webgl");

        // Set the WebGL context for Zappar pipeline
        pipeline.glContextSet(gl);

        // Create a camera source
        const source = new Zappar.CameraSource(
          pipeline,
          Zappar.cameraDefaultDeviceID(true)
        );

        // Request camera permissions and start the camera
        Zappar.permissionRequestUI().then((granted) => {
          if (granted) {
            source.start();
          } else {
            Zappar.permissionDeniedUI();
          }
        });

        // Set up a tracker, in this case an image tracker
        // let imageTracker = new Zappar.ImageTracker(pipeline);
        // imageTracker.loadTarget("../public/models/scene.gltf");

        // Create a FaceTracker
        const faceTracker = new Zappar.FaceTracker(pipeline);
        console.log(faceTracker.anchors);
        let glassesModel;
        faceTracker.onNewAnchor.bind((faceAnchor) => {
          // Load your 3D glasses model
          glassesModel = new faceTracker.loadModel("../public/models/face.zpp");
          faceAnchor.add(glassesModel);
        });

        // Load your image target (replace with your actual target file)
        
        // faceTracker.loadModel("../public/models/face.zpp");
        faceTracker?.onNewAnchor.bind((anchor) => {
          console.log("New anchor has appeared:", anchor.id);
        });

        faceTracker.onVisible.bind((anchor) => {
          console.log("Anchor is visible:", anchor.id);
        });

        faceTracker.onNotVisible.bind((anchor) => {
          console.log("Anchor is not visible:", anchor.id);
        });

        function animate() {
          requestAnimationFrame(animate);

          // Prepare camera frames for processing
          pipeline.processGL();
          gl.viewport(0, 0, canvas.width, canvas.height);

          // Use the tracking data from the most recently processed camera frame
          pipeline.frameUpdate();
          pipeline.cameraFrameUploadGL();
          pipeline.cameraFrameDrawGL(canvas.width, canvas.height);

          // Get the camera model and projection matrix
          const model = pipeline.cameraModel();
          const projectionMatrix = Zappar.projectionMatrixFromCameraModel(
            model,
            canvas.width,
            canvas.height
          );

          // Get the default camera pose
          const cameraPoseMatrix = pipeline.cameraPoseDefault();

          // Loop through visible face tracker anchors
          for (const anchor of faceTracker.visible) {
            const anchorPoseMatrix = anchor.pose(cameraPoseMatrix);

            // Render content using the following ModelViewProjection matrix:
            // projectionMatrix * anchorPoseMatrix

            // Example: Render a cube
            renderCube(projectionMatrix, anchorPoseMatrix);
          }
        }

        // function animate() {
        //   requestAnimationFrame(animate);

        //   // Update the face tracker
        //   pipeline.process(gl);
        //   pipeline.update();

        //   // Loop through visible face tracker anchors
        //   for (const faceAnchor of faceTracker.visible) {
        //     // Adjust the glasses model's position and orientation
        //     const poseMatrix = faceAnchor.poseCameraRelative;
        //     glassesModel.setTransformFromMatrix(poseMatrix);

        //     // You can also adjust the scale and other properties here if needed
        //   }

        //   // Render the scene
        //   renderer.render(scene, camera);
        // }

        function renderCube(projectionMatrix, modelViewMatrix) {
          // Implement your rendering code here
          // You can use WebGL or any other rendering library of your choice
        }
        let faceLandmark = new Zappar.FaceLandmark(
          Zappar.FaceLandmarkName.CHIN
        );
        // Update directly from a face anchor
        // faceLandmark.updateFromFaceAnchor(myFaceAnchor);

        // // Or, update from identity and expression Float32Arrays:
        // faceLandmark.updateFromIdentityExpression(identity, expression);
        // This is a Float32Array 4x4 matrix
        faceLandmark.pose;
        // Start the animation loop
        animate();
      } catch (error) {
        console.error(error);
      }
    }

    initializeCamera();
  }, []);

  return (
    <div>
      <h1>
        <strong>Zappar Face Tracker</strong>
      </h1>
      <canvas id="zappar-canvas"></canvas>{" "}
    </div>
  );
}

export default ZapparComponent;
