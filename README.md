# csss-pacmacro-test.github.io
test website

### info:
- this is an extension of pacmacro, intended to work on the sfu burnaby campus.
- it supports various improvements over the last version, such as being more cross-platform (webapp) & running on a low cost amazon ec2.micro instance.

### setup instructions:
- ssh into a google compute or amazon ec2 instance -> use debian please
- `sudo apt install git`
- git clone this repo. (feel free to delete everything except `/server-resources`)
- install python3 if it doesn't already exist -> something like `apt install python3` (it should just exist via `python3 --version`)
- update `password` file from "default" to something else
- open tcp port 7555 on the google firewall, turn on http mode (make sure firewall allows tcp port 80 for the webpages)
- run server script: `python3 server-resources/server.py`
- ...
- if you need more help @ me

### TODO: 
- restrict api key to https://csss-pacmacro-test.github.io/ only ?
- 
