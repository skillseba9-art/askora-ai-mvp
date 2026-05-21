#!/bin/bash
# ==============================================================================
# Google Cloud Run Deployment Script for AskOra AI Backend
# ==============================================================================

# Exit immediately if any command fails
set -e

# Configuration (Replace with your actual GCP details)
PROJECT_ID="YOUR_GCP_PROJECT_ID"
REGION="us-central1"
SERVICE_NAME="askora-backend"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "========================================================"
echo "🚀 Starting AskOra AI Backend Deployment to Cloud Run..."
echo "========================================================"

# Step 1: Ensure you are authenticated with GCP
echo "🔐 Verifying GCP Authentication..."
gcloud auth configure-docker --quiet

# Step 2: Build the Docker image in Google Artifact Registry / Container Registry
echo "📦 Building Docker image and pushing to Container Registry..."
gcloud builds submit --tag ${IMAGE_TAG} --project ${PROJECT_ID}

# Step 3: Deploy the container image to Google Cloud Run
echo "📡 Deploying service to Google Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_TAG} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --project ${PROJECT_ID}

# Get the URL of the deployed Cloud Run service
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --project ${PROJECT_ID} --format 'value(status.url)')

echo "========================================================"
echo "🎉 Deployment Completed Successfully!"
echo "📡 Service Live URL: ${SERVICE_URL}"
echo "--------------------------------------------------------"
echo "Next Steps:"
echo "1. Map this URL to app.askoraai.com in Google Cloud DNS"
echo "2. Add your environment variables (OPENAI_API_KEY, FIREBASE_SERVICE_ACCOUNT)"
echo "   in the Google Cloud Run console settings."
echo "========================================================"
