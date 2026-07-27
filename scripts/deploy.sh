#!/bin/bash
set -e

# ============================================
# Property Historical - Deploy Script
# ============================================
# Reads config from .env.aws file at the project root.
# Run: pnpm deploy
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.aws"

# Load environment variables from .env.aws
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.aws not found at project root."
  echo "   Create it from .env.aws.example with your real values."
  exit 1
fi

# Parse key=value lines (ignoring comments and empty lines)
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  # Remove leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  # Export non-empty values
  if [ -n "$key" ] && [ -n "$value" ]; then
    export "$key"="$value"
  fi
done < "$ENV_FILE"

# Validate required vars
REQUIRED_VARS="AWS_REGION AWS_ACCOUNT_ID ECR_REPOSITORY ECS_CLUSTER ECS_SERVICE S3_FRONTEND_BUCKET CLOUDFRONT_DISTRIBUTION_ID"
for var in $REQUIRED_VARS; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    echo "   Check your .env.aws file."
    exit 1
  fi
done

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo ""
echo "🚀 Starting full deploy..."
echo "================================"
echo "   Region:  ${AWS_REGION}"
echo "   Cluster: ${ECS_CLUSTER}"
echo "   Service: ${ECS_SERVICE}"
echo "================================"

# ---- STEP 1: Login to ECR ----
echo ""
echo "📦 [1/7] Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com > /dev/null 2>&1
echo "   ✓ Logged in"

# ---- STEP 2: Build backend ----
echo ""
echo "🐳 [2/7] Building backend Docker image..."
cd "$PROJECT_ROOT/backend"
docker build --platform linux/amd64 -t $ECR_REPOSITORY . --quiet
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest
echo "   ✓ Built"

# ---- STEP 3: Push to ECR ----
echo ""
echo "⬆️  [3/7] Pushing to ECR..."
docker push ${ECR_URI}:latest --quiet
echo "   ✓ Pushed"

# ---- STEP 4: Force ECS deploy ----
echo ""
echo "🔄 [4/7] Deploying to ECS..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION \
  --output text > /dev/null 2>&1

echo "   Waiting for new task to start (~60-90s)..."
sleep 10

# Poll until a task is RUNNING
MAX_ATTEMPTS=20
ATTEMPT=0
TASK_ARN=""
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $ECS_CLUSTER \
    --service-name $ECS_SERVICE \
    --desired-status RUNNING \
    --region $AWS_REGION \
    --query "taskArns[0]" \
    --output text 2>/dev/null)

  if [ "$TASK_ARN" != "None" ] && [ -n "$TASK_ARN" ]; then
    STATUS=$(aws ecs describe-tasks \
      --cluster $ECS_CLUSTER \
      --tasks $TASK_ARN \
      --region $AWS_REGION \
      --query "tasks[0].lastStatus" \
      --output text 2>/dev/null)

    if [ "$STATUS" = "RUNNING" ]; then
      break
    fi
  fi

  ATTEMPT=$((ATTEMPT + 1))
  sleep 10
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "   ❌ Timeout waiting for task. Check ECS logs."
  exit 1
fi
echo "   ✓ Task is running"

# ---- STEP 5: Get backend IP ----
echo ""
echo "🌐 [5/7] Getting backend IP..."
ENI=$(aws ecs describe-tasks \
  --cluster $ECS_CLUSTER \
  --tasks $TASK_ARN \
  --region $AWS_REGION \
  --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value|[0]" \
  --output text)

BACKEND_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI \
  --region $AWS_REGION \
  --query "NetworkInterfaces[0].Association.PublicIp" \
  --output text)

echo "   ✓ Backend: http://${BACKEND_IP}:3000"

# ---- STEP 6: Build frontend ----
echo ""
echo "🏗️  [6/7] Building frontend..."
cd "$PROJECT_ROOT/frontend"
VITE_API_URL="http://${BACKEND_IP}:3000/api" pnpm run build --silent 2>/dev/null
echo "   ✓ Built"

# ---- STEP 7: Upload to S3 + invalidate CloudFront ----
echo ""
echo "☁️  [7/7] Deploying frontend to S3 + CloudFront..."
aws s3 sync dist/ s3://${S3_FRONTEND_BUCKET} --delete --region $AWS_REGION --quiet
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*" \
  --region $AWS_REGION \
  --output text > /dev/null 2>&1
echo "   ✓ Uploaded and cache invalidated"

# ---- DONE ----
echo ""
echo "================================"
echo "✅ Deploy complete!"
echo ""
echo "   Backend:  http://${BACKEND_IP}:3000"
echo "   Frontend: http://${S3_FRONTEND_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
echo ""
