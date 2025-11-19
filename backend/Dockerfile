# Use AWS Lambda Node.js 20 base image (Amazon Linux 2023)
FROM public.ecr.aws/lambda/nodejs:20

# Set workdir
WORKDIR /var/task

# Copy package files first
COPY package*.json ./

# Install system deps + npm install in ONE layer (smaller image)
RUN dnf install -y \
      gcc \
      gcc-c++ \
      make \
      cairo \
      cairo-devel \
      pango \
      pango-devel \
      freetype \
      freetype-devel \
      libpng \
      libpng-devel \
      fontconfig \
      libuuid-devel && \
    npm install --production && \
    dnf clean all

# Copy the rest of the code
COPY . .

# Lambda handler
CMD ["src/lambda.handler"]
