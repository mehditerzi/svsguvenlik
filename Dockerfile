# SVS Güvenlik — Nuxt 4 site served by its Nitro node server on :3000
#
# Built inside the image on purpose: @nuxt/image ships sharp, and the host's
# darwin-arm64 binaries are useless in the container. Installing here pulls the
# linux-musl build that Nitro then bundles into .output.
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
