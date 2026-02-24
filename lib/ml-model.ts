// Random Forest Regression implementation in TypeScript
// This implements a simplified but functional Random Forest for RUL prediction

import { turbineDataset, type TurbineDataPoint } from "./dataset"

interface DecisionTreeNode {
  featureIndex?: number
  threshold?: number
  left?: DecisionTreeNode
  right?: DecisionTreeNode
  value?: number
}

interface ModelState {
  trees: DecisionTreeNode[]
  trained: boolean
  featureMeans: number[]
  featureStds: number[]
  datasetSize: number
  accuracy: number
}

// Global model state stored in memory
let model: ModelState = {
  trees: [],
  trained: false,
  featureMeans: [0, 0, 0],
  featureStds: [1, 1, 1],
  datasetSize: 0,
  accuracy: 0,
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function std(arr: number[]): number {
  const m = mean(arr)
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length
  return Math.sqrt(variance) || 1
}

function mse(values: number[]): number {
  if (values.length === 0) return 0
  const m = mean(values)
  return values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length
}

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Bootstrap sample with replacement
function bootstrapSample(
  data: number[][],
  targets: number[],
  rng: () => number
): { sampledData: number[][]; sampledTargets: number[] } {
  const n = data.length
  const sampledData: number[][] = []
  const sampledTargets: number[] = []
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * n)
    sampledData.push(data[idx])
    sampledTargets.push(targets[idx])
  }
  return { sampledData, sampledTargets }
}

// Build a single decision tree
function buildTree(
  data: number[][],
  targets: number[],
  depth: number,
  maxDepth: number,
  minSamples: number,
  numFeatures: number,
  rng: () => number
): DecisionTreeNode {
  if (depth >= maxDepth || targets.length <= minSamples) {
    return { value: mean(targets) }
  }

  const totalMSE = mse(targets)
  if (totalMSE < 0.001) {
    return { value: mean(targets) }
  }

  let bestFeature = -1
  let bestThreshold = 0
  let bestScore = Infinity

  // Random feature subset
  const allFeatures = [0, 1, 2]
  const features: number[] = []
  const available = [...allFeatures]
  for (let i = 0; i < Math.min(numFeatures, allFeatures.length); i++) {
    const idx = Math.floor(rng() * available.length)
    features.push(available[idx])
    available.splice(idx, 1)
  }

  for (const featureIdx of features) {
    const values = data.map((row) => row[featureIdx])
    const uniqueValues = [...new Set(values)].sort((a, b) => a - b)

    for (let i = 0; i < uniqueValues.length - 1; i++) {
      const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2

      const leftTargets: number[] = []
      const rightTargets: number[] = []

      for (let j = 0; j < data.length; j++) {
        if (data[j][featureIdx] <= threshold) {
          leftTargets.push(targets[j])
        } else {
          rightTargets.push(targets[j])
        }
      }

      if (leftTargets.length === 0 || rightTargets.length === 0) continue

      const score =
        (leftTargets.length * mse(leftTargets) +
          rightTargets.length * mse(rightTargets)) /
        targets.length

      if (score < bestScore) {
        bestScore = score
        bestFeature = featureIdx
        bestThreshold = threshold
      }
    }
  }

  if (bestFeature === -1) {
    return { value: mean(targets) }
  }

  const leftData: number[][] = []
  const leftTargets: number[] = []
  const rightData: number[][] = []
  const rightTargets: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (data[i][bestFeature] <= bestThreshold) {
      leftData.push(data[i])
      leftTargets.push(targets[i])
    } else {
      rightData.push(data[i])
      rightTargets.push(targets[i])
    }
  }

  return {
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: buildTree(leftData, leftTargets, depth + 1, maxDepth, minSamples, numFeatures, rng),
    right: buildTree(rightData, rightTargets, depth + 1, maxDepth, minSamples, numFeatures, rng),
  }
}

function predictTree(node: DecisionTreeNode, features: number[]): number {
  if (node.value !== undefined && node.left === undefined) {
    return node.value
  }
  if (features[node.featureIndex!] <= node.threshold!) {
    return predictTree(node.left!, features)
  }
  return predictTree(node.right!, features)
}

// Train the Random Forest model
export function trainModel(): {
  success: boolean
  message: string
  datasetSize: number
  accuracy: number
} {
  const data: number[][] = turbineDataset.map((d) => [
    d.temperature,
    d.vibration,
    d.current,
  ])
  const targets: number[] = turbineDataset.map((d) => d.rul)

  // Compute normalization statistics
  const featureMeans = [
    mean(data.map((d) => d[0])),
    mean(data.map((d) => d[1])),
    mean(data.map((d) => d[2])),
  ]
  const featureStds = [
    std(data.map((d) => d[0])),
    std(data.map((d) => d[1])),
    std(data.map((d) => d[2])),
  ]

  // Normalize features
  const normalizedData = data.map((row) =>
    row.map((val, i) => (val - featureMeans[i]) / featureStds[i])
  )

  // Build forest with 50 trees
  const numTrees = 50
  const maxDepth = 10
  const minSamples = 2
  const numFeatures = 2
  const trees: DecisionTreeNode[] = []

  for (let t = 0; t < numTrees; t++) {
    const rng = seededRandom(42 + t * 17)
    const { sampledData, sampledTargets } = bootstrapSample(
      normalizedData,
      targets,
      rng
    )
    const tree = buildTree(
      sampledData,
      sampledTargets,
      0,
      maxDepth,
      minSamples,
      numFeatures,
      rng
    )
    trees.push(tree)
  }

  // Calculate R-squared accuracy on training data
  const predictions = normalizedData.map((row) => {
    const treePredictions = trees.map((tree) => predictTree(tree, row))
    return mean(treePredictions)
  })

  const ssRes = targets.reduce(
    (s, t, i) => s + (t - predictions[i]) ** 2,
    0
  )
  const ssTot = targets.reduce(
    (s, t) => s + (t - mean(targets)) ** 2,
    0
  )
  const r2 = 1 - ssRes / ssTot

  model = {
    trees,
    trained: true,
    featureMeans,
    featureStds,
    datasetSize: turbineDataset.length,
    accuracy: Math.round(r2 * 10000) / 100,
  }

  return {
    success: true,
    message: `Model trained successfully with ${numTrees} trees on ${turbineDataset.length} samples`,
    datasetSize: turbineDataset.length,
    accuracy: model.accuracy,
  }
}

// Predict RUL from sensor inputs
export function predict(
  temperature: number,
  vibration: number,
  current: number
): {
  predicted_rul: number
  health_score: number
  status: "Healthy" | "Warning" | "Critical"
  confidence: number
} {
  if (!model.trained) {
    // Auto-train if not trained yet
    trainModel()
  }

  // Normalize input
  const normalizedInput = [
    (temperature - model.featureMeans[0]) / model.featureStds[0],
    (vibration - model.featureMeans[1]) / model.featureStds[1],
    (current - model.featureMeans[2]) / model.featureStds[2],
  ]

  // Aggregate predictions from all trees
  const treePredictions = model.trees.map((tree) =>
    predictTree(tree, normalizedInput)
  )
  const predictedRul = Math.max(0, Math.round(mean(treePredictions) * 10) / 10)

  // Calculate confidence from tree agreement
  const predStd = std(treePredictions)
  const confidence = Math.max(0, Math.min(100, Math.round((1 - predStd / (mean(treePredictions) || 1)) * 100)))

  // Health score: normalized 0-100
  const healthScore = Math.min(100, Math.max(0, Math.round((predictedRul / 100) * 100)))

  // Status based on RUL thresholds
  let status: "Healthy" | "Warning" | "Critical"
  if (predictedRul > 30) {
    status = "Healthy"
  } else if (predictedRul >= 10) {
    status = "Warning"
  } else {
    status = "Critical"
  }

  return {
    predicted_rul: predictedRul,
    health_score: healthScore,
    status,
    confidence,
  }
}

export function isModelTrained(): boolean {
  return model.trained
}

export function getModelInfo() {
  return {
    trained: model.trained,
    datasetSize: model.datasetSize,
    accuracy: model.accuracy,
    numTrees: model.trees.length,
  }
}
