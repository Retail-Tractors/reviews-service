FROM node:20-alpine

WORKDIR /app

# Copiar dependências
COPY package*.json ./

RUN npm install

# Copiar o resto do código
COPY . .

EXPOSE 3006

CMD ["sh", "-c", "npx prisma generate && node server.js"]
