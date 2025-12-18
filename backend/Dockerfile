FROM public.ecr.aws/lambda/nodejs:20

ENV TRANSFORMERS_CACHE=/var/task/.cache/huggingface

COPY package*.json ./

RUN npm ci --only=production


COPY . .


RUN node -e "\
  import('@xenova/transformers').then(async ({ pipeline }) => { \
    console.log('Pre-downloading model...'); \
    await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'); \
    console.log('Model cached successfully'); \
  });"


CMD [ "serverless_handler.handler" ]
