# Production public URL — MUST be set here because NEXT_PUBLIC_* vars are
# baked into the client bundle at build time, not read at runtime.
PROD_URL="https://nextjs.ottawastem.com"

echo -e "======== Docker build ========"
docker build -t likeca/nextjs . -f Dockerfile \
  --build-arg NEXT_PUBLIC_APP_URL="${PROD_URL}" \
  --build-arg NEXT_PUBLIC_APP_NAME="NextJS SaaS App" \
  --build-arg NEXT_PUBLIC_APP_DESCRIPTION="A production-ready SaaS boilerplate" \
  --build-arg NEXT_PUBLIC_ENABLE_TWO_FACTOR="false" \
  --build-arg NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION="true"
docker push likeca/nextjs:latest
echo -e "======== End of docker build ========\n"

echo -e "======== Docker compose up ========"
# docker start nextjs
# docker compose up -d
echo -e "======== End of docker compose up ========\n"

