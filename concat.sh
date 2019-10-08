echo "$@" | sed -e s/\([^ ]*\) /file \'\1\'\\n/g 
