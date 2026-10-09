FROM python:3.11-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99

# 1. Instalar dependencias del sistema, entorno gráfico virtual Xvfb, noVNC, Nginx y Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    gnupg \
    ca-certificates \
    unzip \
    xvfb \
    fluxbox \
    x11vnc \
    novnc \
    websockify \
    nginx \
    supervisor \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar Google Chrome Stable oficial
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/trusted.gpg.d/google-chrome.gpg \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 3. Instalar dependencias de Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copiar código de scraping y configuraciones
COPY . /app/

# 5. Configurar Supervisor y Nginx
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 6. Crear carpetas de logs y almacenamiento
RUN mkdir -p /var/log/supervisor /app/productos_coronel

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
