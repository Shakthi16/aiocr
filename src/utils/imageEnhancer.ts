export const enhanceImage = async (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Increase canvas size for better processing
      const scaleFactor = 2; // Scale up for better quality
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      // Draw and scale image
      ctx.imageSmoothingEnabled = false; // Disable smoothing for sharp pixels
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      // Advanced preprocessing for scanned documents
      // Step 1: Convert to grayscale and apply adaptive thresholding
      const thresholdedData = applyAdaptiveThreshold(data, canvas.width, canvas.height);

      // Step 2: Apply morphological operations to clean up the image
      const cleanedData = applyMorphologicalCleaning(thresholdedData, canvas.width, canvas.height);

      // Step 3: Apply final sharpening for text clarity
      const sharpenedData = applyDocumentSharpening(cleanedData, canvas.width, canvas.height);

      // Create new image data with processed pixels
      const processedImageData = ctx.createImageData(canvas.width, canvas.height);
      processedImageData.data.set(sharpenedData);
      ctx.putImageData(processedImageData, 0, 0);

      // Convert to base64
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageData;
  });
};

// Helper function to apply adaptive thresholding for scanned documents
const applyAdaptiveThreshold = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);

  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    output[i] = gray;     // R
    output[i + 1] = gray; // G
    output[i + 2] = gray; // B
    output[i + 3] = data[i + 3]; // Alpha
  }

  // Apply adaptive thresholding using local mean
  const windowSize = 15; // Window size for local thresholding
  const halfWindow = Math.floor(windowSize / 2);

  for (let y = halfWindow; y < height - halfWindow; y++) {
    for (let x = halfWindow; x < width - halfWindow; x++) {
      let localSum = 0;
      let count = 0;

      // Calculate local mean
      for (let wy = -halfWindow; wy <= halfWindow; wy++) {
        for (let wx = -halfWindow; wx <= halfWindow; wx++) {
          const idx = ((y + wy) * width + (x + wx)) * 4;
          localSum += output[idx];
          count++;
        }
      }

      const localMean = localSum / count;
      const threshold = localMean - 10; // Slight bias towards foreground

      const idx = (y * width + x) * 4;
      const grayValue = output[idx];
      const binaryValue = grayValue > threshold ? 255 : 0;

      output[idx] = binaryValue;     // R
      output[idx + 1] = binaryValue; // G
      output[idx + 2] = binaryValue; // B
    }
  }

  return output;
};

// Helper function to apply morphological cleaning
const applyMorphologicalCleaning = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);

  // Copy input to output
  output.set(data);

  // Apply morphological opening (erosion followed by dilation) to remove noise
  const eroded = applyErosion(output, width, height);
  const opened = applyDilation(eroded, width, height);

  return opened;
};

// Erosion operation
const applyErosion = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      let minValue = 255;

      // Check 3x3 neighborhood
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nidx = ((y + ky) * width + (x + kx)) * 4;
          minValue = Math.min(minValue, data[nidx]);
        }
      }

      output[idx] = minValue;
      output[idx + 1] = minValue;
      output[idx + 2] = minValue;
      output[idx + 3] = data[idx + 3];
    }
  }

  return output;
};

// Dilation operation
const applyDilation = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      let maxValue = 0;

      // Check 3x3 neighborhood
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nidx = ((y + ky) * width + (x + kx)) * 4;
          maxValue = Math.max(maxValue, data[nidx]);
        }
      }

      output[idx] = maxValue;
      output[idx + 1] = maxValue;
      output[idx + 2] = maxValue;
      output[idx + 3] = data[idx + 3];
    }
  }

  return output;
};

// Helper function to apply document-specific sharpening
const applyDocumentSharpening = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);

  // Use a stronger sharpening kernel for text documents
  const kernel = [
    -1, -1, -1,
    -1, 9, -1,
    -1, -1, -1
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nidx = ((y + ky) * width + (x + kx)) * 4;
          const kidx = (ky + 1) * 3 + (kx + 1);
          const weight = kernel[kidx];

          r += data[nidx] * weight;
          g += data[nidx + 1] * weight;
          b += data[nidx + 2] * weight;
        }
      }

      output[idx] = Math.max(0, Math.min(255, r));
      output[idx + 1] = Math.max(0, Math.min(255, g));
      output[idx + 2] = Math.max(0, Math.min(255, b));
      output[idx + 3] = data[idx + 3];
    }
  }

  return output;
};
