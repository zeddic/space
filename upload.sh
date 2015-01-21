rsync -az --stats --progress \
    --exclude ".DS_Store" \
    --exclude "*.sh" \
    --exclude "*sublime*" \
    --exclude "*git*" \
    --exclude "*node*" \
    --exclude "test\*" \
    ../space/ \
    zeddic@www.zeddic.com:/home/zeddic/public_html/space
