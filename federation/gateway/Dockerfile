FROM node:22.12.0-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN npm prune --production

CMD ["npm", "run", "prod"]