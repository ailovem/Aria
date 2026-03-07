FROM node:22-alpine

WORKDIR /app

COPY services/api /app/services/api

EXPOSE 8787

ENV ARIA_API_HOST=0.0.0.0
ENV ARIA_API_PORT=8787
ENV ARIA_TOKEN_SECRET=change-me

CMD ["node", "services/api/mock-server.mjs"]
