# Use AWS Lambda Node.js 20 base image
# This ensures we are building on the same OS as Lambda (Amazon Linux 2023)
# This solves the "native dependency" issue (Mac vs Linux) automatically.
FROM public.ecr.aws/lambda/nodejs:20

# Install dependencies
COPY package*.json ./
# 'npm ci' ensures clean install from lockfile
# --only=production skips devDependencies to keep image small
RUN npm ci --only=production

# Copy source code
COPY . .

# Set the CMD to your handler (using serverless-http)
CMD [ "serverless_handler.handler" ]
