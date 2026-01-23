FROM node:20-alpine

WORKDIR /app

# Copiar dependências
COPY package*.json ./

RUN npm install

# Copiar o resto do código
COPY . .

# Gerar o Prisma Client (IMPORTANTE)
RUN npx prisma generate

EXPOSE 3006

CMD ["npm", "start"]
