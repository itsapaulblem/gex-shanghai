FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

RUN wget -qO /app/rds-ca-bundle.pem \
  https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem

COPY dist ./dist
COPY server ./server
COPY shared ./shared

EXPOSE 8080
CMD ["node", "server/app.js"]
