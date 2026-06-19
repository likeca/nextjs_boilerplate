# echo -e "======== pnpm install ========"
# pnpm install
# echo -e "======== End of pnpm install ========\n"

# echo -e "======== pnpm build ========"
# pnpm build
# echo -e "======== End of pnpm build ========\n"

echo -e "======== Docker build ========"
# docker build --no-cache -t nextjs . -f Dockerfile-Prod
docker build --no-cache -t nextjs . -f Dockerfile
echo -e "======== End of docker build ========\n"

echo -e "======== Docker compose up ========"
docker compose up -d
echo -e "======== End of docker compose up ========\n"

