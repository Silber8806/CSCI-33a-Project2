if [[ "$1" == "sass" ]]
then
    sass --watch static/css/styles.scss:static/css/styles.css &
fi

flask run --no-reload