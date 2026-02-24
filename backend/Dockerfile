FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm install -D typescript ts-node && npx tsc

EXPOSE 3001

CMD ["node", "dist/index.js"]
