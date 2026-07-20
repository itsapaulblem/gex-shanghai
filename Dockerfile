FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist ./dist
COPY server ./server

EXPOSE 8080
CMD ["node", "server/app.js"]
