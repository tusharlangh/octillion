FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src ./src

COPY server.js ./
COPY supabaseClient.js ./

EXPOSE 5002

ENV NODE_ENV=production

CMD ["node", "server.js"]
