rsync -az --stats --progress \
    --exclude ".DS_Store" \
    --exclude "*.sh" \
    --exclude "*sublime*" \
    ../space/ \
    zeddic@zeddic.com:/home/zeddic/public_html/space
