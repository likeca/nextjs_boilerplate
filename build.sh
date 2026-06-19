echo "======== pnpm install ========"
# pnpm install
echo "======== End of pnpm install ========\n"

echo "======== pnpm build ========"
# pnpm build
echo "======== End of pnpm build ========\n"

echo "======== Docker build ========"
docker build --no-cache -t nextjs . -f Dockerfile-Prod
echo "======== End of docker build ========\n"
