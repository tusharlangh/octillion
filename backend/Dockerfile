FROM public.ecr.aws/lambda/nodejs:20

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "serverless_handler.handler" ]
