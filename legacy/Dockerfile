FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        mysqli \
        pdo \
        pdo_mysql \
        intl \
        zip \
        opcache \
        curl \
        mbstring \
        xml

# Configure PHP
RUN echo 'opcache.enable=1' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.enable_cli=1' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'post_max_size=100M' >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo 'upload_max_filesize=100M' >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo 'memory_limit=512M' >> /usr/local/etc/php/conf.d/memory.ini

WORKDIR /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
