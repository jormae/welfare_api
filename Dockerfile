FROM node:10.16.0
ENV NODE_ENV=production
WORKDIR /app
COPY . /app
RUN npm install --production
COPY . .
EXPOSE 3030
CMD ["npm", "start"]