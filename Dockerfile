FROM node:18-alpine as builder

WORKDIR /usr/src/app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci

COPY . .

WORKDIR /usr/src/app/backend
RUN npm run build

WORKDIR /usr/src/app/frontend
RUN npm run build

FROM node:18-alpine as app

WORKDIR /app
COPY backend/package.json .

ENV NODE_ENV production
RUN npm install --omit=dev

EXPOSE 3000
VOLUME [ "/data", "/collection" ]
ENV WORKING_DIR /data
ENV COLLECTION /collection
ENV DB_URL file:/data/data.db

COPY docker-entrypoint.sh /usr/local/bin

COPY backend/migrations ./migrations
COPY --from=builder /usr/src/app/backend/dist /app/
COPY --from=builder /usr/src/app/frontend/dist /app/public

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "index.js"]
