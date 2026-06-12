FROM node:22.12.0-alpine

WORKDIR /app

COPY package.json package-lock.json* ./  
RUN npm install

COPY prisma ./prisma  
COPY .env ./  
RUN npx prisma generate

COPY tsconfig.json ./  
COPY src ./src  
RUN npm run build

RUN npm prune --production  
CMD ["npm", "run", "prod"]