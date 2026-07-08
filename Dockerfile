FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY support.js image-slot.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY og/ /usr/share/nginx/html/og/
COPY ["AhnoudCars.dc.html", "/usr/share/nginx/html/AhnoudCars.dc.html"]
COPY ["Inventory CMS.dc.html", "/usr/share/nginx/html/Inventory CMS.dc.html"]
COPY 404.dc.html /usr/share/nginx/html/404.dc.html
COPY admin/ /usr/share/nginx/html/admin/

# Serve the main page at / and wire nginx error_page to a plain 404.html path.
RUN cp /usr/share/nginx/html/AhnoudCars.dc.html /usr/share/nginx/html/index.html \
    && cp /usr/share/nginx/html/404.dc.html /usr/share/nginx/html/404.html

EXPOSE 80
