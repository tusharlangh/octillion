FROM public.ecr.aws/lambda/python:3.11

WORKDIR ${LAMBDA_TASK_ROOT}

# Set cache directories to /tmp for Lambda
ENV TRANSFORMERS_CACHE=/tmp/transformers_cache
ENV HF_HOME=/tmp/huggingface
ENV TORCH_HOME=/tmp/torch

# Install build dependencies
RUN yum install -y gcc gcc-c++ && \
    yum clean all

# Upgrade pip to ensure better wheel handling
RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .

# Install Torch (CPU) separately
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the requirements, forcing the use of pre-compiled wheels for heavy libraries
RUN pip install --no-cache-dir -r requirements.txt

# Pre-cache the ML model
RUN python -c "from sentence_transformers import CrossEncoder; CrossEncoder('cross-encoder/ms-marco-MiniLM-L6-v2')"

COPY . .

CMD [ "main.lambda_handler" ]
