FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY index.html ./index.html
COPY Readme.md ./Readme.md

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
