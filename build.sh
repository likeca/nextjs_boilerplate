echo -e "======== Docker build ========"
docker build --no-cache -t nextjs . -f Dockerfile
echo -e "======== End of docker build ========\n"

echo -e "======== Docker compose up ========"
docker compose up -d
echo -e "======== End of docker compose up ========\n"

